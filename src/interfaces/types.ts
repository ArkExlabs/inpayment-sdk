/**
 * 项目信息接口
 */
export interface ProjectInfo {
  paymentContractAddress: string;
  lockContractAddress: string;
}

/**
 * 初始化SDK的选项
 */
export interface InpaymentSDKOptions {
  projectId: string;
  providerUrl: string;
  projectRegistryAddress: string;
  chainId?: number;
}

/**
 * 代币购买选项
 */
export interface BuyTokensOptions {
  amount: string | number; // 购买数量
  account: string; // 账户地址
}

/**
 * 合约操作结果
 */
export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}
