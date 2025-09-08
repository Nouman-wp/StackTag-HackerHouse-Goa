// Browser Deployment Script for SBT Contract
// Run this in Chrome Developer Console (F12)

// Step 1: Copy and paste this entire script into the console
// Step 2: Replace YOUR_PRIVATE_KEY with your actual private key
// Step 3: Run deployContract()

const PRIVATE_KEY = "YOUR_PRIVATE_KEY_HERE"; // Replace with your actual private key

// Contract code (simple-sbt.clar)
const CONTRACT_CODE = `
;; Simple SBT Contract for Stack Tag
;; Simplified version for reliable deployment

;; Define the SBT NFT
(define-non-fungible-token sbt-token uint)

;; Data maps
(define-map sbt-data uint {
  name: (string-ascii 64),
  description: (string-ascii 256),
  image: (string-ascii 256),
  issuer: (string-ascii 64),
  recipient: principal
})

(define-map user-sbt-count principal uint)
(define-data-var next-sbt-id uint u1)

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant CONTRACT-OWNER tx-sender)

;; Get next SBT ID
(define-read-only (get-next-sbt-id)
  (var-get next-sbt-id)
)

;; Get SBT data
(define-read-only (get-sbt-data (sbt-id uint))
  (map-get? sbt-data sbt-id)
)

;; Get user's SBT count
(define-read-only (get-user-sbt-count (user principal))
  (default-to u0 (map-get? user-sbt-count user))
)

;; Get SBT owner
(define-read-only (get-sbt-owner (sbt-id uint))
  (nft-get-owner? sbt-token sbt-id)
)

;; Mint SBT to recipient
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
    ;; Mint the NFT
    (try! (nft-mint? sbt-token sbt-id recipient))
    
    ;; Store data
    (map-set sbt-data sbt-id {
      name: name,
      description: description,
      image: image,
      issuer: issuer,
      recipient: recipient
    })
    
    ;; Update user's SBT count
    (map-set user-sbt-count recipient (+ current-count u1))
    
    ;; Increment next ID
    (var-set next-sbt-id (+ sbt-id u1))
    
    (ok sbt-id)
  )
)

;; Transfer SBT
(define-public (transfer-sbt (sbt-id uint) (sender principal) (recipient principal))
  (begin
    ;; Check ownership
    (asserts! (is-eq (some sender) (nft-get-owner? sbt-token sbt-id)) ERR-NOT-AUTHORIZED)
    
    ;; Transfer the NFT
    (try! (nft-transfer? sbt-token sbt-id sender recipient))
    
    ;; Update data
    (match (map-get? sbt-data sbt-id)
      existing-data
      (map-set sbt-data sbt-id 
        (merge existing-data { recipient: recipient }))
      false)
    
    ;; Update counts
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

;; Contract owner check
(define-read-only (is-contract-owner)
  (is-eq tx-sender CONTRACT-OWNER)
)
`;

// Load Stacks.js libraries
async function loadStacksLibraries() {
  console.log("🔄 Loading Stacks.js libraries...");
  
  // Load from CDN
  const script1 = document.createElement('script');
  script1.src = 'https://unpkg.com/@stacks/transactions@7.2.0/dist/umd/index.js';
  document.head.appendChild(script1);
  
  const script2 = document.createElement('script');
  script2.src = 'https://unpkg.com/@stacks/network@7.2.0/dist/umd/index.js';
  document.head.appendChild(script2);
  
  // Wait for libraries to load
  return new Promise((resolve) => {
    let attempts = 0;
    const checkLoaded = () => {
      attempts++;
      if (window.StacksTransactions && window.StacksNetwork) {
        console.log("✅ Stacks.js libraries loaded successfully!");
        resolve();
      } else if (attempts < 50) {
        setTimeout(checkLoaded, 100);
      } else {
        console.error("❌ Failed to load Stacks.js libraries");
        resolve();
      }
    };
    checkLoaded();
  });
}

