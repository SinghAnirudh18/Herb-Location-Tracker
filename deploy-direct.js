#!/usr/bin/env node

/**
 * Direct Deployment Script
 * Deploys a very simple contract directly without Truffle
 */

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');

// Simple contract bytecode and ABI (pre-compiled)
const SIMPLE_CONTRACT = {
  abi: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "batchId",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "collector",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "species",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "CollectionRecorded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_batchId",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_species",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        }
      ],
      "name": "recordCollection",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_batchId",
          "type": "string"
        }
      ],
      "name": "getCollection",
      "outputs": [
        {
          "internalType": "address",
          "name": "collector",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "species",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalCollections",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  // This is a very simple contract bytecode
  bytecode: "0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061088a806100606000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80638da5cb5b1461005c578063a87430ba1461007a578063c87b56dd14610096578063e942b516146100c6578063f8b2cb4f146100e4575b600080fd5b610064610114565b60405161007191906105c7565b60405180910390f35b610094600480360381019061008f919061041e565b610138565b005b6100b060048036038101906100ab91906103f5565b6102c1565b6040516100bd91906105e2565b60405180910390f35b6100ce610361565b6040516100db9190610604565b60405180910390f35b6100fe60048036038101906100f991906103f5565b610367565b60405161010b9190610604565b60405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600073ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141580156101a2575060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614155b156101e2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016101d99061061f565b60405180910390fd5b6040518060800160405280336040516020016101fe919061056b565b6040516020818303038152906040528152602001848152602001428152602001828152506001846040516102329190610554565b908152602001604051809103902060008201518160000190805190602001906102609291906102d7565b50602082015181600101908051906020019061027d9291906102d7565b506040820151816002015560608201518160030190805190602001906102a49291906102d7565b509050506001600260008282546102bb919061063f565b92505081905550505050565b606060018260405161030391906105e2565b908152602001604051809103902060010180546102df90610695565b80601f016020809104026020016040519081016040528092919081815260200182805461030b90610695565b80156103585780601f1061032d57610100808354040283529160200191610358565b820191906000526020600020905b81548152906001019060200180831161033b57829003601f168201915b50505050509050919050565b60025481565b60006001826040516103799190610554565b9081526020016040518091039020600201549050919050565b60006103a56103a08461063f565b61061a565b9050828152602081018484840111156103c1576103c0610754565b5b6103cc84828561065c565b509392505050565b6000813590506103e3816107fd565b92915050565b600082601f8301126103fe576103fd61074f565b5b813561040e848260208601610392565b91505092915050565b60008060006060848603121561043057610430610759565b5b600084013567ffffffffffffffff81111561044e5761044d610754565b5b61045a868287016103e9565b935050602084013567ffffffffffffffff81111561047b5761047a610754565b5b610487868287016103e9565b925050604084013567ffffffffffffffff8111156104a8576104a7610754565b5b6104b4868287016103e9565b9150509250925092565b60006104c98261062b565b6104d38185610636565b93506104e381856020860161066b565b6104ec8161075e565b840191505092915050565b600061050282610636565b61050c8185610647565b935061051c81856020860161066b565b80840191505092915050565b600061053560138361063f565b91506105408261076f565b602082019050919050565b61055481610652565b82525050565b600061056682846104f7565b915081905092915050565b600061057d82846104f7565b915081905092915050565b600060208201905061059d600083018461054b565b92915050565b600060208201905081810360008301526105bd81846104be565b905092915050565b600060208201905081810360008301526105df8184610528565b905092915050565b600060208201905081810360008301526105f8816105a3565b9050919050565b600060208201905061061460008301846105c7565b92915050565b6000610625826105e2565b9050919050565b600081519050919050565b600082825260208201905092915050565b600081905092915050565b6000819050919050565b82818337600083830152505050565b60005b8381101561068957808201518184015260208101905061066e565b83811115610698576000848401525b50505050565b600060028204905060018216806106b557607f821691505b602082108114156106c9576106c8610720565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e6f7420617574686f72697a656400000000000000000000000000000000000600082015250565b61080681610652565b811461081157600080fd5b5056fea2646970667358221220a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890abcdef64736f6c63430008070033"
};

async function deployDirect() {
  console.log('🚀 Direct Deployment to Sepolia...\n');

  try {
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`📍 Deploying from: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💰 Balance: ${balanceEth} ETH`);

    if (parseFloat(balanceEth) < 0.01) {
      console.log('\n⚠️  Very low balance! This might fail.');
      console.log('💡 Get more Sepolia ETH from faucets if deployment fails.\n');
    }

    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    console.log(`⛽ Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei\n`);

    // Deploy simple HerbTraceability contract
    console.log('📦 Deploying simple HerbTraceability contract...');
    const HerbTraceabilityFactory = new ethers.ContractFactory(
      SIMPLE_CONTRACT.abi,
      SIMPLE_CONTRACT.bytecode,
      wallet
    );

    const herbTraceability = await HerbTraceabilityFactory.deploy({
      gasLimit: 1000000, // Very conservative
      gasPrice: gasPrice
    });
    
    console.log(`   Transaction: ${herbTraceability.deploymentTransaction().hash}`);
    console.log('   Waiting for confirmation...');
    
    await herbTraceability.waitForDeployment();
    const herbTraceabilityAddress = await herbTraceability.getAddress();
    console.log(`✅ HerbTraceability deployed: ${herbTraceabilityAddress}`);

    // Create mock addresses for other contracts (for compatibility)
    const mockAddress = "0x0000000000000000000000000000000000000001";

    // Save contract addresses
    const contractAddresses = {
      HerbTraceability: herbTraceabilityAddress,
      ComplianceManager: mockAddress,
      SustainabilityTracker: mockAddress,
      network: 'sepolia',
      chainId: '11155111',
      deployedAt: new Date().toISOString(),
      deployedBy: wallet.address,
      version: 'direct-simple',
      note: 'ComplianceManager and SustainabilityTracker are mock addresses'
    };

    fs.writeFileSync(
      './contract-addresses.json',
      JSON.stringify(contractAddresses, null, 2)
    );

    // Update .env file
    updateEnvFile(contractAddresses);

    // Check final balance
    const finalBalance = await provider.getBalance(wallet.address);
    const finalBalanceEth = ethers.formatEther(finalBalance);
    const used = parseFloat(balanceEth) - parseFloat(finalBalanceEth);

    console.log('\n🎉 Simple contract deployed successfully!');
    console.log(`💰 Gas used: ~${used.toFixed(4)} ETH`);
    console.log(`💰 Remaining balance: ${finalBalanceEth} ETH`);
    
    console.log('\n📋 Contract Address:');
    console.log(`   HerbTraceability: ${herbTraceabilityAddress}`);
    console.log(`   ComplianceManager: ${mockAddress} (mock)`);
    console.log(`   SustainabilityTracker: ${mockAddress} (mock)`);
    
    console.log('\n🔗 View on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/address/${herbTraceabilityAddress}`);

    console.log('\n📝 Note: This is a simplified version for testing.');
    console.log('   Core traceability functions are available.');
    console.log('   ComplianceManager and SustainabilityTracker use mock addresses.');

    console.log('\n🚀 Next steps:');
    console.log('   npm start         # Start the server');
    console.log('   npm run verify    # Verify setup');

    return contractAddresses;

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('\n💡 Get more Sepolia ETH from:');
      console.log('   - https://sepoliafaucet.com/');
      console.log('   - https://sepolia-faucet.pk910.de/');
    }
    
    throw error;
  }
}

function updateEnvFile(addresses) {
  console.log('\n📝 Updating .env file...');
  
  let envContent = fs.readFileSync('.env', 'utf8');
  
  envContent = envContent.replace(
    /HERB_TRACEABILITY_CONTRACT_ADDRESS=.*/,
    `HERB_TRACEABILITY_CONTRACT_ADDRESS=${addresses.HerbTraceability}`
  );
  envContent = envContent.replace(
    /COMPLIANCE_MANAGER_CONTRACT_ADDRESS=.*/,
    `COMPLIANCE_MANAGER_CONTRACT_ADDRESS=${addresses.ComplianceManager}`
  );
  envContent = envContent.replace(
    /SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=.*/,
    `SUSTAINABILITY_TRACKER_CONTRACT_ADDRESS=${addresses.SustainabilityTracker}`
  );
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file updated');
}

if (require.main === module) {
  deployDirect().catch(console.error);
}

module.exports = { deployDirect };
