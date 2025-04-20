/**
 * 初始化SDK的选项
 */
export interface InpaymentSDKOptions {
  projectId: string;
  providerUrl: string;
  projectRegistryAddress: string;
  priceFeedManagerAddress: string;
}

/**
 * 代币购买选项
 */
export interface BuyTokensOptions {
  amount: string | number; // 购买数量
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

export enum VestingType {
  LINEAR = 1, // 线性释放
  STEP = 2, // 阶梯释放
}

/**
 * 锁仓计划
 */

export interface VestingSchedule {
  // 受益人地址
  beneficiary: string;
  // 锁仓代币数量
  amount: string;
  // 已释放代币数量
  released: string;
}

/**
 * @dev 预售轮次信息结构体
 */
export interface Round {
  // 代币数量
  tokenAmount: string;
  // 代币价格（USD标准，单位：wei），例如 0.1 USD = 100000000000000000
  price: string;
  // 开始时间（UNIX时间戳）
  startTime: number;
  // 结束时间（UNIX时间戳）
  endTime: number;
  // 价格调整启用
  dynamicPriceEnabled: boolean;
  // 销售比例阈值（百分比，如"50"表示50%）
  priceIncreaseThreshold: string;
  // 价格上调比例（百分比，如"10"表示10%）
  priceIncreaseRate: string;
}

/**
 * @dev 锁仓配置
 */
export interface VestingConfig {
  // 是否启用
  enabled: boolean;
  // 锁仓类型
  vestingType: VestingType;
  // 悬崖期（单位：秒）
  cliff: number;
  // 锁仓期（单位：秒）
  duration: number;
  // 周期（单位：秒）- 用于周期释放
  period: number;
  // 每个周期的释放比例（百分比，如"10"表示10%）
  periodReleasePercentage: string;
}

export interface ReferralConfig {
  // 是否启用推荐功能
  enabled: boolean;
  // 推荐人返点比例（百分比，如20表示20%）
  referrerRewardRate: string;
  // 被推荐人折扣比例（百分比，如10表示10%）
  refereeDiscountRate: string;
}
export interface ProjectInfo {
  // 项目方钱包地址
  projectOwner: string;
  // 项目代币地址
  tokenAddress: string;
  // 支付处理器合约地址
  paymentProcessor: string;
  // 锁仓管理器合约地址
  vestingManager: string;
  // 预售轮次信息
  rounds: Round;
  // 单个用户在每个轮次中可以购买的最大代币数量
  // 作用：1.防止大户垄断预售; 2.控制每个用户的购买上限，确保代币分配更加公平
  maxTokensToBuy: string;
  // 是否激活
  isActive: boolean;
  // 项目创建时间
  createdAt: number;
  // 锁仓配置
  vestingConfig: VestingConfig;
  // 推荐配置
  referralConfig: ReferralConfig;
}

export interface UnlockTimeInfo {
  currentUnlockTime: number;
  unlockTimeList: number[];
}
