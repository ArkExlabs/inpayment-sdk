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
} from '@chakra-ui/react';
import { InpaymentSDK } from '../../src/index';
import { BrowserProvider, ZeroAddress } from 'ethers';

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
        projectId: '13',
        projectRegistryAddress: '0xC09dFCB886c68bE9A844B43C892a38957005D6e1',
        priceFeedManagerAddress: '0xB84C8e311e2006CB06fC853610543A86442a82D3',
      });

      await sdk.init();
      console.log(sdk.getProjectInfo(), 'sdk.getProjectInfo()');
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
      getScheduleCount();
      getTokenPrice();
      getProgress();
      getBnbPrice();
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
          roundIndex: 0,
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
          roundIndex: 0,
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

  const getVestingScheduleInfo = async (params: { address: string; scheduleId: number }) => {
    if (!sdk) return;

    const result = await sdk.getVestingScheduleInfo(params);
    return result;
  };

  const getScheduleCount = async () => {
    if (!sdk) return;

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    const result = await sdk.getScheduleCount(address);
    const infoList = new Array(result).fill(0).map((_, index) => {
      return getVestingScheduleInfo({ address, scheduleId: index + 1 });
    });
    const resultList = await Promise.all(infoList);

    console.log(resultList, 'resultList');
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

  const releaseAllTokens = async () => {
    if (!sdk) return;

    try {
      setLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const result = await sdk.releaseAllTokens({
        signer,
        startIdx: 1,
        batchSize: 100,
      });

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
                  Token Release
                </Text>
                <Stack direction="row" spacing={4}>
                  <Button colorScheme="purple" onClick={releaseTokens} isLoading={loading}>
                    Release Tokens
                  </Button>
                  <Button colorScheme="red" onClick={releaseAllTokens} isLoading={loading}>
                    Release All Tokens
                  </Button>
                </Stack>
              </Box>

              <Box pt={4}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>
                  Token Price
                </Text>
                <Text mb={4}>Current Token Price: {tokenPrice || 'Loading...'}</Text>
              </Box>
            </Stack>
          </>
        )}
      </VStack>
    </Container>
  );
}

export default App;
