import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InpaymentSDK } from '../src/InpaymentSDK';

// Define mock signer type
interface MockSigner {
  getAddress: () => Promise<string>;
  connect: () => MockSigner;
  provider: {
    getNetwork: () => Promise<{ chainId: number }>;
  };
  signMessage?: (message: string) => Promise<string>;
}

// Mock ethers library
vi.mock('ethers', async () => {
  const actual = await vi.importActual('ethers');
  return {
    ...actual,
    Contract: vi.fn().mockImplementation(() => ({
      getProject: vi.fn().mockResolvedValue([
        '0x8d86318f0aa10a3c6cd5975aa27201555d94d645', // projectOwner
        '0x8d86318f0aa10a3c6cd5975aa27201555d94d645', // tokenAddress
        '0x8d86318f0aa10a3c6cd5975aa27201555d94d645', // paymentProcessor
        '0x8d86318f0aa10a3c6cd5975aa27201555d94d645', // vestingManager
        [
          // rounds
          [
            '1000000000000000000', // tokenAmount
            '1000000000000000000', // price
            '1712880000', // startTime
            '1715500800', // endTime
            false, // dynamicPriceEnabled
            '0', // priceIncreaseThreshold
            '0', // priceIncreaseRate
          ],
        ],
        '1000000000000000000', // maxTokensToBuy
        true, // isActive
        '1712880000', // createdAt
        [
          // vestingConfig
          true, // enabled
          1, // vestingType
          '30', // cliff
          '90', // duration
          '2', // period
          '25', // periodReleasePercentage
        ],
        [
          // referralConfig
          true, // enabled
          '10', // referrerRewardRate
          '5', // refereeDiscountRate
        ],
      ]),
      buyTokensWithETH: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({
          hash: '0xTransactionHash',
        }),
      }),
      buyTokensWithToken: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({
          hash: '0xTransactionHash',
        }),
      }),
      releaseTokens: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({
          hash: '0xTransactionHash',
        }),
      }),
      batchReleaseTokens: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({
          hash: '0xTransactionHash',
        }),
      }),
      getScheduleCount: vi.fn().mockResolvedValue(1),
      getVestingSchedule: vi.fn().mockResolvedValue([
        '0x8d86318f0aa10a3c6cd5975aa27201555d94d645', // beneficiary
        '1000000000000000000', // 1 ETH
        '500000000000000000', // 0.5 ETH
        '1712880000', // 2024-04-12 00:00:00
        '30', // 30 days cliff
        '90', // 90 days duration
        '1', // vesting type
        '2', // period
        '25', // 25% per period
        false, // revoked
      ]),
      approve: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({}),
      }),
      getTokenPrice: vi.fn().mockResolvedValue([
        '1000000000000000000', // price
        '900000000000000000', // discountedPrice
      ]),
      transferToken: vi.fn().mockImplementation(() => ({
        wait: vi.fn().mockResolvedValue({
          hash: '0xTransactionHash',
        }),
      })),
      allowance: vi.fn().mockResolvedValue('1000000000000000000'),
      connect: vi.fn().mockReturnThis(),
      signer: {
        getAddress: vi.fn().mockResolvedValue('0xUserAddress'),
      },
      balanceOf: vi.fn().mockResolvedValue('1000000000000000000'),
    })),
    JsonRpcProvider: vi.fn().mockImplementation(() => ({
      network: { chainId: 1 },
    })),
    isAddress: vi.fn().mockImplementation((address) => {
      return /^0x[0-9a-fA-F]{40}$/.test(address);
    }),
    formatEther: vi.fn().mockReturnValue('1.0'),
    parseEther: vi.fn().mockReturnValue('1000000000000000000'),
    ZeroAddress: '0x0000000000000000000000000000000000000000',
  };
});