// Deploy contract function
async function deployContract() {
  try {
    console.log("🚀 Starting contract deployment...");
    
    if (PRIVATE_KEY === "YOUR_PRIVATE_KEY_HERE") {
      console.error("❌ Please replace YOUR_PRIVATE_KEY_HERE with your actual private key");
      return;
    }
    
    // Load libraries first
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
      createStacksPrivateKey,
      getAddressFromPrivateKey,
      TransactionVersion
    } = window.StacksTransactions;
    
    const { StacksTestnet } = window.StacksNetwork;
    
    // Create network and private key
    const network = new StacksTestnet();
    const privateKey = createStacksPrivateKey(PRIVATE_KEY);
    const senderAddress = getAddressFromPrivateKey(privateKey.data, TransactionVersion.Testnet);
    
    console.log(\`📍 Deploying from address: \${senderAddress}\`);
    
    // Create contract deploy transaction
    const txOptions = {
      contractName: 'simple-sbt',
      codeBody: CONTRACT_CODE.trim(),
      senderKey: privateKey.data,
      network: network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 50000 // 0.05 STX (higher fee for reliability)
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
    
    // Save deployment info to localStorage
    const deploymentInfo = {
      txid: broadcastResponse.txid,
      contractAddress: senderAddress,
      contractName: 'simple-sbt',
      deployedAt: new Date().toISOString(),
      network: 'testnet'
    };
    
    localStorage.setItem('sbt-deployment', JSON.stringify(deploymentInfo));
    console.log("💾 Deployment info saved to localStorage");
    
    console.log("\\n📝 Environment Variables to Update:");
    console.log(\`SBT_CONTRACT_ADDRESS=\${senderAddress}\`);
    console.log(\`SBT_CONTRACT_NAME=simple-sbt\`);
    console.log(\`VITE_SBT_CONTRACT_ADDRESS=\${senderAddress}\`);
    console.log(\`VITE_SBT_CONTRACT_NAME=simple-sbt\`);
    
    return deploymentInfo;
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    console.error("Stack trace:", error.stack);
  }
}

// Check deployment status
async function checkDeploymentStatus(txid) {
  try {
    console.log(\`🔍 Checking status for transaction: \${txid}\`);
    
    const response = await fetch(\`https://stacks-node-api.testnet.stacks.co/extended/v1/tx/\${txid}\`);
    const txData = await response.json();
    
    console.log(\`Status: \${txData.tx_status}\`);
    
    if (txData.tx_status === 'success') {
      console.log("✅ Contract deployed successfully!");
      return true;
    } else if (txData.tx_status === 'abort_by_response' || txData.tx_status === 'abort_by_post_condition') {
      console.error("❌ Transaction failed:", txData.tx_result?.repr || 'Unknown error');
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

// Test contract functions
async function testContract(contractAddress, contractName) {
  try {
    console.log("🧪 Testing contract functions...");
    
    // Test get-next-sbt-id
    const response = await fetch('https://stacks-node-api.testnet.stacks.co/v2/contracts/call-read/testnet/' + contractAddress + '/' + contractName + '/get-next-sbt-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: contractAddress,
        arguments: []
      })
    });
    
    const result = await response.json();
    console.log("✅ Contract is callable! Next SBT ID:", result.result);
    
    return true;
  } catch (error) {
    console.error("❌ Contract test failed:", error);
    return false;
  }
}

// Instructions for user
console.log(\`
🚀 SBT Contract Deployment Instructions:

1. Replace YOUR_PRIVATE_KEY_HERE with your actual Stacks testnet private key
2. Make sure you have testnet STX in your wallet (get from faucet)
3. Run: deployContract()
4. Wait for confirmation (check with: checkDeploymentStatus('your-tx-id'))
5. Update your environment variables with the returned values
6. Test the contract with: testContract('contract-address', 'simple-sbt')

📋 Commands to run:
- deployContract()
- checkDeploymentStatus('your-tx-id')  
- testContract('your-contract-address', 'simple-sbt')

⚠️  Make sure to replace the private key before running!
\`);

// Export functions to global scope
window.deployContract = deployContract;
window.checkDeploymentStatus = checkDeploymentStatus;
window.testContract = testContract;
