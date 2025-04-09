import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InpaymentSDK } from '../src/InpaymentSDK';
import type { ethers } from 'ethers';

// 定义模拟的签名者类型
interface MockSigner {
  getAddress: () => Promise<string>;
}

// 模拟ethers库
vi.mock('ethers', async () => {
  return {
    ethers: {
      Contract: vi.fn().mockImplementation(() => ({
        getProject: vi
          .fn()
          .mockResolvedValue(['0xPaymentContractAddress', '0xLockContractAddress']),
        buyTokensWithETH: vi.fn().mockResolvedValue({
          wait: vi.fn().mockResolvedValue({
            transactionHash: '0xTransactionHash',
          }),
        }),
        buyTokensWithToken: vi.fn().mockResolvedValue({
          wait: vi.fn().mockResolvedValue({
            transactionHash: '0xTransactionHash',
          }),
        }),
        releaseTokens: vi.fn().mockResolvedValue({
          wait: vi.fn().mockResolvedValue({
            transactionHash: '0xTransactionHash',
          }),
        }),
        releaseAllTokens: vi.fn().mockResolvedValue({
          wait: vi.fn().mockResolvedValue({
            transactionHash: '0xTransactionHash',
          }),
        }),
        approve: vi.fn().mockResolvedValue({
          wait: vi.fn().mockResolvedValue({}),
        }),
      })),
      providers: {
        JsonRpcProvider: vi.fn().mockImplementation(() => ({
          network: { chainId: 1 },
        })),
      },
      utils: {
        isAddress: vi.fn().mockReturnValue(true),
        parseEther: vi.fn().mockReturnValue({ toString: () => '1000000000000000000' }),
        formatEther: vi.fn().mockReturnValue('1.0'),
      },
      Signer: vi.fn(),
    },
  };
});

describe('InpaymentSDK', () => {
  let sdk: InpaymentSDK;
  let mockSigner: MockSigner;

  beforeEach(() => {
    sdk = new InpaymentSDK({
      projectId: 'test-project-id',
      providerUrl: 'https://testnet.infura.io/v3/your-infura-project-id',
      projectRegistryAddress: '0xProjectRegistryAddress',
    });

    mockSigner = {
      getAddress: vi.fn().mockResolvedValue('0xUserAddress'),
    };
  });

  it('应该成功初始化SDK', async () => {
    const projectInfo = await sdk.init();
    expect(projectInfo).toEqual({
      paymentContractAddress: '0xPaymentContractAddress',
      lockContractAddress: '0xLockContractAddress',
    });
  });

  it('应该成功获取项目信息', async () => {
    await sdk.init();
    const projectInfo = sdk.getProjectInfo();
    expect(projectInfo).toEqual({
      paymentContractAddress: '0xPaymentContractAddress',
      lockContractAddress: '0xLockContractAddress',
    });
  });

  it('应该成功使用ETH购买代币', async () => {
    await sdk.init();
    const result = await sdk.buyTokensWithETH(
      {
        amount: '1.0',
        account: '0xUserAddress',
      },
      mockSigner as unknown as ethers.Signer
    );
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('应该成功使用ERC20代币购买', async () => {
    await sdk.init();
    const result = await sdk.buyTokensWithToken(
      '0xTokenAddress',
      {
        amount: '100',
        account: '0xUserAddress',
      },
      mockSigner as unknown as ethers.Signer
    );
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('应该成功释放代币', async () => {
    await sdk.init();
    const result = await sdk.releaseTokens(mockSigner as unknown as ethers.Signer);
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('应该成功释放所有代币', async () => {
    await sdk.init();
    const result = await sdk.releaseAllTokens(mockSigner as unknown as ethers.Signer);
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });
});
