import { InpaymentSDK } from './InpaymentSDK';
import * as utils from './utils';
import type {
  InpaymentSDKOptions,
  ProjectInfo,
  BuyTokensOptions,
  TransactionResult,
} from './interfaces/types';

// 导出类和工具函数
export { InpaymentSDK, utils };

// 导出类型定义
export type { InpaymentSDKOptions, ProjectInfo, BuyTokensOptions, TransactionResult };

// 默认导出主类
export default InpaymentSDK;
