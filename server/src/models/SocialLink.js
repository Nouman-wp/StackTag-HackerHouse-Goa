import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    platform: {
      type: String,
      required: true,
      enum: ['twitter', 'github', 'linkedin', 'discord', 'telegram', 'youtube', 'instagram', 'website', 'other']
    },
    handle: { 
      type: String, 
      required: true,
      trim: true 
    },
    url: { 
      type: String, 
      required: true 
    },
    isVerified: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { 
    timestamps: true 
  }
);

// Compound index for user and platform uniqueness
socialLinkSchema.index({ userId: 1, platform: 1 }, { unique: true });
socialLinkSchema.index({ userId: 1, order: 1 });

export const SocialLink = mongoose.model('SocialLink', socialLinkSchema);
