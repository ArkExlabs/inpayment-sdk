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
  UnlockTimeInfo,
  VestingType,
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
        rounds: {
          tokenAmount: formatEther(res[4].tokenAmount), // 本轮代币总量
          price: formatEther(res[4].price), // 本轮代币价格
          startTime: Number(res[4].startTime), // 本轮开始时间
          endTime: Number(res[4].endTime), // 本轮结束时间
          dynamicPriceEnabled: res[4].dynamicPriceEnabled, // 是否启用动态价格
          priceIncreaseThreshold: (Number(res[4].priceIncreaseThreshold) / 100).toFixed(2), // 价格增长阈值
          priceIncreaseRate: (Number(res[4].priceIncreaseRate) / 100).toFixed(2), // 价格增长率
        },
        maxTokensToBuy: formatEther(res[5]), // 最大可购买代币数量
        isActive: res[6], // 项目是否激活
        createdAt: res[7].toString(), // 项目创建时间
        vestingConfig: {
          enabled: res[8].isAuto, // 是否启用锁仓
          vestingType: Number(res[8].vestingType), // 锁仓类型
          cliff: res[8].cliff.toString(), // 锁定期（秒）
          duration: res[8].duration.toString(), // 释放期（秒）
          period: res[8].period.toString(), // 释放周期（秒）
          periodReleasePercentage: (Number(res[8].periodReleasePercentage) / 100).toFixed(2), // 每期释放比例
        },
        referralConfig: {
          enabled: res[9].enabled, // 是否启用推荐
          referrerRewardRate: (Number(res[9].referrerRewardRate) / 100).toFixed(2), // 推荐人奖励比例（%）
          refereeDiscountRate: (Number(res[9].refereeDiscountRate) / 100).toFixed(2), // 被推荐人折扣比例（%）
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
    if (!this.projectInfo) {
      throw new Error('Failed to initialize project info');
    }
    return new Contract(
      this.projectInfo.paymentProcessor,
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
   * 获取代币锁仓计划
   * @param address 地址
   * @returns 锁仓计划
   */
  public async getVestingScheduleInfo(params: { address: string }): Promise<VestingSchedule> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = new Contract(
        this.projectInfo!.vestingManager,
        vestingManagerABI,
        this.provider
      );

      const scheduleInfo = await vestingContract.getVestingSchedule(this.projectId, params.address);
      return {
        beneficiary: scheduleInfo[0],
        amount: formatEther(scheduleInfo[1]),
        released: formatEther(scheduleInfo[2]),
      };
    } catch (error) {
      throw new Error(`Failed to get vesting schedule: ${formatError(error)}`);
    }
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

      const tx = await vestingContract.releaseTokens(this.projectId);
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

  /**
   * 获取锁仓管理器合约
   * @param signer 签名者
   * @returns 锁仓管理器合约
   */
  private async getVestingManager(signer: Signer) {
    if (!this.projectInfo) {
      await this.init();
    }
    if (!this.projectInfo) {
      throw new Error('Failed to initialize project info');
    }
    return new Contract(this.projectInfo.vestingManager, vestingManagerABI, signer);
  }

  // 获取当前项目进度
  public async getProjectProgress(): Promise<string> {
    try {
      const paymentContract = await this.getPaymentProcessor();
      // 获取已售代币数量
      const soldAmount = await paymentContract.projectSales(this.projectId);
      const soldAmountFormatted = formatEther(soldAmount);
      // 获取总代币数量
      const totalAmount = this.projectInfo!.rounds.tokenAmount;
      // 计算进度
      const progress = (Number(soldAmountFormatted) / Number(totalAmount)) * 100;
      return progress.toFixed(2);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 获取代币价格
   * @param tokenAddress 代币地址
   * @returns 代币价格
   */
  async getTokenUsdValue(tokenAddress: string) {
    const priceFeed = new Contract(
      this.priceFeedManagerAddress,
      priceFeedManagerABI,
      this.provider
    );
    const price = await priceFeed.getTokenUsdValue(tokenAddress, 1);
    return price;
  }

  /**
   * 获取可释放代币数量
   * @param signer 签名者
   * @returns 可释放代币数量
   */
  public async getReleaseAmount(signer: Signer): Promise<string> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = new Contract(
        this.projectInfo!.vestingManager,
        vestingManagerABI,
        this.provider
      );

      const address = await signer.getAddress();
      const releaseAmount = await vestingContract.getReleasableAmount(this.projectId, address);
      return formatEther(releaseAmount);
    } catch (error) {
      throw new Error(`Failed to get releasable amount: ${formatError(error)}`);
    }
  }

  /**
   * 获取当前项目的解锁时间
   * @returns 当前周期解锁时间和解锁时间列表
   * @description
   * 1. 如果 releaseStartTime 为 0，表示项目方没有开启释放，使用默认 30 天
   *    - 第一次可领取时间 = endTime + 30天 + period
   * 2. 如果 releaseStartTime 不为 0，表示项目方已设置释放时间
   *    - 第一次可领取时间 = releaseStartTime + period
   */

  /**
   * 不锁仓，预售结束全部释放，用户可以领取全部
   * 线性释放， 悬崖期结束后，每秒线性释放，锁仓期结束即全部释放完
   * 周期释放， 悬崖期结束后，进入周期释放，每周期释放一定比例
   */
  public async getUnlockTime(): Promise<UnlockTimeInfo> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingConfig = this.projectInfo!.vestingConfig;
      const vestingType = vestingConfig.vestingType;
      const enabled = vestingConfig.enabled;
      const period = Number(vestingConfig.period);
      const cliff = Number(vestingConfig.cliff);
      const duration = Number(vestingConfig.duration);
      const periodReleasePercentage = Number(vestingConfig.periodReleasePercentage);
      const endTime = this.projectInfo!.rounds.endTime;
      const now = Math.floor(Date.now() / 1000);

      const vestingContract = new Contract(
        this.projectInfo!.vestingManager,
        vestingManagerABI,
        this.provider
      );

      // 如果项目方没有开启释放，使用默认 30 天
      const time = !this.projectInfo!.vestingConfig.enabled
        ? await vestingContract.releaseStartTime(this.projectId)
        : endTime + cliff;

      const releaseStartTime = Number(time);

      let unlockTimeList: number[] = [];
      let currentUnlockTime = 0;

      // 不锁仓，预售结束全部释放
      if (!enabled || vestingType === VestingType.None) {
        const unlockTime = releaseStartTime;
        unlockTimeList = [unlockTime];
        currentUnlockTime = unlockTime;
        return {
          currentUnlockTime,
          unlockTimeList,
        };
      }

      const firstReleaseTime = releaseStartTime + period;

      // 线性释放
      if (vestingType === VestingType.LINEAR) {
        // 线性释放只需关心 cliffEnd 和 linearEnd
        // 这里 firstReleaseTime 作为 cliffEnd
        const linearEnd = firstReleaseTime + duration;
        unlockTimeList = [firstReleaseTime, linearEnd];
        currentUnlockTime = unlockTimeList.find((t) => t > now) || linearEnd;
        return {
          currentUnlockTime,
          unlockTimeList,
        };
      }

      // 周期释放
      if (vestingType === VestingType.STEP) {
        if (period <= 0 || periodReleasePercentage <= 0) {
          // 参数异常，无法生成解锁时间
          return {
            currentUnlockTime: 0,
            unlockTimeList: [],
          };
        }
        unlockTimeList = [firstReleaseTime];
        const totalPeriods = Math.ceil(100 / periodReleasePercentage);
        for (let i = 1; i < totalPeriods; i++) {
          const periodTime = firstReleaseTime + period * i;
          if (periodTime > firstReleaseTime + duration) {
            if (!unlockTimeList.includes(firstReleaseTime + duration)) {
              unlockTimeList.push(firstReleaseTime + duration);
            }
            break;
          }
          unlockTimeList.push(periodTime);
        }
        currentUnlockTime =
          unlockTimeList.find((t) => t > now) || unlockTimeList[unlockTimeList.length - 1];
        return {
          currentUnlockTime,
          unlockTimeList,
        };
      }

      // 其他异常情况
      return {
        currentUnlockTime: 0,
        unlockTimeList: [],
      };
    } catch (error) {
      throw new Error(`Failed to get unlock time: ${formatError(error)}`);
    }
  }

  /**
   * 获取锁仓类型
   * @returns 锁仓类型 1: 线性释放 2: 阶梯释放 线性释放表示每一秒都会释放，阶梯释放表示每隔一段时间释放一次
   */
  public async getVestingType(): Promise<number> {
    return this.projectInfo!.vestingConfig.vestingType;
  }
}
