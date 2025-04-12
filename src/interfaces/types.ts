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
  roundIndex: number; // 轮次索引
  referrer?: string; // 推荐人地址
}

/**
 * 合约操作结果
 */
export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * 锁仓计划
 */

export interface VestingSchedule {
  // 受益人地址
  beneficiary: string;
  // 锁仓的代币总量
  amount: string;
  // 已释放的代币数量
  released: string;
  // 开始时间
  startTime: string;
  // 悬崖期
  cliff: number;
  // 锁仓期
  duration: number;
  // 锁仓类型
  vestingType: 1 | 2; // 1: 线性释放 2: 阶梯释放
  // 周期
  period: number;
  // 每个周期的释放比例
  periodReleasePercentage: number;
  // 是否已完全释放
  revoked: boolean;
  // 结束时间
  endTime: string;
  // 周期列表
  periodList: string[];
}
