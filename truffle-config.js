// truffle-config.js
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: process.env.MNEMONIC,
        providerOrUrl: process.env.ETHEREUM_RPC_URL,
        numberOfAddresses: 1,
        shareNonce: true,
        derivationPath: "m/44'/60'/0'/0/"
      }),
      network_id: 11155111,
      gas: 6000000,
      gasPrice: 20000000000, // 20 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 10000,
      deploymentPollingInterval: 8000
    }
  },

  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  plugins: [
    "truffle-plugin-verify"
  ],

  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};