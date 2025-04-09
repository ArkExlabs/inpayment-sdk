import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InpaymentSDK } from '../src/InpaymentSDK';
import type { ethers } from 'ethers';

// Define mock signer type
interface MockSigner {
  getAddress: () => Promise<string>;
}

// Mock ethers library
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
      constants: {
        AddressZero: '0x0000000000000000000000000000000000000000',
      },
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

  it('should initialize SDK successfully', async () => {
    const projectInfo = await sdk.init();
    expect(projectInfo).toEqual({
      paymentContractAddress: '0x647b133d614218E3CE42eF8665A83a4E22644723',
      lockContractAddress: '0xE843114e6bB236648EBEEE1D67C148D3cDb5e7b2',
    });
  });

  it('should get project info successfully', async () => {
    await sdk.init();
    const projectInfo = sdk.getProjectInfo();
    expect(projectInfo).toEqual({
      paymentContractAddress: '0x647b133d614218E3CE42eF8665A83a4E22644723',
      lockContractAddress: '0xE843114e6bB236648EBEEE1D67C148D3cDb5e7b2',
    });
  });

  it('should buy tokens with ETH successfully', async () => {
    await sdk.init();
    const result = await sdk.buyTokensWithETH(
      {
        amount: '1.0',
        account: '0xUserAddress',
        roundIndex: 0,
      },
      mockSigner as unknown as ethers.Signer
    );
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('should buy tokens with ERC20 successfully', async () => {
    await sdk.init();
    const result = await sdk.buyTokensWithToken(
      '0xTokenAddress',
      {
        amount: '100',
        account: '0xUserAddress',
        roundIndex: 0,
      },
      mockSigner as unknown as ethers.Signer
    );
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('should release tokens successfully', async () => {
    await sdk.init();
    const result = await sdk.releaseTokens(mockSigner as unknown as ethers.Signer);
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('should release all tokens successfully', async () => {
    await sdk.init();
    const result = await sdk.releaseAllTokens(mockSigner as unknown as ethers.Signer);
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });
});
