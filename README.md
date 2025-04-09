# Inpayment SDK

A Web3 payment SDK for interacting with payment and lock contracts on the blockchain.

## Features

- Get contract addresses by project ID
- Purchase tokens using ETH
- Purchase tokens using ERC20 tokens
- Release unlocked tokens
- Batch release all tokens
- Full TypeScript support
- Comprehensive error handling

## Installation

```bash
# Using npm
npm install inpayment-sdk

# Using pnpm
pnpm add inpayment-sdk

# Using yarn
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

## Error Handling

All methods in the SDK handle errors and return a unified `TransactionResult` format. If the operation is successful, the `success` field is `true` and includes a `transactionHash`; if the operation fails, the `success` field is `false` and includes an `error` message.

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

## License

MIT
