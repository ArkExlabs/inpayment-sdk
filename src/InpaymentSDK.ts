import { ethers } from 'ethers';
import {
  erc20ABI,
  paymentContractABI,
  vestingManagerABI,
  // projectRegistryABI,
} from './contracts/abi';
import {
  InpaymentSDKOptions,
  ProjectInfo,
  BuyTokensOptions,
  TransactionResult,
  VestingSchedule,
} from './interfaces/types';
import { formatError, isValidAddress, toWei } from './utils';
import dayjs from 'dayjs';

/**
 * Inpayment SDK 主类
 */
export class InpaymentSDK {
  private provider: ethers.providers.JsonRpcProvider;
  //
  // private projectRegistryAddress: string;
  private projectId: string;
  private projectInfo: ProjectInfo | null = null;

  /**
   * 构造函数
   * @param options SDK初始化选项
   */
  constructor(options: InpaymentSDKOptions) {
    this.projectId = options.projectId;
    // this.projectRegistryAddress = options.projectRegistryAddress;
    const providerUrl = options.providerUrl;

    const providerOptions = {
      chainId: options.chainId || 1,
      name: 'custom',
    };

    this.provider = new ethers.providers.JsonRpcProvider(
      providerUrl,
      options.chainId ? providerOptions : undefined
    );

    if (options.chainId) {
      this.provider.network.chainId = options.chainId;
    }
  }

  /**
   * 初始化SDK，获取项目信息
   */
  public async init(): Promise<ProjectInfo> {
    try {
      // const projectRegistry = new ethers.Contract(
      //   this.projectRegistryAddress,
      //   projectRegistryABI,
      //   this.provider
      // );

      // const [paymentContractAddress, lockContractAddress] = await projectRegistry.getProject(
      //   this.projectId
      // );
      const paymentContractAddress = '0x647b133d614218E3CE42eF8665A83a4E22644723';
      const lockContractAddress = '0xE843114e6bB236648EBEEE1D67C148D3cDb5e7b2';

      if (!isValidAddress(paymentContractAddress) || !isValidAddress(lockContractAddress)) {
        throw new Error('Invalid contract address');
      }

      this.projectInfo = {
        paymentContractAddress,
        lockContractAddress,
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

  /**
   * 使用ETH购买代币
   */
  public async buyTokensWithETH(
    options: BuyTokensOptions,
    signer: ethers.Signer
  ): Promise<TransactionResult> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const paymentContract = new ethers.Contract(
        this.projectInfo!.paymentContractAddress,
        paymentContractABI,
        signer
      );

      const tx = await paymentContract.buyTokensWithETH(
        this.projectId,
        options.roundIndex,
        options.referrer || ethers.constants.AddressZero,
        {
          value: toWei(options.amount),
        }
      );

      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
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
    signer: ethers.Signer
  ): Promise<TransactionResult> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      if (!isValidAddress(tokenAddress)) {
        throw new Error('Invalid token address');
      }

      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
      const paymentContract = new ethers.Contract(
        this.projectInfo!.paymentContractAddress,
        paymentContractABI,
        signer
      );

      // 授权支付合约使用代币
      const amountWei = toWei(options.amount);
      const approveTx = await tokenContract.approve(
        this.projectInfo!.paymentContractAddress,
        amountWei
      );
      await approveTx.wait();

      // 购买代币
      const tx = await paymentContract.buyTokensWithToken(
        this.projectId,
        options.roundIndex,
        amountWei,
        tokenAddress,
        options.referrer || ethers.constants.AddressZero
      );
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
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

      const vestingContract = new ethers.Contract(
        this.projectInfo!.lockContractAddress,
        vestingManagerABI,
        this.provider
      );

      const scheduleId = await vestingContract.getScheduleCount(address);

      return scheduleId.toNumber();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * 获取代币锁仓计划
   * @param address 地址
   * @returns 锁仓计划
   */
  async getVestingScheduleInfo(params: {
    address: string;
    scheduleId: number;
  }): Promise<VestingSchedule> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = new ethers.Contract(
        this.projectInfo!.lockContractAddress,
        vestingManagerABI,
        this.provider
      );

      const scheduleInfo = await vestingContract.getVestingSchedule(
        params.address,
        params.scheduleId
      );

      const startTime = dayjs(scheduleInfo[3] * 1000).format('YYYY-MM-DD HH:mm:ss');
      const cliff = Number(scheduleInfo[4]);
      const duration = Number(scheduleInfo[5]);
      const endTime = dayjs(startTime)
        .add(cliff + duration, 'days')
        .format('YYYY-MM-DD HH:mm:ss');

      const periodList = this.getPeriodList(
        dayjs(startTime).add(cliff, 'days').unix(),
        dayjs(endTime).unix()
      ).map((item) => dayjs(item * 1000).format('YYYY-MM-DD HH:mm:ss'));

      const info: VestingSchedule = {
        beneficiary: scheduleInfo[0],
        amount: ethers.utils.formatEther(scheduleInfo[1]),
        released: ethers.utils.formatEther(scheduleInfo[2]),
        startTime,
        cliff,
        duration,
        vestingType: scheduleInfo[6],
        period: Number(scheduleInfo[7]),
        periodReleasePercentage: scheduleInfo[8].toNumber(),
        revoked: scheduleInfo[9],
        endTime,
        periodList,
      };
      return info;
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
  getPeriodList(startTime: number, endTime: number): number[] {
    const periodList = [];
    const period = 2 * 24 * 60 * 60; // 2天的秒数
    let currentTime = startTime + period; // 第一个周期的结束时间

    while (currentTime <= endTime) {
      periodList.push(currentTime);
      currentTime += period;
    }

    // 如果最后一个周期超过endTime，添加endTime
    if (periodList.length === 0 || periodList[periodList.length - 1] < endTime) {
      periodList.push(endTime);
    }

    return periodList;
  }

  /**
   * 释放代币
   */
  public async releaseTokens(signer: ethers.Signer): Promise<TransactionResult> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = new ethers.Contract(
        this.projectInfo!.lockContractAddress,
        vestingManagerABI,
        signer
      );

      const address = await signer.getAddress();

      const scheduleId = await this.getScheduleCount(address);

      const tx = await vestingContract.releaseTokens(scheduleId);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
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
    signer: ethers.Signer;
    startIdx: number;
    batchSize: number;
  }): Promise<TransactionResult> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = new ethers.Contract(
        this.projectInfo!.lockContractAddress,
        vestingManagerABI,
        params.signer
      );

      const tx = await vestingContract.releaseAllTokens(
        params.startIdx || 1,
        params.batchSize || 100
      );
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      return {
        success: false,
        error: formatError(error),
      };
    }
  }

  // 项目方直接转账代币

  transferToken() {
    throw new Error('Not implemented');
  }

  // 获取代币价格
  getTokenPrice() {
    throw new Error('Not implemented');
  }
}
