import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// Get user profile by username
router.get('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Increment profile views
    await User.findByIdAndUpdate(user._id, { 
      $inc: { 'stats.profileViews': 1 },
      lastActive: new Date()
    });

    res.json({
      user: user.toJSON(),
      sbts: user.sbts || [],
      socialLinks: user.socialLinks || {},
      profile: user.profile || {}
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile (simplified - domains are claimed via /api/domains/claim)
router.put('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { profile, socialLinks, displayName } = req.body;

    const user = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { 
        displayName,
        profile: profile || {},
        socialLinks: socialLinks || {},
        lastActive: new Date()
      },
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

// Get user by wallet address
router.get('/users', async (req, res) => {
  try {
    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by wallet error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
