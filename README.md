# Inpayment SDK

A Web3 payment SDK for interacting with payment and lock contracts on the blockchain.

基于Web3的支付SDK，用于与区块链上的支付和锁仓合约进行交互。

## Features

- Get contract addresses by project ID
- Purchase tokens using ETH
- Purchase tokens using ERC20 tokens
- Release unlocked tokens
- Batch release all tokens
- Full TypeScript support
- Comprehensive error handling

## 功能特点

- 支持通过项目ID获取对应的合约地址
- 支持使用ETH购买代币
- 支持使用ERC20代币购买
- 支持释放已释放的代币
- 支持批量释放所有代币
- 完整的TypeScript类型支持
- 支持常见的错误处理

## Installation

```bash
# Using npm
npm install inpayment-sdk

# Using pnpm
pnpm add inpayment-sdk

# Using yarn
yarn add inpayment-sdk
```

## 安装

```bash
# 使用npm
npm install inpayment-sdk

# 使用pnpm
pnpm add inpayment-sdk

# 使用yarn
yarn add inpayment-sdk
```

## Quick Start

### Initialize the SDK

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// Create SDK instance
const sdk = new InpaymentSDK({
  projectId: 'your-project-id',
  providerUrl: 'https://ethereum.publicnode.com', // Optional, defaults to public node
  chainId: 1, // Optional, defaults to current network
});

// Initialize SDK and get project info
await sdk.init();

// Get project info
const projectInfo = sdk.getProjectInfo();
console.log('Payment contract address:', projectInfo.paymentContractAddress);
console.log('Lock contract address:', projectInfo.lockContractAddress);
```

## 快速开始

### 初始化SDK

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// 创建SDK实例
const sdk = new InpaymentSDK({
  projectId: '您的项目ID',
  providerUrl: 'https://ethereum.publicnode.com', // 可选，默认为公共节点
  chainId: 1, // 可选，默认为当前网络
});

// 初始化SDK，获取项目信息
await sdk.init();

// 获取项目信息
const projectInfo = sdk.getProjectInfo();
console.log('支付合约地址:', projectInfo.paymentContractAddress);
console.log('锁仓合约地址:', projectInfo.lockContractAddress);
```

### Purchase Tokens with ETH

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// Connect to user wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();
const address = await signer.getAddress();

// Create SDK instance
const sdk = new InpaymentSDK({ projectId: 'your-project-id' });

// Purchase tokens with ETH
const result = await sdk.buyTokensWithETH(
  {
    amount: '0.1', // ETH amount
    account: address, // User address
  },
  signer
);

if (result.success) {
  console.log('Transaction successful, hash:', result.transactionHash);
} else {
  console.error('Transaction failed:', result.error);
}
```

### 使用ETH购买代币

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// 连接到用户钱包
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();
const address = await signer.getAddress();

// 创建SDK实例
const sdk = new InpaymentSDK({ projectId: '您的项目ID' });

// 使用ETH购买代币
const result = await sdk.buyTokensWithETH(
  {
    amount: '0.1', // ETH数量
    account: address, // 用户地址
  },
  signer
);

if (result.success) {
  console.log('交易成功，交易哈希:', result.transactionHash);
} else {
  console.error('交易失败:', result.error);
}
```

### Purchase Tokens with ERC20

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// Connect to user wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();
const address = await signer.getAddress();

// Create SDK instance
const sdk = new InpaymentSDK({ projectId: 'your-project-id' });

// ERC20 token address
const tokenAddress = '0xTokenAddress';

// Purchase tokens with ERC20
const result = await sdk.buyTokensWithToken(
  tokenAddress,
  {
    amount: '100', // Token amount
    account: address, // User address
  },
  signer
);

if (result.success) {
  console.log('Transaction successful, hash:', result.transactionHash);
} else {
  console.error('Transaction failed:', result.error);
}
```

### 使用ERC20代币购买

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// 连接到用户钱包
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();
const address = await signer.getAddress();

// 创建SDK实例
const sdk = new InpaymentSDK({ projectId: '您的项目ID' });

// ERC20代币地址
const tokenAddress = '0xTokenAddress';

// 使用ERC20代币购买
const result = await sdk.buyTokensWithToken(
  tokenAddress,
  {
    amount: '100', // 代币数量
    account: address, // 用户地址
  },
  signer
);

if (result.success) {
  console.log('交易成功，交易哈希:', result.transactionHash);
} else {
  console.error('交易失败:', result.error);
}
```

### Release Tokens

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// Connect to user wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();

// Create SDK instance
const sdk = new InpaymentSDK({ projectId: 'your-project-id' });

// Release tokens
const result = await sdk.releaseTokens(signer);

if (result.success) {
  console.log('Release successful, hash:', result.transactionHash);
} else {
  console.error('Release failed:', result.error);
}
```

### 释放代币

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// 连接到用户钱包
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();

// 创建SDK实例
const sdk = new InpaymentSDK({ projectId: '您的项目ID' });

// 释放代币
const result = await sdk.releaseTokens(signer);

if (result.success) {
  console.log('释放成功，交易哈希:', result.transactionHash);
} else {
  console.error('释放失败:', result.error);
}
```

