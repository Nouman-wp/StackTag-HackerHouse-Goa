import { Router } from 'express';
import multer from 'multer';
import User from '../models/User.js';
import sbtService from '../services/sbtService.js';

const router = Router();

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

    // Validate using SBT service
    const validation = sbtService.validateSBTData({ name, description, issuer, imageUrl });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.errors.join(', ') });
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

    // Process SBT creation and upload to IPFS
    console.log('📤 Processing SBT creation with IPFS upload...');
    const sbtData = {
      name: name.trim(),
      description: description.trim(),
      issuer: issuer.trim(),
      imageUrl: imageUrl?.trim() || '',
      message: message?.trim() || '',
      senderUsername,
      recipientAddress: recipient.walletAddress
    };

    const ipfsResult = await sbtService.processSBTCreation(sbtData);
    
    if (!ipfsResult.success) {
      return res.status(500).json({ error: ipfsResult.error });
    }

    // Create the SBT object with IPFS metadata
    const newSBT = {
      name: name.trim(),
      description: description.trim(),
      issuer: issuer.trim(),
      imageUrl: imageUrl?.trim() || '',
      message: message?.trim() || '',
      metadataUrl: ipfsResult.ipfsUrl, // IPFS URL for metadata
      ipfsHash: ipfsResult.ipfsHash,
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

    console.log('✅ SBT sent successfully with IPFS metadata');
    res.json({
      message: 'SBT sent successfully',
      recipient: recipientDisplay,
      sbt: newSBT,
      ipfsUrl: ipfsResult.ipfsUrl,
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

// Upload SBT image to IPFS
router.post('/sbts/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('📤 Uploading SBT image to IPFS...');
    const imageResult = await sbtService.uploadImageToIPFS(req.file.buffer, req.file.originalname);

    res.json({
      success: true,
      ipfsHash: imageResult.ipfsHash,
      ipfsUrl: imageResult.ipfsUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Enhanced SBT import with IPFS upload
router.post('/sbts/import', upload.single('image'), async (req, res) => {
  try {
    const { username, name, description, issuer, imageUrl } = req.body;

    if (!username || !name || !description || !issuer) {
      return res.status(400).json({ error: 'Username, name, description, and issuer are required' });
    }

    // Find the user
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let finalImageUrl = imageUrl || '';

    // If an image file was uploaded, upload it to IPFS
    if (req.file) {
      console.log('📤 Uploading SBT image to IPFS...');
      const imageResult = await sbtService.uploadImageToIPFS(req.file.buffer, req.file.originalname);
      finalImageUrl = imageResult.ipfsUrl;
    }

    // Process SBT creation and upload metadata to IPFS
    const sbtData = {
      name: name.trim(),
      description: description.trim(),
      issuer: issuer.trim(),
      imageUrl: finalImageUrl,
      importedBy: username
    };

    const ipfsResult = await sbtService.processSBTCreation(sbtData);
    
    if (!ipfsResult.success) {
      return res.status(500).json({ error: ipfsResult.error });
    }

    // Create the SBT object
    const newSBT = {
      name: name.trim(),
      description: description.trim(),
      issuer: issuer.trim(),
      imageUrl: finalImageUrl,
      metadataUrl: ipfsResult.ipfsUrl, // IPFS URL for metadata
      ipfsHash: ipfsResult.ipfsHash,
      issuedAt: new Date(),
      importedBy: username,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    // Add SBT to user's profile
    if (!user.sbts) {
      user.sbts = [];
    }
    user.sbts.push(newSBT);
    user.lastActive = new Date();

    // Save the user
    await user.save();

    console.log('✅ SBT imported successfully with IPFS metadata');
    res.json({
      message: 'SBT imported successfully',
      sbt: newSBT,
      ipfsUrl: ipfsResult.ipfsUrl,
      user: user
    });

  } catch (error) {
    console.error('SBT import error:', error);
    res.status(500).json({ error: 'Failed to import SBT' });
  }
});

export default router;