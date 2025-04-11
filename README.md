# Inpayment SDK

Inpayment SDK 是一个用于链上交互的 JS SDK。它提供了购买代币、释放代币等功能。

## 安装

```bash
npm install inpayment-sdk
# 或
yarn add inpayment-sdk
```

## 初始化

首先需要初始化 SDK 实例：

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

const sdk = new InpaymentSDK({
  projectId: 'your-project-id',
  providerUrl: 'https://your-rpc-url',
  projectRegistryAddress: '0x...', // 项目注册合约地址
  chainId: 1, // 可选，默认为1
});

// 初始化SDK
await sdk.init();
```

### 初始化参数说明

| 参数                   | 类型   | 必填 | 说明             |
| ---------------------- | ------ | ---- | ---------------- |
| projectId              | string | 是   | 项目ID           |
| providerUrl            | string | 是   | RPC节点URL       |
| projectRegistryAddress | string | 是   | 项目注册合约地址 |
| chainId                | number | 否   | 链ID，默认为1    |

## 主要功能

### 1. 获取项目信息

```typescript
const projectInfo = sdk.getProjectInfo();
console.log(projectInfo);
// 输出: { paymentContractAddress: '0x...', lockContractAddress: '0x...' }
```

### 2. 使用ETH购买代币

```typescript
const signer = new ethers.Wallet(privateKey, provider);

const result = await sdk.buyTokensWithETH(
  {
    amount: '1.0', // ETH数量
    account: '0x...', // 购买者地址
    roundIndex: 0, // 轮次索引
    referrer: '0x...', // 可选，推荐人地址
  },
  signer
);

if (result.success) {
  console.log('Transaction hash:', result.transactionHash);
} else {
  console.error('Error:', result.error);
}
```

### 3. 使用ERC20代币购买

```typescript
const signer = new ethers.Wallet(privateKey, provider);

const result = await sdk.buyTokensWithToken(
  '0x...', // ERC20代币合约地址
  {
    amount: '100.0', // 代币数量
    account: '0x...', // 购买者地址
    roundIndex: 0, // 轮次索引
    referrer: '0x...', // 可选，推荐人地址
  },
  signer
);

if (result.success) {
  console.log('Transaction hash:', result.transactionHash);
} else {
  console.error('Error:', result.error);
}
```

### 4. 释放代币

```typescript
const signer = new ethers.Wallet(privateKey, provider);

const result = await sdk.releaseTokens(signer);

if (result.success) {
  console.log('Transaction hash:', result.transactionHash);
} else {
  console.error('Error:', result.error);
}
```

### 5. 批量释放代币

```typescript
const signer = new ethers.Wallet(privateKey, provider);

const result = await sdk.releaseAllTokens({
  signer,
  startIdx: 0, // 起始索引
  batchSize: 10, // 批量大小
});

if (result.success) {
  console.log('Transaction hash:', result.transactionHash);
} else {
  console.error('Error:', result.error);
}
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
2. 所有涉及交易的方法都需要提供有效的 `ethers.Signer` 实例
3. 建议在使用前先检查项目信息是否正确

## 示例代码

完整的示例代码可以在 `examples` 目录中找到。这些示例展示了如何使用 SDK 的各种功能。
