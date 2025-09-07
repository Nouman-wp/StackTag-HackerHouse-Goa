import mongoose from 'mongoose';

const socialSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true },
    handle: { type: String, required: true },
    url: { type: String },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const proofSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    issuerAddress: { type: String, required: true },
    tokenId: { type: String, required: true },
    imageCid: { type: String },
    txId: { type: String },
    issuedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    bnsName: { type: String, unique: true, index: true },
    walletAddress: { type: String, index: true },
    displayName: { type: String },
    bio: { type: String },
    avatarCid: { type: String },
    bannerCid: { type: String },
    socials: [socialSchema],
    wallets: {
      bitcoin: { type: String },
      stacks: { type: String },
      ethereum: { type: String },
      base: { type: String },
      solana: { type: String },
    },
    proofs: [proofSchema],
  },
  { timestamps: true }
);

export const Profile = mongoose.model('Profile', profileSchema);


