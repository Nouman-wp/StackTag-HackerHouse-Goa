import { Router } from 'express';
import { Profile } from '../models/Profile.js';

const router = Router();

// Create or update profile basic info
router.post('/profile', async (req, res) => {
  try {
    const { bnsName, walletAddress, displayName, bio, socials, wallets, avatarCid, bannerCid } = req.body;
    if (!bnsName || !walletAddress) {
      return res.status(400).json({ error: 'bnsName and walletAddress are required' });
    }
    const profile = await Profile.findOneAndUpdate(
      { bnsName: bnsName.toLowerCase() },
      {
        bnsName: bnsName.toLowerCase(),
        walletAddress,
        displayName,
        bio,
        socials,
        wallets,
        avatarCid,
        bannerCid,
      },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_save_profile' });
  }
});

// Get profile by bns name
router.get('/profile/:bnsName', async (req, res) => {
  try {
    const profile = await Profile.findOne({ bnsName: req.params.bnsName.toLowerCase() });
    if (!profile) return res.status(404).json({ error: 'not_found' });
    res.json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_fetch_profile' });
  }
});

// Append a proof (SBT reference)
router.post('/profile/:bnsName/proofs', async (req, res) => {
  try {
    const { title, description, issuerAddress, tokenId, imageCid, txId } = req.body;
    const profile = await Profile.findOne({ bnsName: req.params.bnsName.toLowerCase() });
    if (!profile) return res.status(404).json({ error: 'not_found' });
    profile.proofs.push({ title, description, issuerAddress, tokenId, imageCid, txId });
    await profile.save();
    res.json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed_to_add_proof' });
  }
});

export default router;


