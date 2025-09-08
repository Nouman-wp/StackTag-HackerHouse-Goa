// Fixed SBT Contract Browser Deployment Script
// This version handles mnemonic conversion and fixes StacksTestnet constructor

// Replace with your mnemonic phrase or private key
const MNEMONIC = "response seven grunt claw merge bone dove wealth outdoor unfair example sphere rebuild tornado poem news guide sphere input ostrich power patrol coffee other";

const CONTRACT_CODE = `
;; Simple SBT Contract for Stack Tag
(define-non-fungible-token sbt-token uint)

(define-map sbt-data uint {
  name: (string-ascii 64),
  description: (string-ascii 256),
  image: (string-ascii 256),
  issuer: (string-ascii 64),
  recipient: principal
})

(define-map user-sbt-count principal uint)
(define-data-var next-sbt-id uint u1)

(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant CONTRACT-OWNER tx-sender)

(define-read-only (get-next-sbt-id)
  (var-get next-sbt-id)
)

(define-read-only (get-sbt-data (sbt-id uint))
  (map-get? sbt-data sbt-id)
)

(define-read-only (get-user-sbt-count (user principal))
  (default-to u0 (map-get? user-sbt-count user))
)

(define-read-only (get-sbt-owner (sbt-id uint))
  (nft-get-owner? sbt-token sbt-id)
)

(define-public (mint-sbt 
  (recipient principal) 
  (name (string-ascii 64)) 
  (description (string-ascii 256)) 
  (image (string-ascii 256)) 
  (issuer (string-ascii 64)))
  (let 
    (
      (sbt-id (var-get next-sbt-id))
      (current-count (get-user-sbt-count recipient))
    )
    (try! (nft-mint? sbt-token sbt-id recipient))
    
    (map-set sbt-data sbt-id {
      name: name,
      description: description,
      image: image,
      issuer: issuer,
      recipient: recipient
    })
    
    (map-set user-sbt-count recipient (+ current-count u1))
    (var-set next-sbt-id (+ sbt-id u1))
    
    (ok sbt-id)
  )
)

(define-public (transfer-sbt (sbt-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq (some sender) (nft-get-owner? sbt-token sbt-id)) ERR-NOT-AUTHORIZED)
    (try! (nft-transfer? sbt-token sbt-id sender recipient))
    
    (match (map-get? sbt-data sbt-id)
      existing-data
      (map-set sbt-data sbt-id 
        (merge existing-data { recipient: recipient }))
      false)
    
    (let 
      (
        (sender-count (get-user-sbt-count sender))
        (recipient-count (get-user-sbt-count recipient))
      )
      (map-set user-sbt-count sender (- sender-count u1))
      (map-set user-sbt-count recipient (+ recipient-count u1))
    )
    
    (ok true)
  )
)

(define-read-only (is-contract-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)
`;

// Load Stacks.js libraries with proper versions
async function loadStacksLibraries() {
  console.log("🔄 Loading Stacks.js libraries...");
  
  // Load transactions library
  const script1 = document.createElement('script');
  script1.src = 'https://unpkg.com/@stacks/transactions@6.15.0/dist/umd/index.js';
  script1.onload = () => console.log("✅ Transactions library loaded");
  document.head.appendChild(script1);
  
  // Load network library  
  const script2 = document.createElement('script');
  script2.src = 'https://unpkg.com/@stacks/network@6.15.0/dist/umd/index.js';
  script2.onload = () => console.log("✅ Network library loaded");
  document.head.appendChild(script2);
  
  // Load wallet SDK for mnemonic handling
  const script3 = document.createElement('script');
  script3.src = 'https://unpkg.com/@stacks/wallet-sdk@6.15.0/dist/umd/index.js';
  script3.onload = () => console.log("✅ Wallet SDK loaded");
  document.head.appendChild(script3);
  
  return new Promise((resolve) => {
    let attempts = 0;
    const checkLoaded = () => {
      attempts++;
      if (window.StacksTransactions && window.StacksNetwork && window.StacksWalletSdk) {
        console.log("✅ All Stacks.js libraries loaded successfully!");
        resolve();
      } else if (attempts < 100) {
        setTimeout(checkLoaded, 200);
      } else {
        console.error("❌ Failed to load Stacks.js libraries");
        console.log("Available:", {
          transactions: !!window.StacksTransactions,
          network: !!window.StacksNetwork,
          wallet: !!window.StacksWalletSdk
        });
        resolve();
      }
    };
    checkLoaded();
  });
}

