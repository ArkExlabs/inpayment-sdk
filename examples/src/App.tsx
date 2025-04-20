import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  useToast,
  Divider,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { InpaymentSDK } from '../../src/index';
import { BrowserProvider, ZeroAddress } from 'ethers';
import dayjs from 'dayjs';

// Add type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [sdk, setSdk] = useState<InpaymentSDK | null>(null);
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenPrice, setTokenPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('0');
  const [bnbPrice, setBnbPrice] = useState<string>('0');
  const [vestingSchedule, setVestingSchedule] = useState<any>(null);
  const [releaseAmount, setReleaseAmount] = useState<string>('0');
  const [unlockTime, setUnlockTime] = useState<string>('');
  const [lockTimeList, setLockTimeList] = useState<string[]>([]);
  const toast = useToast();

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask wallet');
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);

      const sdk = new InpaymentSDK({
        providerUrl: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
        projectId: '4',
        projectRegistryAddress: '0x9b0BAd6f3A21d6EF248b2A2B2B21E60B18dC68Db',
        priceFeedManagerAddress: '0xB84C8e311e2006CB06fC853610543A86442a82D3',
      });

      await sdk.init();
      const info = await sdk.getProjectInfo();
      console.log(info, 'info');

      console.log('悬崖期(小时)', info.vestingConfig.cliff / 60 / 60);
      console.log('释放周期(小时)', info.vestingConfig.period / 60 / 60);
      console.log('最终释放周期(小时)', info.vestingConfig.duration / 60 / 60);
      console.log(
        '项目开始时间',
        dayjs(info.rounds.startTime * 1000).format('YYYY-MM-DD HH:mm:ss')
      );
      console.log('项目结束时间', dayjs(info.rounds.endTime * 1000).format('YYYY-MM-DD HH:mm:ss'));
      console.log(
        '第一次释放时间',
        dayjs(
          (info.rounds.endTime +
            Number(info.vestingConfig.cliff) +
            Number(info.vestingConfig.period)) *
            1000
        ).format('YYYY-MM-DD HH:mm:ss')
      );
      console.log(
        '最后一次释放时间',
        dayjs(
          (info.rounds.endTime +
            Number(info.vestingConfig.cliff) +
            Number(info.vestingConfig.duration)) *
            1000
        ).format('YYYY-MM-DD HH:mm:ss')
      );
      setSdk(sdk);

      toast({
        title: 'Connected successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (sdk) {
      getTokenPrice();
      getProgress();
      getBnbPrice();
      fetchVestingInfo();
    }
  }, [sdk]);

  const buyWithETH = async () => {
    if (!sdk || !amount) return;

    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const result = await sdk.buyTokensWithETH(
        {
          amount,
        },
        signer
      );

      if (result.success) {
        toast({
          title: 'Purchase successful',
          description: `Transaction hash: ${result.transactionHash}`,
          status: 'success',
          duration: 5000,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Purchase failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const buyWithToken = async () => {
    if (!sdk || !amount || !tokenAddress) return;

    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const result = await sdk.buyTokensWithToken(
        tokenAddress,
        {
          amount,
        },
        signer
      );

      if (result.success) {
        toast({
          title: 'Purchase successful',
          description: `Transaction hash: ${result.transactionHash}`,
          status: 'success',
          duration: 5000,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Purchase failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const releaseTokens = async () => {
    if (!sdk) return;

    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const result = await sdk.releaseTokens(signer);

      if (result.success) {
        toast({
          title: 'Release successful',
          description: `Transaction hash: ${result.transactionHash}`,
          status: 'success',
          duration: 5000,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Release failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTokenPrice = async () => {
    if (!sdk) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const result = await sdk.getTokenPrice({
        buyer: address,
      });

      setTokenPrice(result.discountedPrice);
    } catch (error) {
      console.error('Failed to get token price:', error);
    }
  };

  const getProgress = async () => {
    if (!sdk) return;

    try {
      const result = await sdk.getProjectProgress();
      setProgress(result);
    } catch (error) {
      toast({
        title: '获取进度失败',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getBnbPrice = async () => {
    if (!sdk) return;

    try {
      // BNB的合约地址
      const BNB_ADDRESS = ZeroAddress;
      const price = await sdk.getTokenUsdValue(BNB_ADDRESS);
      setBnbPrice(price.toString());
    } catch (error) {
      toast({
        title: '获取BNB价格失败',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // 获取锁仓信息
  const fetchVestingInfo = async () => {
    if (!sdk) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // 获取锁仓计划
      const schedule = await sdk.getVestingScheduleInfo({ address });
      setVestingSchedule(schedule);

      // 获取可释放数量
      const amount = await sdk.getReleaseAmount(signer);
      setReleaseAmount(amount);

      // 获取解锁时间
      const unlockTimeStamp = await sdk.getUnlockTime();
      const unlockTime = dayjs(unlockTimeStamp.currentUnlockTime * 1000).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      const list = unlockTimeStamp.unlockTimeList.map((item) =>
        dayjs(item * 1000).format('YYYY-MM-DD HH:mm:ss')
      );
      console.log('当前周期释放时间', unlockTime);
      console.log('解锁时间表', list);
      setUnlockTime(unlockTime);
      setLockTimeList(list);
      // // 计算距离解锁的时间
      // const now = Math.floor(Date.now() / 1000);
      // const timeLeft = unlockTimeStamp - now;

      // if (timeLeft > 0) {
      //   const days = Math.floor(timeLeft / (24 * 60 * 60));
      //   const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
      //   setTimeUntilUnlock(`${days}天 ${hours}小时`);
      // } else {
      //   setTimeUntilUnlock('已解锁');
      // }
    } catch (error) {
      toast({
        title: '获取锁仓信息失败',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Inpayment SDK Demo
        </Heading>

        {!sdk ? (
          <Button onClick={connectWallet} isLoading={loading}>
            Connect Wallet
          </Button>
        ) : (
          <>
            <Box p={4} borderWidth={1} borderRadius="md">
              <Stack spacing={2}>
                <Text fontSize="lg">项目销售进度: {progress}%</Text>
                <Text fontSize="lg">BNB 价格: ${Number(bnbPrice).toFixed(2)}</Text>
              </Stack>
            </Box>

            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Purchase Amount</FormLabel>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter purchase amount"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Token Address (Optional)</FormLabel>
                <Input
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter ERC20 token address"
                />
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={buyWithETH}
                isLoading={loading}
                isDisabled={!amount}
              >
                Buy with Native Token
              </Button>

              <Button
                colorScheme="green"
                onClick={buyWithToken}
                isLoading={loading}
                isDisabled={!amount || !tokenAddress}
              >
                Buy with Contract Token
              </Button>

              <Box pt={4}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  Token Price
                </Text>
                <Text mb={4}>Current Token Price: {tokenPrice || 'Loading...'}</Text>
              </Box>
            </Stack>

            <Divider my={6} />

            {/* 锁仓信息卡片 */}
            <Card>
              <CardHeader>
                <Heading size="md">锁仓信息</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {vestingSchedule && (
                    <>
                      <Box>
                        <Text fontWeight="bold">总锁仓数量:</Text>
                        <Text>{vestingSchedule.amount}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">已释放数量:</Text>
                        <Text>{vestingSchedule.released}</Text>
                      </Box>
                    </>
                  )}
                  <Box>
                    <Text fontWeight="bold">可释放数量:</Text>
                    <Text>{releaseAmount}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">下次解锁时间:</Text>
                    <Text>{unlockTime ? unlockTime : '-'}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">解锁时间表:</Text>
                    <Text>{lockTimeList.join(', ')}</Text>
                  </Box>
                  <Button
                    colorScheme="blue"
                    onClick={releaseTokens}
                    isLoading={loading}
                    loadingText="释放中"
                  >
                    释放代币
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Container>
  );
}

export default App;
