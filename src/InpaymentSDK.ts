import {
  JsonRpcProvider,
  Contract,
  Signer,
  formatEther,
  parseEther,
  ZeroAddress,
  MaxUint256,
} from 'ethers';
import {
  erc20ABI,
  paymentContractABI,
  vestingManagerABI,
  projectRegistryABI,
  priceFeedManagerABI,
} from './contracts/abi';
import {
  InpaymentSDKOptions,
  ProjectInfo,
  BuyTokensOptions,
  TransactionResult,
  VestingSchedule,
} from './interfaces/types';
import { formatError, isValidAddress } from './utils';

/**
 * Inpayment SDK 主类
 */
export class InpaymentSDK {
  private provider: JsonRpcProvider;
  private projectRegistryAddress: string;
  private projectId: string;
  private priceFeedManagerAddress: string;
  private projectInfo: ProjectInfo | null = null;

  /**
   * 构造函数
   * @param options SDK初始化选项
   */
  constructor(options: InpaymentSDKOptions) {
    this.projectId = options.projectId;
    this.projectRegistryAddress = options.projectRegistryAddress;
    const providerUrl = options.providerUrl;

    this.provider = new JsonRpcProvider(providerUrl);
    this.priceFeedManagerAddress = options.priceFeedManagerAddress;
  }

  /**
   * 初始化SDK，获取项目信息
   */
  public async init(): Promise<ProjectInfo> {
    try {
      const projectRegistry = new Contract(
        this.projectRegistryAddress,
        projectRegistryABI,
        this.provider
      );

      const res = await projectRegistry.getProject(this.projectId);
      const paymentContractAddress = res[2];
      const lockContractAddress = res[3];

      if (!isValidAddress(paymentContractAddress) || !isValidAddress(lockContractAddress)) {
        throw new Error('Invalid contract address');
      }

      this.projectInfo = {
        projectOwner: res[0], // 项目所有者地址
        tokenAddress: res[1], // 代币合约地址
        paymentProcessor: res[2], // 支付处理器合约地址
        vestingManager: res[3], // 锁仓管理器合约地址
        rounds: res[4].map((round: any[]) => ({
          tokenAmount: formatEther(round[0]), // 本轮代币总量
          price: formatEther(round[1]), // 本轮代币价格
          startTime: round[2].toString(), // 本轮开始时间
          endTime: round[3].toString(), // 本轮结束时间
          dynamicPriceEnabled: round[4], // 是否启用动态价格
          priceIncreaseThreshold: round[5].toString(), // 价格增长阈值
          priceIncreaseRate: round[6].toString(), // 价格增长率
        })),
        maxTokensToBuy: formatEther(res[5]), // 最大可购买代币数量
        isActive: res[6], // 项目是否激活
        createdAt: res[7].toString(), // 项目创建时间
        vestingConfig: {
          enabled: res[8][0], // 是否启用锁仓
          vestingType: res[8][1], // 锁仓类型
          cliff: res[8][2].toString(), // 锁定期（秒）
          duration: res[8][3].toString(), // 释放期（秒）
          period: res[8][4].toString(), // 释放周期（秒）
          periodReleasePercentage: res[8][5].toString(), // 每期释放比例
        },
        referralConfig: {
          enabled: res[9][0], // 是否启用推荐
          referrerRewardRate: res[9][1].toString(), // 推荐人奖励比例
          refereeDiscountRate: res[9][2].toString(), // 被推荐人折扣比例
        },
      };

      return this.projectInfo;
    } catch (error) {
      throw new Error(`Initialization failed: ${formatError(error)}`);
    }
  }

  /**
   * 获取项目信息
   */
  public getProjectInfo(): ProjectInfo {
    if (!this.projectInfo) {
      throw new Error('SDK is not initialized, please call the init() method first');
    }
    return this.projectInfo;
  }

  private async getPaymentProcessor(signer?: Signer) {
    if (!this.projectInfo) {
      await this.init();
    }
    return new Contract(
      this.projectInfo!.paymentProcessor,
      paymentContractABI,
      signer || this.provider
    );
  }

