import { 
  makeContractDeploy, 
  broadcastTransaction, 
  AnchorMode,
  PostConditionMode,
  createStacksPrivateKey,
  getAddressFromPrivateKey,
  TransactionVersion
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import fs from 'fs';
import path from 'path';

// Configuration
const PRIVATE_KEY = 'your-private-key-here'; // Replace with actual private key
const NETWORK = new StacksTestnet();

async function deploySBTContract() {
  try {
    console.log('🚀 Starting SBT contract deployment...');

    // Read the contract file
    const contractPath = path.join(process.cwd(), 'contracts', 'sbt-transfer.clar');
    const codeBody = fs.readFileSync(contractPath, 'utf8');

    // Create private key object
    const privateKey = createStacksPrivateKey(PRIVATE_KEY);
    const senderAddress = getAddressFromPrivateKey(privateKey.data, TransactionVersion.Testnet);
    
    console.log(`📍 Deploying from address: ${senderAddress}`);

    // Create contract deploy transaction
    const txOptions = {
      contractName: 'sbt-transfer',
      codeBody: codeBody,
      senderKey: privateKey.data,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 10000 // 0.01 STX
    };

    const transaction = await makeContractDeploy(txOptions);

    console.log('📡 Broadcasting transaction...');
    const broadcastResponse = await broadcastTransaction(transaction, NETWORK);
    
    if (broadcastResponse.error) {
      throw new Error(`Broadcast failed: ${broadcastResponse.error}`);
    }

    console.log('✅ Contract deployment transaction broadcast!');
    console.log(`🔗 Transaction ID: ${broadcastResponse.txid}`);
    console.log(`📋 Contract Address: ${senderAddress}`);
    console.log(`📝 Contract Name: sbt-transfer`);
    console.log(`🌐 View on explorer: https://explorer.stacks.co/txid/${broadcastResponse.txid}?chain=testnet`);

    // Save deployment info
    const deploymentInfo = {
      txid: broadcastResponse.txid,
      contractAddress: senderAddress,
      contractName: 'sbt-transfer',
      deployedAt: new Date().toISOString(),
      network: 'testnet'
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'sbt-deployment.json'), 
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('💾 Deployment info saved to sbt-deployment.json');
    console.log('\n⏳ Wait for transaction confirmation, then update your .env files:');
    console.log(`VITE_SBT_CONTRACT_ADDRESS=${senderAddress}`);
    console.log(`VITE_SBT_CONTRACT_NAME=sbt-transfer`);

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
deploySBTContract();
