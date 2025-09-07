import { Router } from 'express';
import { User } from '../models/User.js';
import { SBT } from '../models/SBT.js';
import { SocialLink } from '../models/SocialLink.js';
import { Wallet } from '../models/Wallet.js';

const router = Router();

// Get user profile by username
router.get('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's SBTs
    const sbts = await SBT.find({ 
      'recipient.address': user.walletAddress,
      isActive: true 
    }).sort({ issuedAt: -1 });

    // Get user's social links
    const socialLinks = await SocialLink.find({ 
      userId: user._id,
      isPublic: true 
    }).sort({ order: 1 });

    // Get user's wallets
    const wallets = await Wallet.find({ 
      userId: user._id,
      isPublic: true 
    }).sort({ order: 1 });

    // Increment profile views
    await User.findByIdAndUpdate(user._id, { 
      $inc: { 'stats.profileViews': 1 },
      lastActive: new Date()
    });

    res.json({
      user: {
        ...user.toJSON(),
        walletAddress: undefined // Hide primary wallet for privacy
      },
      sbts,
      socialLinks,
      wallets
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Create or update user profile
router.post('/users', async (req, res) => {
  try {
    const { 
      username, 
      walletAddress, 
      displayName, 
      bio, 
      avatarUrl, 
      bannerUrl,
      email,
      website,
      location
    } = req.body;

    if (!username || !walletAddress) {
      return res.status(400).json({ error: 'Username and wallet address are required' });
    }

    // Check if username is available
    const existingUser = await User.findOne({ 
      username: username.toLowerCase(),
      walletAddress: { $ne: walletAddress }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const user = await User.findOneAndUpdate(
      { walletAddress },
      {
        username: username.toLowerCase(),
        walletAddress,
        displayName,
        bio,
        avatarUrl,
        bannerUrl,
        email,
        website,
        location,
        lastActive: new Date()
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Create/update user error:', error);
    if (error.code === 11000) {
      res.status(409).json({ error: 'Username or wallet address already exists' });
    } else if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to save user profile' });
    }
  }
});

// Update user profile
router.put('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const updates = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.walletAddress;
    delete updates.username;
    delete updates.stats;

    const user = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { ...updates, lastActive: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Search users or get by wallet address
router.get('/users', async (req, res) => {
  try {
    const { q, walletAddress, limit = 20, skip = 0 } = req.query;
    
    let query = {};
    
    if (walletAddress) {
      // Search by wallet address
      query = { walletAddress };
    } else if (q) {
      // Text search
      query = { $text: { $search: q } };
    }

    const users = await User.find(query)
      .select('username displayName avatarUrl bio stats walletAddress')
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ 'stats.profileViews': -1 });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;
