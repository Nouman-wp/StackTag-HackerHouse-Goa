import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      trim: true,
      match: /^[a-zA-Z0-9-]+$/
    },
    walletAddress: { 
      type: String, 
      required: true, 
      index: true 
    },
    displayName: { type: String, trim: true },
    
    // Domain claim information
    domainClaim: {
      txId: { type: String, required: true },
      fee: { type: String, default: '20 STX' },
      claimedAt: { type: Date, default: Date.now },
      blockchainConfirmed: { type: Boolean, default: false }
    },
    
    // Profile information
    profile: {
      bio: { type: String, maxlength: 500 },
      avatarUrl: { type: String },
      bannerUrl: { type: String },
      website: { type: String },
      location: { type: String },
      isPublic: { type: Boolean, default: true }
    },
    
    // Social links
    socialLinks: {
      twitter: { type: String },
      farcaster: { type: String },
      base: { type: String },
      github: { type: String },
      linkedin: { type: String },
      discord: { type: String }
    },
    
    // SBTs (Soulbound Tokens)
    sbts: [{
      tokenId: { type: String },
      name: { type: String },
      description: { type: String },
      imageUrl: { type: String },
      issuer: { type: String },
      issuerAddress: { type: String },
      issuedAt: { type: Date, default: Date.now },
      metadata: { type: Object }
    }],
    
    isVerified: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now },
    
    stats: {
      profileViews: { type: Number, default: 0 },
      sbtsReceived: { type: Number, default: 0 },
      sbtsIssued: { type: Number, default: 0 }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for full domain name
userSchema.virtual('domainName').get(function() {
  return `${this.username}.btc`;
});

// Index for text search
userSchema.index({ 
  username: 'text', 
  displayName: 'text', 
  bio: 'text' 
});

const User = mongoose.model('User', userSchema);
export default User;
