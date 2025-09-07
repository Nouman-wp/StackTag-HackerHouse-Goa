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
      unique: true,
      index: true 
    },
    displayName: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    avatarUrl: { type: String },
    bannerUrl: { type: String },
    email: { type: String, lowercase: true, trim: true },
    website: { type: String },
    location: { type: String },
    isVerified: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    stats: {
      profileViews: { type: Number, default: 0 },
      sbtsReceived: { type: Number, default: 0 },
      sbtsIssued: { type: Number, default: 0 },
      domainsOwned: { type: Number, default: 1 }
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

export const User = mongoose.model('User', userSchema);