// Deploy contract function with mnemonic support
async function deployContract() {
  try {
    console.log("🚀 Starting contract deployment...");
    
    // Load libraries
    await loadStacksLibraries();
    
    if (!window.StacksTransactions || !window.StacksNetwork) {
      console.error("❌ Stacks libraries not loaded. Please refresh and try again.");
      return;
    }
    
    const { 
      makeContractDeploy, 
      broadcastTransaction,
      AnchorMode,
      PostConditionMode,
      TransactionVersion
    } = window.StacksTransactions;
    
    const { StacksTestnet } = window.StacksNetwork;
    const { generateWallet, getStxAddress } = window.StacksWalletSdk;
    
    // Create network instance
    const network = new StacksTestnet();
    
    // Generate wallet from mnemonic
    console.log("🔑 Generating wallet from mnemonic...");
    const wallet = await generateWallet({
      secretKey: MNEMONIC,
      password: ""
    });
    
    // Get the account (first account, index 0)
    const account = wallet.accounts[0];
    const senderAddress = getStxAddress({ account, transactionVersion: TransactionVersion.Testnet });
    const privateKey = account.stxPrivateKey;
    
    console.log(\`📍 Deploying from address: \${senderAddress}\`);
    
    // Create deployment transaction
    const txOptions = {
      contractName: 'simple-sbt',
      codeBody: CONTRACT_CODE.trim(),
      senderKey: privateKey,
      network: network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 100000 // Increased fee for better success rate
    };
    
    console.log("📝 Creating deployment transaction...");
    const transaction = await makeContractDeploy(txOptions);
    
    console.log("📡 Broadcasting transaction...");
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    if (broadcastResponse.error) {
      console.error("❌ Broadcast failed:", broadcastResponse.error);
      console.error("Reason:", broadcastResponse.reason);
      return;
    }
    
    console.log("✅ Contract deployment transaction broadcast!");
    console.log(\`🔗 Transaction ID: \${broadcastResponse.txid}\`);
    console.log(\`📋 Contract Address: \${senderAddress}\`);
    console.log(\`📝 Contract Name: simple-sbt\`);
    console.log(\`🌐 View on explorer: https://explorer.stacks.co/txid/\${broadcastResponse.txid}?chain=testnet\`);
    
    console.log("\\n📝 Environment Variables to Update:");
    console.log(\`SBT_CONTRACT_ADDRESS=\${senderAddress}\`);
    console.log(\`SBT_CONTRACT_NAME=simple-sbt\`);
    console.log(\`VITE_SBT_CONTRACT_ADDRESS=\${senderAddress}\`);
    console.log(\`VITE_SBT_CONTRACT_NAME=simple-sbt\`);
    
    return {
      txid: broadcastResponse.txid,
      contractAddress: senderAddress,
      contractName: 'simple-sbt'
    };
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

// Alternative deployment using Leather wallet directly
async function deployWithLeather() {
  try {
    console.log("🚀 Starting deployment with Leather wallet...");
    
    if (!window.LeatherProvider) {
      console.error("❌ Leather wallet not detected. Please install Leather extension.");
      return;
    }
    
    // Use Leather's stx_deployContract method
    const deployResult = await window.LeatherProvider.request('stx_deployContract', {
      contractName: 'simple-sbt',
      codeBody: CONTRACT_CODE.trim(),
      network: 'testnet',
      fee: 100000
    });
    
    console.log("✅ Contract deployment initiated via Leather!");
    console.log("🔗 Transaction ID:", deployResult.txid);
    console.log("🌐 View on explorer: https://explorer.stacks.co/txid/" + deployResult.txid + "?chain=testnet");
    
    return deployResult;
    
  } catch (error) {
    console.error("❌ Leather deployment failed:", error);
  }
}

// Check deployment status
async function checkStatus(txid) {
  try {
    console.log(\`🔍 Checking status for: \${txid}\`);
    
    const response = await fetch(\`https://stacks-node-api.testnet.stacks.co/extended/v1/tx/\${txid}\`);
    const txData = await response.json();
    
    console.log(\`Status: \${txData.tx_status}\`);
    
    if (txData.tx_status === 'success') {
      console.log("✅ Contract deployed successfully!");
      return true;
    } else if (txData.tx_status === 'abort_by_response') {
      console.error("❌ Transaction failed:", txData.tx_result?.repr);
      return false;
    } else {
      console.log("⏳ Transaction still pending...");
      return null;
    }
  } catch (error) {
    console.error("❌ Error checking status:", error);
    return false;
  }
}

// Export functions
window.deployContract = deployContract;
window.deployWithLeather = deployWithLeather;
window.checkStatus = checkStatus;

console.log(\`
🚀 Fixed SBT Contract Deployment Ready!

Two deployment options:

Option 1 - Using your mnemonic:
  deployContract()

Option 2 - Using Leather wallet directly:
  deployWithLeather()

Then check status:
  checkStatus('your-tx-id')

⚠️ Make sure you have testnet STX in your wallet!
\`);
