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
        getScheduleCount: vi.fn().mockResolvedValue({
          toNumber: vi.fn().mockReturnValue(1),
        }),
        getVestingSchedule: vi.fn().mockResolvedValue([
          '0xBeneficiary',
          '1000000000000000000', // 1 ETH
          '500000000000000000', // 0.5 ETH
          '1712880000', // 2024-04-12 00:00:00
          '30', // 30 days cliff
          '90', // 90 days duration
          '1', // vesting type
          '2', // period
          { toNumber: vi.fn().mockReturnValue(25) }, // 25% per period
          false, // revoked
        ]),
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
    const result = await sdk.releaseAllTokens({
      signer: mockSigner as unknown as ethers.Signer,
      startIdx: 1,
      batchSize: 100,
    });
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('should get vesting schedule info successfully', async () => {
    await sdk.init();
    const result = await sdk.getVestingScheduleInfo({
      address: '0xUserAddress',
      scheduleId: 1,
    });
    expect(result).toEqual({
      beneficiary: '0xBeneficiary',
      amount: '1.0',
      released: '1.0',
      startTime: '2024-04-12 08:00:00',
      cliff: 30,
      duration: 90,
      vestingType: '1',
      period: 2,
      periodReleasePercentage: 25,
      revoked: false,
      endTime: '2024-08-10 08:00:00',
      periodList: expect.any(Array),
    });
  });

  it('should get period list successfully', async () => {
    const startTime = 1712880000; // 2024-04-12 00:00:00
    const endTime = 1715500800; // 2024-05-12 00:00:00
    const result = await sdk.getPeriodList(startTime, endTime);

    // 验证第一个和最后一个时间点
    expect(result[0]).toBe(1713052800); // 2024-04-14 00:00:00
    expect(result[result.length - 1]).toBe(1715500800); // 2024-05-12 00:00:00

    // 验证时间间隔是2天
    for (let i = 1; i < result.length; i++) {
      const diff = result[i] - result[i - 1];
      expect(diff).toBeLessThanOrEqual(2 * 24 * 60 * 60);
    }
  });
});
