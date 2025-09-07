import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// Get SBTs for a user (now stored in user document)
router.get('/users/:username/sbts', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.sbts || []);
  } catch (error) {
    console.error('Get user SBTs error:', error);
    res.status(500).json({ error: 'Failed to fetch SBTs' });
  }
});

// Issue new SBT (add to user's sbts array)
router.post('/sbts', async (req, res) => {
  try {
    const {
      tokenId,
      name,
      description,
      imageUrl,
      issuer,
      issuerAddress,
      recipientAddress,
      metadata
    } = req.body;

    if (!tokenId || !name || !issuerAddress || !recipientAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find recipient user
    const recipient = await User.findOne({ walletAddress: recipientAddress });
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const sbtData = {
      tokenId,
      name,
      description,
      imageUrl,
      issuer,
      issuerAddress,
      issuedAt: new Date(),
      metadata: metadata || {}
    };

    // Add SBT to user's sbts array
    await User.findByIdAndUpdate(recipient._id, {
      $push: { sbts: sbtData },
      $inc: { 'stats.sbtsReceived': 1 }
    });

    // Update issuer stats if they're also a user
    const issuerUser = await User.findOne({ walletAddress: issuerAddress });
    if (issuerUser) {
      await User.findByIdAndUpdate(issuerUser._id, {
        $inc: { 'stats.sbtsIssued': 1 }
      });
    }

    res.status(201).json(sbtData);
  } catch (error) {
    console.error('Issue SBT error:', error);
    res.status(500).json({ error: 'Failed to issue SBT' });
  }
});

// Get SBT by token ID (search in all users)
router.get('/sbts/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const user = await User.findOne({ 'sbts.tokenId': tokenId });
    if (!user) {
      return res.status(404).json({ error: 'SBT not found' });
    }

    const sbt = user.sbts.find(s => s.tokenId === tokenId);
    res.json(sbt);
  } catch (error) {
    console.error('Get SBT error:', error);
    res.status(500).json({ error: 'Failed to fetch SBT' });
  }
});

export default router;
