import { Router } from 'express';
import { SBT } from '../models/SBT.js';
import { User } from '../models/User.js';

const router = Router();

// Get SBTs for a user
router.get('/users/:username/sbts', async (req, res) => {
  try {
    const { username } = req.params;
    const { category, limit = 50, skip = 0 } = req.query;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let query = { 
      'recipient.address': user.walletAddress,
      isActive: true 
    };

    if (category) {
      query.category = category;
    }

    const sbts = await SBT.find(query)
      .sort({ issuedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    res.json(sbts);
  } catch (error) {
    console.error('Get user SBTs error:', error);
    res.status(500).json({ error: 'Failed to fetch SBTs' });
  }
});

// Issue new SBT
router.post('/sbts', async (req, res) => {
  try {
    const {
      tokenId,
      title,
      description,
      imageUrl,
      imageCid,
      category,
      issuerAddress,
      issuerName,
      recipientAddress,
      metadata,
      blockchain
    } = req.body;

    if (!tokenId || !title || !issuerAddress || !recipientAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find recipient user
    const recipient = await User.findOne({ walletAddress: recipientAddress });

    const sbt = new SBT({
      tokenId,
      title,
      description,
      imageUrl,
      imageCid,
      category: category || 'other',
      issuer: {
        address: issuerAddress,
        name: issuerName
      },
      recipient: {
        address: recipientAddress,
        username: recipient?.username
      },
      metadata,
      blockchain
    });

    await sbt.save();

    // Update recipient stats
    if (recipient) {
      await User.findByIdAndUpdate(recipient._id, {
        $inc: { 'stats.sbtsReceived': 1 }
      });
    }

    // Update issuer stats if they're also a user
    const issuer = await User.findOne({ walletAddress: issuerAddress });
    if (issuer) {
      await User.findByIdAndUpdate(issuer._id, {
        $inc: { 'stats.sbtsIssued': 1 }
      });
    }

    res.status(201).json(sbt);
  } catch (error) {
    console.error('Issue SBT error:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'SBT with this token ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to issue SBT' });
    }
  }
});

// Get SBT by token ID
router.get('/sbts/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const sbt = await SBT.findOne({ tokenId, isActive: true });
    if (!sbt) {
      return res.status(404).json({ error: 'SBT not found' });
    }

    res.json(sbt);
  } catch (error) {
    console.error('Get SBT error:', error);
    res.status(500).json({ error: 'Failed to fetch SBT' });
  }
});

// Update SBT
router.put('/sbts/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.tokenId;
    delete updates.issuer;
    delete updates.recipient;
    delete updates.blockchain;

    const sbt = await SBT.findOneAndUpdate(
      { tokenId, isActive: true },
      updates,
      { new: true, runValidators: true }
    );

    if (!sbt) {
      return res.status(404).json({ error: 'SBT not found' });
    }

    res.json(sbt);
  } catch (error) {
    console.error('Update SBT error:', error);
    res.status(500).json({ error: 'Failed to update SBT' });
  }
});

// Deactivate SBT
router.delete('/sbts/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const sbt = await SBT.findOneAndUpdate(
      { tokenId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!sbt) {
      return res.status(404).json({ error: 'SBT not found' });
    }

    res.json({ message: 'SBT deactivated successfully' });
  } catch (error) {
    console.error('Deactivate SBT error:', error);
    res.status(500).json({ error: 'Failed to deactivate SBT' });
  }
});

export default router;