### Release All Tokens

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// Connect to user wallet
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();

// Create SDK instance
const sdk = new InpaymentSDK({ projectId: 'your-project-id' });

// Release all tokens
const result = await sdk.releaseAllTokens(signer);

if (result.success) {
  console.log('Release successful, hash:', result.transactionHash);
} else {
  console.error('Release failed:', result.error);
}
```

### 释放所有代币

```typescript
import { InpaymentSDK } from 'inpayment-sdk';
import { ethers } from 'ethers';

// 连接到用户钱包
const provider = new ethers.providers.Web3Provider(window.ethereum);
await provider.send('eth_requestAccounts', []);
const signer = provider.getSigner();

// 创建SDK实例
const sdk = new InpaymentSDK({ projectId: '您的项目ID' });

// 释放所有代币
const result = await sdk.releaseAllTokens(signer);

if (result.success) {
  console.log('释放成功，交易哈希:', result.transactionHash);
} else {
  console.error('释放失败:', result.error);
}
```

## API Documentation

### Classes

#### InpaymentSDK

Main SDK class, provides all methods for contract interaction.

##### Constructor

```typescript
constructor(options: InpaymentSDKOptions)
```

- `options` - SDK initialization options
  - `projectId` - Project ID
  - `providerUrl` - Optional, RPC provider URL
  - `chainId` - Optional, chain ID

##### Methods

- `init()` - Initialize SDK, get project info
- `getProjectInfo()` - Get project info
- `buyTokensWithETH(options, signer)` - Purchase tokens with ETH
- `buyTokensWithToken(tokenAddress, options, signer)` - Purchase tokens with ERC20
- `releaseTokens(signer)` - Release tokens
- `releaseAllTokens(signer)` - Release all tokens

### Interfaces

#### InpaymentSDKOptions

```typescript
interface InpaymentSDKOptions {
  projectId: string;
  providerUrl?: string;
  chainId?: number;
}
```

#### ProjectInfo

```typescript
interface ProjectInfo {
  paymentContractAddress: string;
  lockContractAddress: string;
}
```

#### BuyTokensOptions

```typescript
interface BuyTokensOptions {
  amount: string | number; // Amount to buy
  account: string; // Account address
}
```

#### TransactionResult

```typescript
interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}
```

## API文档

### 类

#### InpaymentSDK

SDK主类，提供与合约交互的所有方法。

##### 构造函数

```typescript
constructor(options: InpaymentSDKOptions)
```

- `options` - SDK初始化选项
  - `projectId` - 项目ID
  - `providerUrl` - 可选，RPC提供者URL
  - `chainId` - 可选，链ID

##### 方法

- `init()` - 初始化SDK，获取项目信息
- `getProjectInfo()` - 获取项目信息
- `buyTokensWithETH(options, signer)` - 使用ETH购买代币
- `buyTokensWithToken(tokenAddress, options, signer)` - 使用ERC20代币购买
- `releaseTokens(signer)` - 释放代币
- `releaseAllTokens(signer)` - 释放所有代币

### 接口

#### InpaymentSDKOptions

```typescript
interface InpaymentSDKOptions {
  projectId: string;
  providerUrl?: string;
  chainId?: number;
}
```

#### ProjectInfo

```typescript
interface ProjectInfo {
  paymentContractAddress: string;
  lockContractAddress: string;
}
```

#### BuyTokensOptions

```typescript
interface BuyTokensOptions {
  amount: string | number; // 购买数量
  account: string; // 账户地址
}
```

#### TransactionResult

```typescript
interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}
```

## Error Handling

All methods in the SDK handle errors and return a unified `TransactionResult` format. If the operation is successful, the `success` field is `true` and includes a `transactionHash`; if the operation fails, the `success` field is `false` and includes an `error` message.

## 错误处理

SDK中的所有方法都会处理错误并返回统一的`TransactionResult`格式。如果操作成功，`success`字段为`true`，并包含`transactionHash`；如果操作失败，`success`字段为`false`，并包含`error`错误信息。

## Development and Building

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Code checking
pnpm lint
```

## 开发和构建

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 代码检查
pnpm lint
```

## Publishing npm Package

```bash
# Login to npm
npm login

# Publish beta version
npm version patch --tag beta # or minor, major
npm publish --tag beta

# Publish release version
npm version patch # or minor, major
npm publish
```

Release process:

1. Make sure all code is committed to git
2. Run `npm version [patch|minor|major]` to update version
3. The script will automatically build and test
4. After successful version update, it will push to git and create a tag
5. Run `npm publish` to publish to npm

## 发布npm包

```bash
# 登录npm
npm login

# 发布测试版本
npm version patch --tag beta # 或 minor, major
npm publish --tag beta

# 发布正式版本
npm version patch # 或 minor, major
npm publish
```

版本发布流程：

1. 确保所有代码已提交到git仓库
2. 运行 `npm version [patch|minor|major]` 更新版本号
3. 脚本会自动执行构建和测试
4. 版本更新成功后会自动推送到git并创建tag
5. 运行 `npm publish` 发布到npm

## License

MIT

## 许可证

MIT
