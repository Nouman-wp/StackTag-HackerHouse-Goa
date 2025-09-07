import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Function to verify payment transaction on blockchain
const verifyPaymentTransaction = async (txId, expectedSender) => {
  try {
    console.log(`Verifying transaction: ${txId}`);
    
    const response = await fetch(`https://stacks-node-api.testnet.stacks.co/extended/v1/tx/${txId}`);
    
    if (!response.ok) {
      console.log(`Transaction API returned status: ${response.status}`);
      return false;
    }
    
    const txData = await response.json();
    console.log(`Transaction status: ${txData.tx_status}`);
    
    // Check if transaction is confirmed
    if (txData.tx_status !== 'success') {
      console.log(`Transaction not confirmed. Status: ${txData.tx_status}`);
      return false;
    }
    
    // Verify sender matches
    if (txData.sender_address !== expectedSender) {
      console.log(`Sender mismatch. Expected: ${expectedSender}, Got: ${txData.sender_address}`);
      return false;
    }
    
    // Verify STX transfer to the correct recipient
    const stxTransferEvent = txData.events?.find(event => 
      event.event_type === 'stx_asset' && 
      event.asset.recipient === 'ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC' &&
      event.asset.amount === '20000000' // 20 STX in microSTX
    );
    
    if (!stxTransferEvent) {
      console.log('No valid 20 STX transfer found to ST1WAX87WDE0ZMJN8M62V23F2SFDS8Q2FPJW7EMPC');
      return false;
    }
    
    console.log('✅ Transaction verified: 20 STX payment confirmed');
    return true;
    
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
};

// POST /api/domains/claim - Claim a domain after successful STX payment
router.post('/claim', async (req, res) => {
  try {
    const { username, walletAddress, txId, fee } = req.body;

    if (!username || !walletAddress || !txId) {
      return res.status(400).json({ 
        error: 'Username, wallet address, and transaction ID are required' 
      });
    }

    // Verify the transaction on the blockchain (fee-gate)
    console.log(`Verifying 20 STX payment for tx ${txId} ...`);
    const ok = await verifyPaymentTransaction(txId, walletAddress);
    if (!ok) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    // Check if domain already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Domain already claimed',
        existingUser: {
          username: existingUser.username,
          walletAddress: existingUser.walletAddress
        }
      });
    }

    // Create new user profile with domain claim info
    const newUser = new User({
      username: username.toLowerCase(),
      displayName: username,
      walletAddress,
      domainClaim: {
        txId,
        fee,
        claimedAt: new Date(),
        blockchainConfirmed: true // Confirmed since we verified it
      },
      profile: {
        bio: `Welcome to ${username}.btc`,
        isPublic: true
      },
      socialLinks: {},
      sbts: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newUser.save();

    console.log(`Domain ${username}.btc claimed by ${walletAddress} with tx ${txId}`);

    res.status(201).json({
      message: 'Domain claimed successfully',
      user: {
        username: newUser.username,
        displayName: newUser.displayName,
        walletAddress: newUser.walletAddress,
        profileUrl: `/${newUser.username}/profile`,
        dashboardUrl: `/${newUser.username}/dashboard`,
        txId: newUser.domainClaim.txId
      }
    });

  } catch (error) {
    console.error('Domain claim error:', error);
    res.status(500).json({ 
      error: 'Failed to claim domain',
      details: error.message 
    });
  }
});

// GET /api/domains/:username - Get domain info
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'Domain not found' });
    }

    res.json({
      username: user.username,
      displayName: user.displayName,
      walletAddress: user.walletAddress,
      domainClaim: user.domainClaim,
      profile: user.profile,
      socialLinks: user.socialLinks,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Get domain error:', error);
    res.status(500).json({ 
      error: 'Failed to get domain info',
      details: error.message 
    });
  }
});

// GET /api/domains/check/:username - Check if domain is available
router.get('/check/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    
    res.json({
      username: username.toLowerCase(),
      available: !existingUser,
      message: existingUser ? 'Domain already claimed' : 'Domain available'
    });

  } catch (error) {
    console.error('Check domain error:', error);
    res.status(500).json({ 
      error: 'Failed to check domain availability',
      details: error.message 
    });
  }
});

export default router;