describe('InpaymentSDK', () => {
  let sdk: InpaymentSDK;
  let mockSigner: MockSigner;

  beforeEach(() => {
    sdk = new InpaymentSDK({
      projectId: 'test-project-id',
      providerUrl: 'https://testnet.infura.io/v3/your-infura-project-id',
      projectRegistryAddress: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
    });

    mockSigner = {
      getAddress: vi.fn().mockResolvedValue('0x8d86318f0aa10a3c6cd5975aa27201555d94d645'),
      connect: vi.fn().mockReturnThis(),
      provider: {
        getNetwork: vi.fn().mockResolvedValue({ chainId: 1 }),
      },
      signMessage: vi.fn().mockResolvedValue('0xSignature'),
    };
  });

  it('should initialize SDK successfully', async () => {
    const projectInfo = await sdk.init();
    expect(projectInfo).toEqual({
      projectOwner: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      tokenAddress: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      paymentProcessor: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      vestingManager: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      rounds: [
        {
          tokenAmount: '1.0',
          price: '1.0',
          startTime: '1712880000',
          endTime: '1715500800',
          dynamicPriceEnabled: false,
          priceIncreaseThreshold: '0',
          priceIncreaseRate: '0',
        },
      ],
      maxTokensToBuy: '1.0',
      isActive: true,
      createdAt: '1712880000',
      vestingConfig: {
        enabled: true,
        vestingType: 1,
        cliff: '30',
        duration: '90',
        period: '2',
        periodReleasePercentage: '25',
      },
      referralConfig: {
        enabled: true,
        referrerRewardRate: '10',
        refereeDiscountRate: '5',
      },
    });
  });

  it('should get project info successfully', async () => {
    await sdk.init();
    const projectInfo = sdk.getProjectInfo();
    expect(projectInfo).toEqual({
      projectOwner: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      tokenAddress: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      paymentProcessor: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      vestingManager: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      rounds: [
        {
          tokenAmount: '1.0',
          price: '1.0',
          startTime: '1712880000',
          endTime: '1715500800',
          dynamicPriceEnabled: false,
          priceIncreaseThreshold: '0',
          priceIncreaseRate: '0',
        },
      ],
      maxTokensToBuy: '1.0',
      isActive: true,
      createdAt: '1712880000',
      vestingConfig: {
        enabled: true,
        vestingType: 1,
        cliff: '30',
        duration: '90',
        period: '2',
        periodReleasePercentage: '25',
      },
      referralConfig: {
        enabled: true,
        referrerRewardRate: '10',
        refereeDiscountRate: '5',
      },
    });
  });

  it('should buy tokens with ETH successfully', async () => {
    await sdk.init();
    const result = await sdk.buyTokensWithETH(
      {
        amount: '1.0',
        roundIndex: 0,
      },
      mockSigner as any
    );
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('should buy tokens with ERC20 successfully', async () => {
    await sdk.init();
    const result = await sdk.buyTokensWithToken(
      '0x2345678901234567890123456789012345678901',
      {
        amount: '1.0',
        roundIndex: 0,
      },
      mockSigner as any
    );
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('should release tokens successfully', async () => {
    await sdk.init();
    const result = await sdk.releaseTokens(mockSigner as any);
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('should release all tokens successfully', async () => {
    await sdk.init();
    const result = await sdk.releaseAllTokens({
      signer: mockSigner as any,
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
      address: '0x9876543210987654321098765432109876543210',
      scheduleId: 1,
    });
    expect(result).toEqual({
      beneficiary: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      amount: '1000000000000000000',
      released: '500000000000000000',
      startTime: '1712880000',
      cliff: '30',
      duration: '90',
      vestingType: 1,
      period: '2',
      periodReleasePercentage: 25,
      revoked: false,
      endTime: '1712880120',
      periodList: expect.any(Array),
    });
  });

  it('should get period list successfully', () => {
    const startTime = 1712880000;
    const endTime = 1712880120;
    const result = sdk.getPeriodList(startTime, endTime);
    expect(result).toEqual([endTime.toString()]);
  });

  it('should get token price successfully', async () => {
    await sdk.init();
    const result = await sdk.getTokenPrice({
      buyer: '0xUserAddress',
    });
    expect(result).toEqual({
      price: '1.0',
      discountedPrice: '1.0',
    });
  });
});
