import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import toast from 'react-hot-toast';

const BlockchainContext = createContext();

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [blockchainStatus, setBlockchainStatus] = useState({
    connected: false,
    blockNumber: null,
    gasPrice: null,
    network: null,
  });

  // Check blockchain status from backend
  useEffect(() => {
    const checkBlockchainStatus = async () => {
      try {
        const response = await axios.get('/api/health');
        setBlockchainStatus(response.data.blockchain || {});
      } catch (error) {
        console.error('Failed to check blockchain status:', error);
      }
    };

    checkBlockchainStatus();
    const interval = setInterval(checkBlockchainStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Initialize Web3 connection
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not found! Please install MetaMask to interact with blockchain features.');
      return { success: false, error: 'MetaMask not installed' };
    }

    setIsLoading(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      // Check if we're on the correct network (Sepolia testnet)
      const expectedChainId = 11155111; // Sepolia
      if (Number(network.chainId) !== expectedChainId) {
        toast.error('Please switch to Sepolia testnet in MetaMask');
        await switchToSepolia();
      } else {
        toast.success('Wallet connected successfully! 🦊');
      }

      return { success: true };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error('Failed to connect wallet: ' + error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to Sepolia testnet
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });
      toast.success('Switched to Sepolia testnet! 🌐');
    } catch (switchError) {
      // If the chain hasn't been added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia ETH',
                  symbol: 'SEP',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
          toast.success('Sepolia testnet added to MetaMask! 🎉');
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          toast.error('Failed to add Sepolia network');
        }
      } else {
        console.error('Failed to switch network:', switchError);
        toast.error('Failed to switch to Sepolia network');
      }
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    toast.success('Wallet disconnected');
  };

  // Get account balance
  const getBalance = async (address = account) => {
    if (!provider || !address) return null;
    
    try {
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  };

  // Send transaction to blockchain
  const sendTransaction = async (to, value, data = '0x') => {
    if (!signer) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    try {
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(value.toString()),
        data,
      });

      toast.success('Transaction sent! Waiting for confirmation...');
      const receipt = await tx.wait();
      toast.success('Transaction confirmed! ✅');

      return { 
        success: true, 
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed: ' + error.message);
      return { success: false, error: error.message };
    }
  };

  // Verify batch on blockchain
  const verifyOnBlockchain = async (batchId) => {
    if (!isConnected) {
      await connectWallet();
      if (!isConnected) {
        throw new Error('Wallet connection required for verification');
      }
    }

    try {
      // First try to verify via backend API
      const response = await axios.get(`/api/blockchain/verify-batch/${batchId}`, {
        params: { walletAddress: account }
      });

      if (response.data.success && response.data.verified) {
        return {
          verified: true,
          txHash: response.data.txHash,
          blockNumber: response.data.blockNumber,
          timestamp: response.data.timestamp,
          verifiedBy: response.data.verifiedBy
        };
      }

      // If not found in backend, try direct contract call as fallback
      if (window.ethereum && window.ethereum.isMetaMask) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        
        if (!contractAddress) {
          throw new Error('Contract address not configured');
        }

        // ABI for the verifyBatch function
        const abi = [
          'function verifyBatch(string memory batchId) public view returns (bool, uint256, uint256, address)'
        ];

        const contract = new ethers.Contract(contractAddress, abi, web3Provider);
        const [verified, timestamp, blockNumber, verifiedBy] = await contract.verifyBatch(batchId);

        return {
          verified,
          txHash: null, // Not available in view function
          blockNumber: blockNumber.toNumber(),
          timestamp: new Date(timestamp.toNumber() * 1000).toISOString(),
          verifiedBy
        };
      }

      throw new Error('Verification method not available');
    } catch (error) {
      console.error('Blockchain verification error:', error);
      
      // If the error is a 404, the batch might not exist on blockchain yet
      if (error.response?.status === 404) {
        return {
          verified: false,
          error: 'Batch not found on blockchain',
          exists: false
        };
      }
      
      // For other errors, include the message
      return {
        verified: false,
        error: error.message || 'Verification failed',
        exists: true
      };
    }
  };

  // Record data on blockchain via backend
  const recordOnBlockchain = async (endpoint, data) => {
    try {
      const response = await axios.post(`/api/blockchain/${endpoint}`, {
        ...data,
        walletAddress: account,
      });

      if (response.data.success) {
        toast.success('Data recorded on blockchain! 🔗');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.message || 'Blockchain recording failed');
      }
    } catch (error) {
      console.error('Blockchain recording failed:', error);
      const message = error.response?.data?.message || error.message;
      toast.error('Blockchain recording failed: ' + message);
      return { success: false, error: message };
    }
  };

  // Verify batch on blockchain
  const verifyBatch = async (batchId) => {
    try {
      const response = await axios.post('/api/verification/batch/' + batchId, {
        walletAddress: account,
      });

      if (response.data.success) {
        toast.success('Batch verified on blockchain! ✅');
        return { success: true, data: response.data };
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Batch verification failed:', error);
      const message = error.response?.data?.message || error.message;
      toast.error('Verification failed: ' + message);
      return { success: false, error: message };
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          toast('Account switched in MetaMask', {
            icon: 'ℹ️',
            duration: 3000,
          });
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(Number(chainId));
        window.location.reload(); // Reload to reset state
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          if (accounts.length > 0) {
            // Attempt to establish provider/signer and state
            await connectWallet();
          }
        } catch (err) {
          console.error('Auto-connect failed:', err);
        }
      }
    };

    autoConnect();
  }, []);

  return (
    <BlockchainContext.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        isConnected,
        isLoading,
        blockchainStatus,
        connectWallet,
        disconnectWallet,
        getBalance,
        sendTransaction,
        recordOnBlockchain,
        verifyOnBlockchain,
        verifyBatch,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};
