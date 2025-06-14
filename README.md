# Inpayment SDK

Inpayment SDK 是一个用于链上交互的 JS SDK。它提供了购买代币、释放代币等功能。

## 依赖要求

本SDK依赖 `ethers v6` 作为核心依赖，使用前请确保安装：

```bash
pnpm add ethers@^6.0.0
# 或
npm install ethers@^6.0.0
# 或
yarn add ethers@^6.0.0
```

## 安装

```bash
pnpm add inpayment-sdk
# 或
npm install inpayment-sdk
# 或
yarn add inpayment-sdk
```

## 初始化

### 申请成为项目方

1. 访问[Inpayment官方网站](https://www/inpayment.io)完成申请成为项目方流程
2. 48小时内审核完成
3. 审核通过后可创建项目，并复制`projectId`及`projectRegistryAddress`字段初始化SDK实例

### 初始化 SDK 实例：

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

// 初始化 provider
const provider = new JsonRpcProvider('https://your-rpc-url');

// 初始化 signer（用于发送交易）
const signer = new Wallet('your-private-key', provider);
// 或者使用 MetaMask 的 provider
// const signer = await provider.getSigner();

const sdk = new InpaymentSDK({
  projectId: 'your-project-id',
  providerUrl: 'https://your-rpc-url',
  projectRegistryAddress: '0x...', // 项目注册合约地址
  priceFeedManagerAddress: '0x...', // 价格预言机合约地址
});

// 初始化SDK
await sdk.init();
```

## 类型定义

### InpaymentSDKOptions

初始化SDK的选项：

```typescript
interface InpaymentSDKOptions {
  projectId: string; // 项目ID
  providerUrl: string; // RPC节点URL
  projectRegistryAddress: string; // 项目注册合约地址
  priceFeedManagerAddress: string; // 价格预言机合约地址
}
```

### ProjectInfo

项目信息：

```typescript
interface ProjectInfo {
  projectOwner: string; // 项目方钱包地址
  tokenAddress: string; // 项目代币地址
  paymentProcessor: string; // 支付处理器合约地址
  vestingManager: string; // 锁仓管理器合约地址
  rounds: Round; // 预售轮次信息
  maxTokensToBuy: string; // 单个用户可以购买的最大代币数量
  isActive: boolean; // 是否激活
  createdAt: number; // 项目创建时间
  vestingConfig: VestingConfig; // 锁仓配置
  referralConfig: ReferralConfig; // 推荐配置
}
```

### Round

预售轮次信息：

```typescript
interface Round {
  tokenAmount: string; // 代币数量
  price: string; // 代币价格（USD标准，单位：wei），例如 0.1 USD = 100000000000000000
  startTime: number; // 开始时间（UNIX时间戳）
  endTime: number; // 结束时间（UNIX时间戳）
  dynamicPriceEnabled: boolean; // 价格调整启用
  priceIncreaseThreshold: string; // 销售比例阈值（百分比，如"50"表示50%）
  priceIncreaseRate: string; // 价格上调比例（百分比，如"10"表示10%）
}
```

### VestingConfig

锁仓配置：

```typescript
interface VestingConfig {
  enabled: boolean; // 是否启用
  vestingType: VestingType; // 锁仓类型
  cliff: number; // 悬崖期（单位：秒）
  duration: number; // 锁仓期（单位：秒）
  period: number; // 周期（单位：秒）- 用于周期释放
  periodReleasePercentage: string; // 每个周期的释放比例（百分比，如"10"表示10%）
}
```

### VestingType

锁仓类型枚举：

```typescript
enum VestingType {
  LINEAR = 1, // 线性释放
  STEP = 2, // 阶梯释放
}
```

### ReferralConfig

推荐配置：

```typescript
interface ReferralConfig {
  enabled: boolean; // 是否启用推荐功能
  referrerRewardRate: string; // 推荐人返点比例（如"20"表示20%）
  refereeDiscountRate: string; // 被推荐人折扣比例（如"10"表示10%）
}
```

### BuyTokensOptions

代币购买选项：

```typescript
interface BuyTokensOptions {
  amount: string | number; // 购买数量
  referrer?: string; // 推荐人地址（可选）
}
```

### TransactionResult

合约操作结果：

```typescript
interface TransactionResult {
  success: boolean; // 操作是否成功
  transactionHash?: string; // 交易哈希（可选）
  error?: string; // 错误信息（可选）
}
```

### VestingSchedule

锁仓计划：

```typescript
interface VestingSchedule {
  beneficiary: string; // 受益人地址
  amount: string; // 锁仓的代币总量
  released: string; // 已释放的代币数量
}
```

## 主要功能

### 1. 获取项目信息

```typescript
const projectInfo = sdk.getProjectInfo();
```

### 2. 使用ETH购买代币

```typescript
const result = await sdk.buyTokensWithETH(
  {
    amount: '1.0', // ETH数量
    referrer: '0x...', // 可选，推荐人地址
  },
  signer
);
```

### 3. 使用ERC20代币购买

```typescript
const result = await sdk.buyTokensWithToken(
  tokenAddress, // ERC20代币地址
  {
    amount: '100', // 代币数量
    referrer: '0x...', // 可选，推荐人地址
  },
  signer
);
```

### 4. 获取锁仓计划

```typescript
const schedule = await sdk.getVestingScheduleInfo({
  address: '0x...', // 地址
});
```

### 5. 释放代币

```typescript
const result = await sdk.releaseTokens(signer);
```

### 6. 获取可释放代币数量

```typescript
// 获取当前可释放的代币数量
const amount = await sdk.getReleaseAmount(signer);
```

### 7. 获取项目解锁时间

```typescript
// 获取项目的解锁时间信息
const unlockTimeInfo = await sdk.getUnlockTime();

// 返回值类型
interface UnlockTimeInfo {
  currentUnlockTime: number; // 当前周期的解锁时间（UNIX时间戳）
  unlockTimeList: number[]; // 所有解锁时间点列表（UNIX时间戳数组）
}
```

锁仓释放逻辑说明：

1. 自动释放（悬崖期）
   - 条件：项目开启自动释放（vestingConfig.enabled = true）
   - 第一次可领取时间 = 预售结束时间 + 悬崖期 + 周期
2. 手动释放（项目方指定）
   - 条件：项目方手动设置释放时间
   - 第一次可领取时间 = 项目方设置的释放时间 + 周期
3. 默认释放（30天后）
   - 条件：项目方未开启自动释放且未手动设置释放时间
   - 第一次可领取时间 = 预售结束时间 + 30天 + 周期

示例：
假设预售时间是 4.21 - 4.23，悬崖期 1 天，周期 5 天，每个周期释放 20%：

- 自动释放：4.23 + 1天 + 5天 = 4.29
- 手动释放（4.25开启）：4.25 + 5天 = 4.30
- 默认释放：4.23 + 30天 + 5天 = 5.28

### 8. 获取项目进度

```typescript
// 获取项目销售进度（返回百分比）
const progress = await sdk.getProjectProgress();
```

### 9. 获取代币USD价格

```typescript
// 获取指定代币的USD价格
const price = await sdk.getTokenUsdValue(tokenAddress);
```

### 10. 获取代币价格

```typescript
// 获取代币价格（包含折扣价格）
const { price, discountedPrice } = await sdk.getTokenPrice({
  buyer: '0x...', // 购买者地址
  referrer: '0x...', // 可选，推荐人地址
});
```

## 开放 API 访问和用法

在开始使用 开放 API 之前，你需要先在[Inpayment官方网站](https://www/inpayment.io)完成申请成为项目方获取`APIKEY`

### 鉴权

所有对 API 发起访问的请求都需要包括下面信息来进行身份认证。

- x-api-key ：APIKEY

### API 使用

访问[API](https://apifox.com/apidoc/shared/f0fb9ff4-abef-4667-9778-dca8adf37dea)获取项目相关信息

1. [获取实时代币销售价格](https://ai.imbe.me/v1/payment/user/token/price)
2. [获取用户购买项目代币的历史交易记录（含项目方直接转账）](https://ai.imbe.me/v1/payment/user/token/trades)
3. [合约交互: 获取用户在指定项目中的可释放代币总数](https://ai.imbe.me/v1/payment/user/releasable)
4. [获取用户的锁仓历史记录](https://ai.imbe.me/v1/payment/user/schedules)
5. [获取用户的代币释放历史记录](https://ai.imbe.me/v1/payment/user/releases)

## 注意事项

1. 在使用 SDK 之前，请确保已经正确初始化
2. SDK 依赖 ethers v6，所有涉及交易的方法都需要提供有效的 `ethers.Signer` 实例
3. 如果您的项目使用的是 ethers v5，需要先升级到 v6
4. 建议在使用前先检查项目信息是否正确

## 示例代码

完整的示例代码可以在 `examples` 目录中找到。这些示例展示了如何使用 SDK 的各种功能。