  /**
   * 使用ETH购买代币
   */
  public async buyTokensWithETH(
    options: BuyTokensOptions,
    signer: Signer
  ): Promise<TransactionResult> {
    try {
      const paymentContract = await this.getPaymentProcessor(signer);

      const tx = await paymentContract.buyTokensWithETH(
        this.projectId,
        options.roundIndex,
        options.referrer || ZeroAddress,
        {
          value: parseEther(options.amount.toString()),
        }
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt?.hash || '',
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error),
      };
    }
  }

  /**
   * 使用ERC20代币购买
   */
  public async buyTokensWithToken(
    tokenAddress: string,
    options: BuyTokensOptions,
    signer: Signer
  ): Promise<TransactionResult> {
    try {
      if (!isValidAddress(tokenAddress)) {
        throw new Error('Invalid token address');
      }

      const tokenContract = new Contract(tokenAddress, erc20ABI, signer);
      const paymentContract = await this.getPaymentProcessor(signer);
      const amountWei = parseEther(options.amount.toString());

      // 检查用户余额是否足够
      const address = await signer.getAddress();
      const balance = await tokenContract.balanceOf(address);
      if (balance < amountWei) {
        throw new Error('Insufficient token balance');
      }

      // 检查授权额度
      const allowance = await tokenContract.allowance(address, this.projectInfo!.paymentProcessor);

      // 如果授权额度不足，进行授权
      if (allowance < amountWei) {
        const approveTx = await tokenContract.approve(
          this.projectInfo!.paymentProcessor,
          MaxUint256
        );
        await approveTx.wait();
      }

      // 购买代币
      const tx = await paymentContract.buyTokensWithToken(
        this.projectId,
        options.roundIndex,
        tokenAddress,
        amountWei,
        options.referrer || ZeroAddress
      );
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt?.hash || '',
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error),
      };
    }
  }

  /**
   * 获取代币锁仓计划数量
   * @param address 地址
   * @returns 锁仓计划数量
   */
  async getScheduleCount(address: string): Promise<number> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = new Contract(
        this.projectInfo!.vestingManager,
        vestingManagerABI,
        this.provider
      );

      const scheduleId = await vestingContract.getScheduleCount(address);

      return Number(scheduleId);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 获取代币锁仓计划
   * @param address 地址
   * @param scheduleId 锁仓计划ID
   * @returns 锁仓计划
   */
  public async getVestingScheduleInfo(params: {
    address: string;
    scheduleId: number;
  }): Promise<VestingSchedule> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = new Contract(
        this.projectInfo!.vestingManager,
        vestingManagerABI,
        this.provider
      );

      const scheduleInfo = await vestingContract.getVestingSchedule(
        params.address,
        params.scheduleId
      );

      const startTime = Number(scheduleInfo[3]);
      const cliff = Number(scheduleInfo[4]);
      const duration = Number(scheduleInfo[5]);

      return {
        beneficiary: scheduleInfo[0],
        amount: scheduleInfo[1].toString(),
        released: scheduleInfo[2].toString(),
        startTime: scheduleInfo[3].toString(),
        cliff: scheduleInfo[4].toString(),
        duration: scheduleInfo[5].toString(),
        vestingType: Number(scheduleInfo[6]),
        period: scheduleInfo[7].toString(),
        periodReleasePercentage: Number(scheduleInfo[8]),
        revoked: scheduleInfo[9],
        endTime: (startTime + cliff + duration).toString(),
        periodList: this.getPeriodList(startTime, startTime + cliff + duration),
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 获取周期列表
   * @param startTime 开始时间 秒
   * @param endTime 结束时间 秒
   * @returns 周期列表
   */
  getPeriodList(startTime: number, endTime: number) {
    const periodList = [];
    const period = 2 * 24 * 60 * 60; // 2天的秒数
    let currentTime = startTime + period; // 第一个周期的结束时间

    while (currentTime <= endTime) {
      periodList.push(currentTime.toString());
      currentTime += period;
    }

    // 如果最后一个周期超过endTime，添加endTime
    if (periodList.length === 0 || Number(periodList[periodList.length - 1]) < endTime) {
      periodList.push(endTime.toString());
    }

    return periodList;
  }

  /**
   * 释放代币
   */
  public async releaseTokens(signer: Signer): Promise<TransactionResult> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = await this.getVestingManager(signer);

      const address = await signer.getAddress();

      const scheduleId = await this.getScheduleCount(address);

      const tx = await vestingContract.releaseTokens(scheduleId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt?.hash || '',
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error),
      };
    }
  }

  /**
   * 释放所有代币
   */
  public async releaseAllTokens(params: {
    signer: Signer;
    startIdx: number;
    batchSize: number;
  }): Promise<TransactionResult> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = await this.getVestingManager(params.signer);

      const tx = await vestingContract.batchReleaseTokens(
        params.startIdx || 1,
        params.batchSize || 100
      );
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt?.hash || '',
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error),
      };
    }
  }

  /**
   * 获取代币价格
   * @param roundIndex 轮次索引
   * @param buyer 购买者地址
   * @param referrer 推荐人地址
   * @returns 代币价格和折扣价格
   */
  public async getTokenPrice(params: {
    buyer: string;
    referrer?: string;
  }): Promise<{ price: string; discountedPrice: string }> {
    try {
      const paymentContract = await this.getPaymentProcessor();

      const [price, discountedPrice] = await paymentContract.getTokenPrice(
        this.projectId,
        0,
        params.buyer,
        params.referrer || ZeroAddress
      );

      return {
        price: formatEther(price),
        discountedPrice: formatEther(discountedPrice),
      };
    } catch (error) {
      throw new Error(`Failed to get token price: ${formatError(error)}`);
    }
  }

  private async getVestingManager(signer: Signer) {
    if (!this.projectInfo) {
      await this.init();
    }
    return new Contract(this.projectInfo!.vestingManager, vestingManagerABI, signer);
  }

  // 获取当前项目进度
  public async getProjectProgress(): Promise<string> {
    try {
      const paymentContract = await this.getPaymentProcessor();
      // 获取已售代币数量
      const soldAmount = await paymentContract.roundSales(0);
      const soldAmountFormatted = formatEther(soldAmount);
      // 获取总代币数量
      const totalAmount = this.projectInfo!.rounds[0].tokenAmount;
      // 计算进度
      const progress = (Number(soldAmountFormatted) / Number(totalAmount)) * 100;
      return progress.toFixed(2);
    } catch (error) {
      return Promise.reject(error);
    }
  }
  async getTokenUsdValue(tokenAddress: string) {
    const priceFeed = new Contract(
      this.priceFeedManagerAddress,
      priceFeedManagerABI,
      this.provider
    );
    const price = await priceFeed.getTokenUsdValue(tokenAddress, 1);
    return price;
  }
}
