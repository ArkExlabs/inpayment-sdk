/**
 * 初始化SDK的选项
 */
export interface InpaymentSDKOptions {
  projectId: string;
  providerUrl: string;
  projectRegistryAddress: string;
}

/**
 * 代币购买选项
 */
export interface BuyTokensOptions {
  amount: string | number; // 购买数量
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
  vestingType: VestingType;
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

/**
 * @dev 预售轮次信息结构体
 */
export interface Round {
  // 代币数量
  tokenAmount: number;
  // 代币价格（USD标准，单位：wei），例如 0.1 USD = 100000000000000000
  price: number;
  // 开始时间（UNIX时间戳）
  startTime: number;
  // 结束时间（UNIX时间戳）
  endTime: number;
  // 价格调整启用
  dynamicPriceEnabled: boolean;
  // 销售比例阈值（基点，10000 = 100%），达到后触发价格上调
  priceIncreaseThreshold: number;
  // 价格上调比例（基点，1000 = 10%），例如10%表示价格增加10%
  priceIncreaseRate: number;
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
  // 每个周期的释放比例（基点，10000 = 100%）- 用于周期释放
  periodReleasePercentage: number;
}

export interface ReferralConfig {
  // 是否启用推荐功能
  enabled: boolean;
  // 推荐人返点比例（基点，如2000表示20%）
  referrerRewardRate: number;
  // 被推荐人折扣比例（基点，如1000表示10%）
  refereeDiscountRate: number;
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
  rounds: Round[];
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
