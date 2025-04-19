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

首先需要初始化 SDK 实例：

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
  rounds: Round[]; // 预售轮次信息
  maxTokensToBuy: string; // 单个用户在每个轮次中可以购买的最大代币数量
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
  tokenAmount: number; // 代币数量
  price: number; // 代币价格（USD标准，单位：wei）
  startTime: number; // 开始时间（UNIX时间戳）
  endTime: number; // 结束时间（UNIX时间戳）
  dynamicPriceEnabled: boolean; // 价格调整启用
  priceIncreaseThreshold: number; // 销售比例阈值（基点，10000 = 100%）
  priceIncreaseRate: number; // 价格上调比例（基点，1000 = 10%）
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
  periodReleasePercentage: number; // 每个周期的释放比例（基点，10000 = 100%）
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
  referrerRewardRate: number; // 推荐人返点比例（基点，如2000表示20%）
  refereeDiscountRate: number; // 被推荐人折扣比例（基点，如1000表示10%）
}
```

### BuyTokensOptions

代币购买选项：

```typescript
interface BuyTokensOptions {
  amount: string | number; // 购买数量
  roundIndex: number; // 轮次索引
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
  startTime: string; // 开始时间
  cliff: number; // 悬崖期
  duration: number; // 锁仓期
  vestingType: VestingType; // 锁仓类型
  period: number; // 周期
  periodReleasePercentage: number; // 每个周期的释放比例
  revoked: boolean; // 是否已完全释放
  endTime: string; // 结束时间
  periodList: string[]; // 周期列表
}
```

## 主要功能

### 1. 获取项目信息

```typescript
const projectInfo = sdk.getProjectInfo();
```

### 2. 使用ETH购买代币

```typescript
import { Wallet } from 'ethers';

// 初始化 signer
const signer = new Wallet('your-private-key', provider);
// 或者使用 MetaMask 的 provider
// const signer = await provider.getSigner();

const result = await sdk.buyTokensWithETH(
  {
    amount: '1.0', // ETH数量
    roundIndex: 0, // 轮次索引
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
    roundIndex: 0, // 轮次索引
    referrer: '0x...', // 可选，推荐人地址
  },
  signer
);
```

### 4. 获取锁仓计划

```typescript
const scheduleCount = await sdk.getScheduleCount(address);
const schedule = await sdk.getVestingScheduleInfo({
  address: '0x...', // 地址
  scheduleId: 0, // 锁仓计划ID
});
```

### 5. 释放代币

```typescript
// 释放单个锁仓计划的代币
const result = await sdk.releaseTokens(signer);

// 批量释放代币
const result = await sdk.releaseAllTokens({
  signer,
  startIdx: 0, // 起始索引
  batchSize: 10, // 批量大小
});
```

### 6. 获取代币价格

```typescript
const price = await sdk.getTokenPrice({
  buyer: '0x...', // 购买者地址
  referrer: '0x...', // 可选，推荐人地址
});
```

## 接口说明

### ProjectInfo

| 字段                   | 类型   | 说明         |
| ---------------------- | ------ | ------------ |
| paymentContractAddress | string | 支付合约地址 |
| lockContractAddress    | string | 锁仓合约地址 |

### BuyTokensOptions

| 字段       | 类型             | 必填 | 说明       |
| ---------- | ---------------- | ---- | ---------- |
| amount     | string \| number | 是   | 购买数量   |
| account    | string           | 是   | 账户地址   |
| roundIndex | number           | 是   | 轮次索引   |
| referrer   | string           | 否   | 推荐人地址 |

### TransactionResult

| 字段            | 类型    | 说明               |
| --------------- | ------- | ------------------ |
| success         | boolean | 交易是否成功       |
| transactionHash | string  | 交易哈希（成功时） |
| error           | string  | 错误信息（失败时） |

## 错误处理

SDK 会自动处理常见的错误，并返回格式化的错误信息。所有方法都会返回 `TransactionResult` 对象，包含交易状态和相关信息。

## 注意事项

1. 在使用 SDK 之前，请确保已经正确初始化
2. SDK 依赖 ethers v6，所有涉及交易的方法都需要提供有效的 `ethers.Signer` 实例
3. 如果您的项目使用的是 ethers v5，需要先升级到 v6
4. 建议在使用前先检查项目信息是否正确

## 示例代码

完整的示例代码可以在 `examples` 目录中找到。这些示例展示了如何使用 SDK 的各种功能。
