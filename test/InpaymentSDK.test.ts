import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InpaymentSDK } from '../src/InpaymentSDK';
import { Signer } from 'ethers';

// Mock ethers library
vi.mock('ethers', async () => {
  const actual = await vi.importActual('ethers');
  return {
    ...actual,
    Contract: vi.fn().mockImplementation(() => ({
      getProject: vi.fn().mockImplementation((projectId) => {
        const baseResponse = [
          '0x8d86318f0aa10a3c6cd5975aa27201555d94d645', // projectOwner
          '0x8d86318f0aa10a3c6cd5975aa27201555d94d645', // tokenAddress
          '0x8d86318f0aa10a3c6cd5975aa27201555d94d645', // paymentProcessor
          '0x8d86318f0aa10a3c6cd5975aa27201555d94d645', // vestingManager
          {
            // rounds
            tokenAmount: '1000000000000000000', // tokenAmount
            price: '1000000000000000000', // price
            startTime: '1713744000', // startTime (2024-04-21)
            endTime: '1713916800', // endTime (2024-04-23)
            dynamicPriceEnabled: false,
            priceIncreaseThreshold: '5000',
            priceIncreaseRate: '1000',
          },
          '1000000000000000000', // maxTokensToBuy
          true, // isActive
          '1713744000', // createdAt
          {
            // vestingConfig
            isAuto: projectId === 'manual-release' ? false : true, // enabled
            vestingType: 1, // vestingType
            cliff: '86400', // cliff (1天 = 86400秒)
            duration: '432000', // duration (5天 = 432000秒)
            period: '86400', // period (1天 = 86400秒)
            periodReleasePercentage: '2000', // periodReleasePercentage (20%)
          },
          {
            // referralConfig
            enabled: true,
            referrerRewardRate: '2000',
            refereeDiscountRate: '1000',
          },
        ];
        return Promise.resolve(baseResponse);
      }),
      releaseStartTime: vi.fn().mockImplementation((projectId) => {
        if (projectId === 'manual-release') {
          return Promise.resolve('1714089600'); // 2024-04-25
        }
        return Promise.resolve('0'); // 未开启释放
      }),
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
      getVestingSchedule: vi
        .fn()
        .mockResolvedValue([
          '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
          '1000000000000000000',
          '500000000000000000',
        ]),
      getReleasableAmount: vi.fn().mockResolvedValue('1000000000000000000'),
      approve: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({}),
      }),
      getTokenPrice: vi.fn().mockResolvedValue(['1000000000000000000', '900000000000000000']),
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
  const mockAddress = '0x1234567890123456789012345678901234567890';
  const mockSigner = {
    getAddress: async () => mockAddress,
  } as Signer;

  beforeEach(() => {
    const options = {
      projectId: '1',
      projectRegistryAddress: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      providerUrl: 'https://eth-mainnet.alchemyapi.io/v2/your-api-key',
      priceFeedManagerAddress: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
    };
    sdk = new InpaymentSDK(options);
  });

  it('should initialize SDK successfully', async () => {
    const projectInfo = await sdk.init();
    expect(projectInfo).toEqual({
      projectOwner: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      tokenAddress: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      paymentProcessor: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      vestingManager: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      rounds: {
        tokenAmount: '1.0',
        price: '1.0',
        startTime: Number('1713744000'),
        endTime: Number('1713916800'),
        dynamicPriceEnabled: false,
        priceIncreaseThreshold: '50.00',
        priceIncreaseRate: '10.00',
      },
      maxTokensToBuy: '1.0',
      isActive: true,
      createdAt: '1713744000',
      vestingConfig: {
        enabled: true,
        vestingType: 1,
        cliff: '86400',
        duration: '432000',
        period: '86400',
        periodReleasePercentage: '20.00',
      },
      referralConfig: {
        enabled: true,
        referrerRewardRate: '20.00',
        refereeDiscountRate: '10.00',
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
      rounds: {
        tokenAmount: '1.0',
        price: '1.0',
        startTime: Number('1713744000'),
        endTime: Number('1713916800'),
        dynamicPriceEnabled: false,
        priceIncreaseThreshold: '50.00',
        priceIncreaseRate: '10.00',
      },
      maxTokensToBuy: '1.0',
      isActive: true,
      createdAt: '1713744000',
      vestingConfig: {
        enabled: true,
        vestingType: 1,
        cliff: '86400',
        duration: '432000',
        period: '86400',
        periodReleasePercentage: '20.00',
      },
      referralConfig: {
        enabled: true,
        referrerRewardRate: '20.00',
        refereeDiscountRate: '10.00',
      },
    });
  });

  it('should buy tokens with ETH successfully', async () => {
    await sdk.init();
    const result = await sdk.buyTokensWithETH(
      {
        amount: '1.0',
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
      },
      mockSigner as any
    );
    expect(result).toEqual({
      success: true,
      transactionHash: '0xTransactionHash',
    });
  });

  it('should release tokens successfully', async () => {
    const result = await sdk.releaseTokens(mockSigner);
    expect(result.success).toBeTruthy();
  });

  it('should get vesting schedule info successfully', async () => {
    await sdk.init();
    const result = await sdk.getVestingScheduleInfo({
      address: '0x9876543210987654321098765432109876543210',
    });
    expect(result).toEqual({
      beneficiary: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      amount: '1.0',
      released: '1.0',
    });
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

  it('should get release amount', async () => {
    const amount = await sdk.getReleaseAmount(mockSigner);
    expect(amount).toBeTruthy();
  });

  it('should get unlock time', async () => {
    const time = await sdk.getUnlockTime();
    expect(time).toBeDefined();
  });
});

describe('UnlockTime Tests', () => {
  let sdk: InpaymentSDK;
  let sdkOptions: any;

  beforeEach(async () => {
    vi.useFakeTimers();
    sdkOptions = {
      projectId: '1',
      projectRegistryAddress: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
      providerUrl: 'https://eth-mainnet.alchemyapi.io/v2/your-api-key',
      priceFeedManagerAddress: '0x8d86318f0aa10a3c6cd5975aa27201555d94d645',
    };
    sdk = new InpaymentSDK(sdkOptions);
    await sdk.init();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should calculate correct unlock time for auto release', async () => {
    // Mock vestingConfig with specific values
    const projectInfo = sdk.getProjectInfo();
    const autoOptions = {
      ...projectInfo,
      vestingConfig: {
        ...projectInfo.vestingConfig,
        enabled: true,
        periodReleasePercentage: '20.00', // 每期释放20%
      },
    };
    vi.spyOn(sdk, 'getProjectInfo').mockReturnValue(autoOptions);

    const time = await sdk.getUnlockTime();

    // 预期第一次释放时间：4.23(endTime) + 1天(cliff) + 1天(period) = 4.25
    const expectedFirstUnlock = 1713916800 + 86400 + 86400; // 2024-04-25
    expect(time.unlockTimeList[0]).toBe(expectedFirstUnlock);

    // 验证总共应该有5个释放时间点（因为每次释放20%）
    expect(time.unlockTimeList.length).toBe(5);

    // 验证最后一个时间点不超过duration
    const duration = Number(projectInfo.vestingConfig.duration);
    const lastUnlockTime = time.unlockTimeList[time.unlockTimeList.length - 1];
    expect(lastUnlockTime).toBeLessThanOrEqual(expectedFirstUnlock + duration);
  });
});
