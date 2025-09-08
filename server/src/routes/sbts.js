import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// Send SBT to another user
router.post('/sbts/send', async (req, res) => {
  try {
    const {
      recipientAddress,
      recipientUsername,
      name,
      description,
      issuer,
      imageUrl,
      message,
      senderUsername,
      senderAddress
    } = req.body;

    // Validate required fields
    if (!name || !description || !issuer) {
      return res.status(400).json({ error: 'Name, description, and issuer are required' });
    }

    if (!recipientAddress && !recipientUsername) {
      return res.status(400).json({ error: 'Either recipient address or username is required' });
    }

    // Find recipient user
    let recipient;
    if (recipientUsername) {
      recipient = await User.findOne({ username: recipientUsername.toLowerCase() });
      if (!recipient) {
        return res.status(404).json({ error: `User "${recipientUsername}.btc" not found` });
      }
    } else if (recipientAddress) {
      recipient = await User.findOne({ walletAddress: recipientAddress });
      if (!recipient) {
        // Create a new user profile for the wallet address if it doesn't exist
        recipient = new User({
          walletAddress: recipientAddress,
          username: null, // No username claimed yet
          displayName: recipientAddress.slice(0, 8) + '...' + recipientAddress.slice(-4),
          sbts: [],
          socialLinks: {},
          profile: {},
          stats: { profileViews: 0 },
          createdAt: new Date(),
          lastActive: new Date()
        });
      }
    }

    // Create the SBT object
    const newSBT = {
      name: name.trim(),
      description: description.trim(),
      issuer: issuer.trim(),
      imageUrl: imageUrl?.trim() || '',
      message: message?.trim() || '',
      issuedAt: new Date(),
      sentBy: senderUsername,
      senderAddress: senderAddress,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9) // Unique ID
    };

    // Add SBT to recipient's profile
    if (!recipient.sbts) {
      recipient.sbts = [];
    }
    recipient.sbts.push(newSBT);
    recipient.lastActive = new Date();

    // Save the recipient
    await recipient.save();

    // Determine recipient display name for response
    const recipientDisplay = recipient.username 
      ? `${recipient.username}.btc` 
      : `${recipient.walletAddress.slice(0, 8)}...${recipient.walletAddress.slice(-4)}`;

    res.json({
      message: 'SBT sent successfully',
      recipient: recipientDisplay,
      sbt: newSBT,
      recipientProfile: recipient.username ? `/${recipient.username}/profile` : null
    });

  } catch (error) {
    console.error('Send SBT error:', error);
    res.status(500).json({ error: 'Failed to send SBT' });
  }
});

// Get SBTs sent by a specific user
router.get('/sbts/sent/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find all users who have SBTs sent by this username
    const recipients = await User.find({
      'sbts.sentBy': username
    }).select('username walletAddress sbts displayName');

    const sentSBTs = [];
    recipients.forEach(recipient => {
      const recipientSBTs = recipient.sbts.filter(sbt => sbt.sentBy === username);
      recipientSBTs.forEach(sbt => {
        sentSBTs.push({
          ...sbt.toObject(),
          recipientUsername: recipient.username,
          recipientAddress: recipient.walletAddress,
          recipientDisplay: recipient.username 
            ? `${recipient.username}.btc` 
            : `${recipient.walletAddress.slice(0, 8)}...${recipient.walletAddress.slice(-4)}`
        });
      });
    });

    res.json({
      sentSBTs,
      count: sentSBTs.length
    });

  } catch (error) {
    console.error('Get sent SBTs error:', error);
    res.status(500).json({ error: 'Failed to fetch sent SBTs' });
  }
});

export default router;