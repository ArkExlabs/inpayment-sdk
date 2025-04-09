import { useState } from 'react';
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
import { ethers } from 'ethers';

function App() {
  const [sdk, setSdk] = useState<InpaymentSDK | null>(null);
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('Please install MetaMask wallet');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);

      const sdk = new InpaymentSDK({
        providerUrl: 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
        projectId: '1',
        chainId: 97,
        projectRegistryAddress: '0xAFDB223fA3edac2A081E3F0293Cd101af2761CBA', // Replace with actual contract address
      });

      await sdk.init();
      setSdk(sdk);
      console.log(sdk, 'sdksdksdk');

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

  const buyWithETH = async () => {
    if (!sdk || !amount) return;

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const result = await sdk.buyTokensWithETH(
        {
          amount,
          account: await signer.getAddress(),
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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const result = await sdk.buyTokensWithToken(
        tokenAddress,
        {
          amount,
          account: await signer.getAddress(),
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

  const releaseTokens = async () => {
    if (!sdk) return;

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

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
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const result = await sdk.releaseAllTokens(signer);

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

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center">Inpayment SDK Demo</Heading>

        {!sdk ? (
          <Button colorScheme="blue" onClick={connectWallet} isLoading={loading}>
            Connect Wallet
          </Button>
        ) : (
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
          </Stack>
        )}
      </VStack>
    </Container>
  );
}

export default App;
