# 🌐 Browser Deployment Guide for SBT Contract

Deploy your SBT contract directly from Chrome Developer Console (F12) - no CLI tools needed!

## 🚀 Quick Deployment Steps

### Step 1: Get Your Private Key
1. Open your Leather wallet
2. Go to Settings → View Secret Key
3. Copy your private key (keep it secure!)

### Step 2: Get Testnet STX
1. Visit [Stacks Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)
2. Enter your wallet address
3. Request testnet STX (you need at least 0.1 STX for deployment)

### Step 3: Open Browser Console
1. Open Chrome browser
2. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Go to the **Console** tab

### Step 4: Load Deployment Script
Copy and paste the entire contents of `browser-deploy.js` into the console and press Enter.

### Step 5: Update Private Key
In the console, run:
```javascript
// Replace with your actual private key
const PRIVATE_KEY = "your-actual-private-key-here";
```

### Step 6: Deploy Contract
Run the deployment command:
```javascript
deployContract()
```

### Step 7: Wait for Confirmation
The script will:
- ✅ Load Stacks.js libraries
- 📝 Create deployment transaction
- 📡 Broadcast to testnet
- 🔗 Show transaction ID and explorer link

### Step 8: Check Status
Use the transaction ID to check status:
```javascript
checkDeploymentStatus('your-transaction-id')
```

### Step 9: Test Contract
Once deployed, test it:
```javascript
testContract('your-contract-address', 'simple-sbt')
```

---

## 📋 Complete Console Commands

Here's the full sequence to copy-paste:

```javascript
// 1. First, paste the entire browser-deploy.js content (loads libraries and functions)

// 2. Set your private key
const PRIVATE_KEY = "your-actual-private-key-here";

// 3. Deploy the contract
deployContract()

// 4. Check status (replace with your actual tx ID)
checkDeploymentStatus('0x1234567890abcdef...')

// 5. Test contract (replace with your actual contract address)
testContract('ST1234567890ABCDEF...', 'simple-sbt')
```

---

## 🔧 Environment Variables to Update

After successful deployment, update these files:

### `server/.env`
```env
SBT_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
SBT_CONTRACT_NAME=simple-sbt
```

### `client/.env`
```env
VITE_SBT_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
VITE_SBT_CONTRACT_NAME=simple-sbt
```

---

## 🐛 Troubleshooting

### ❌ "Transaction failed" Error
**Possible causes:**
- Insufficient STX balance
- Network congestion
- Invalid private key

**Solutions:**
1. Check your testnet STX balance
2. Get more STX from the faucet
3. Verify your private key is correct
4. Try increasing the fee:
   ```javascript
   // Modify the fee in the deployment script
   fee: 100000 // 0.1 STX (higher fee)
   ```

### ❌ "Libraries not loaded" Error
**Solution:**
1. Refresh the browser page
2. Ensure you have internet connection
3. Try running `loadStacksLibraries()` manually first

### ❌ "Private key error"
**Solution:**
1. Make sure you're using the raw private key (not mnemonic)
2. Private key should be 64 characters long
3. Don't include any prefixes or spaces

### ❌ "Contract already exists"
**Solution:**
1. Change the contract name in the script:
   ```javascript
   contractName: 'simple-sbt-v2', // Add version suffix
   ```

---

## 🎯 Expected Output

Successful deployment will show:
```
🚀 Starting contract deployment...
✅ Stacks.js libraries loaded successfully!
📍 Deploying from address: ST1234567890ABCDEF...
📝 Creating deployment transaction...
📡 Broadcasting transaction...
✅ Contract deployment transaction broadcast!
🔗 Transaction ID: 0x1234567890abcdef...
📋 Contract Address: ST1234567890ABCDEF...
📝 Contract Name: simple-sbt
🌐 View on explorer: https://explorer.stacks.co/txid/...
💾 Deployment info saved to localStorage

📝 Environment Variables to Update:
SBT_CONTRACT_ADDRESS=ST1234567890ABCDEF...
SBT_CONTRACT_NAME=simple-sbt
VITE_SBT_CONTRACT_ADDRESS=ST1234567890ABCDEF...
VITE_SBT_CONTRACT_NAME=simple-sbt
```

---

## ✅ Verification Steps

1. **Check Explorer**: Visit the provided explorer link to see your transaction
2. **Wait for Confirmation**: Transaction should confirm within 10-20 minutes
3. **Test Contract**: Use the test function to verify it's working
4. **Update Environment**: Add the contract details to your .env files
5. **Restart Servers**: Restart your Stack Tag application to use the new contract

---

## 🔒 Security Notes

- **Never share your private key** with anyone
- **Use testnet only** for development
- **Clear console history** after deployment
- **Use environment variables** in production
- **Consider using a dedicated development wallet**

---

## 🎉 Next Steps

After successful deployment:

1. ✅ Update environment variables
2. ✅ Restart your Stack Tag servers
3. ✅ Test SBT import functionality
4. ✅ Test SBT sending functionality
5. ✅ Verify IPFS integration works
6. ✅ Check profile displays correctly

Your Stack Tag platform is now fully integrated with blockchain SBTs! 🚀
