import { Router } from 'express';
import multer from 'multer';
import User from '../models/User.js';

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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

// Update social links for a user
router.put('/users/:username/social', async (req, res) => {
  try {
    const { username } = req.params;
    const { socialLinks } = req.body;

    // Validate and clean social links
    const cleanedLinks = {};
    if (socialLinks) {
      Object.keys(socialLinks).forEach(platform => {
        const value = socialLinks[platform];
        if (value && typeof value === 'string' && value.trim()) {
          // Remove @ symbol and clean username
          cleanedLinks[platform] = value.trim().replace(/^@/, '');
        }
      });
    }

    const user = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { 
        socialLinks: cleanedLinks,
        lastActive: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Social links updated successfully', user });
  } catch (error) {
    console.error('Update social links error:', error);
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

// Add SBT to user profile with file upload support
router.post('/users/:username/sbts', upload.single('image'), async (req, res) => {
  try {
    const { username } = req.params;
    
    // Get form data
    const { name, description, issuer, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !issuer) {
      return res.status(400).json({ error: 'Name, description, and issuer are required' });
    }

    // Handle image - either uploaded file or URL
    let finalImageUrl = imageUrl?.trim() || '';
    
    if (req.file) {
      // Convert uploaded file to base64 for simple storage
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      finalImageUrl = base64Image;
      console.log(`📷 Image uploaded for SBT: ${req.file.originalname} (${req.file.size} bytes)`);
    }

    const newSBT = {
      name: name.trim(),
      description: description.trim(),
      issuer: issuer.trim(),
      imageUrl: finalImageUrl,
      issuedAt: new Date(),
      importedBy: username,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    const user = await User.findOneAndUpdate(
      { username: username.toLowerCase() },
      { 
        $push: { sbts: newSBT },
        lastActive: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`✅ SBT "${name}" added to ${username}'s profile`);
    res.json({ 
      message: 'SBT added successfully', 
      sbt: newSBT, 
      user: {
        username: user.username,
        displayName: user.displayName,
        sbtCount: user.sbts?.length || 0
      }
    });
  } catch (error) {
    console.error('Add SBT error:', error);
    res.status(500).json({ error: 'Failed to add SBT' });
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
