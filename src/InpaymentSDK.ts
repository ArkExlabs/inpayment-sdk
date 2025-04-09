import { ethers } from 'ethers';
import {
  erc20ABI,
  paymentContractABI,
  vestingManagerABI,
  projectRegistryABI,
} from './contracts/abi';
import {
  InpaymentSDKOptions,
  ProjectInfo,
  BuyTokensOptions,
  TransactionResult,
} from './interfaces/types';
import { formatError, isValidAddress, toWei } from './utils';

/**
 * Inpayment SDK 主类
 */
export class InpaymentSDK {
  private provider: ethers.providers.JsonRpcProvider;
  //
  private projectRegistryAddress: string;
  private projectId: string;
  private projectInfo: ProjectInfo | null = null;

  /**
   * 构造函数
   * @param options SDK初始化选项
   */
  constructor(options: InpaymentSDKOptions) {
    this.projectId = options.projectId;
    this.projectRegistryAddress = options.projectRegistryAddress;
    const providerUrl = options.providerUrl;

    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);

    if (options.chainId) {
      this.provider.network.chainId = options.chainId;
    }
  }

  /**
   * 初始化SDK，获取项目信息
   */
  public async init(): Promise<ProjectInfo> {
    try {
      const projectRegistry = new ethers.Contract(
        this.projectRegistryAddress,
        projectRegistryABI,
        this.provider
      );

      const [paymentContractAddress, lockContractAddress] = await projectRegistry.getProject(
        this.projectId
      );
      // const paymentContractAddress = '0x647b133d614218E3CE42eF8665A83a4E22644723';
      // const lockContractAddress = '0xE843114e6bB236648EBEEE1D67C148D3cDb5e7b2';

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

      const tx = await paymentContract.buyTokensWithETH({
        value: toWei(options.amount),
      });

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
      const tx = await paymentContract.buyTokensWithToken(tokenAddress, amountWei);
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

      const tx = await vestingContract.releaseTokens();
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
  public async releaseAllTokens(signer: ethers.Signer): Promise<TransactionResult> {
    try {
      if (!this.projectInfo) {
        await this.init();
      }

      const vestingContract = new ethers.Contract(
        this.projectInfo!.lockContractAddress,
        vestingManagerABI,
        signer
      );

      const tx = await vestingContract.releaseAllTokens();
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
}
