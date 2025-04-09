/**
 * Inpayment SDK 基本使用示例
 */
import { InpaymentSDK } from '../dist/index.js';
import { ethers } from 'ethers';

/**
 * 简单示例：初始化SDK并获取项目信息
 */
async function basicExample() {
  try {
    console.log('开始初始化SDK...');

    // 初始化SDK
    const sdk = new InpaymentSDK({
      projectId: 'your-project-id', // 替换为您的项目ID
      providerUrl: 'https://ethereum.publicnode.com',
    });

    // 获取项目信息
    const projectInfo = await sdk.init();
    console.log('项目信息获取成功:');
    console.log('- 支付合约地址:', projectInfo.paymentContractAddress);
    console.log('- 锁仓合约地址:', projectInfo.lockContractAddress);

    return projectInfo;
  } catch (error) {
    console.error('初始化失败:', error.message);
    throw error;
  }
}

/**
 * 使用ETH购买代币示例
 */
async function buyWithETHExample(signer) {
  try {
    console.log('开始购买代币...');

    // 初始化SDK
    const sdk = new InpaymentSDK({
      projectId: 'your-project-id', // 替换为您的项目ID
    });
    await sdk.init();

    // 获取用户地址
    const address = await signer.getAddress();
    console.log('用户地址:', address);

    // 购买代币
    const result = await sdk.buyTokensWithETH(
      {
        amount: '0.1', // ETH数量
        account: address, // 用户地址
      },
      signer
    );

    if (result.success) {
      console.log('购买成功! 交易哈希:', result.transactionHash);
    } else {
      console.error('购买失败:', result.error);
    }

    return result;
  } catch (error) {
    console.error('购买失败:', error.message);
    throw error;
  }
}

/**
 * 演示如何使用SDK
 */
async function runDemo() {
  try {
    // 基础示例
    await basicExample();

    // 如果在浏览器环境中，可以连接到钱包
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();

      // 购买代币示例
      await buyWithETHExample(signer);
    } else {
      console.log('未检测到Web3环境，跳过购买示例');
    }
  } catch (error) {
    console.error('示例运行失败:', error);
  }
}

// 运行演示
runDemo().catch(console.error);
