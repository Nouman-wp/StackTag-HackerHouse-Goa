import mongoose from 'mongoose';

const sbtSchema = new mongoose.Schema(
  {
    tokenId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    description: { 
      type: String,
      maxlength: 1000 
    },
    imageUrl: { type: String },
    imageCid: { type: String },
    category: {
      type: String,
      enum: ['achievement', 'certification', 'contribution', 'membership', 'skill', 'other'],
      default: 'other'
    },
    issuer: {
      address: { type: String, required: true },
      name: { type: String },
      verified: { type: Boolean, default: false }
    },
    recipient: {
      address: { type: String, required: true },
      username: { type: String }
    },
    metadata: {
      skills: [String],
      tags: [String],
      externalUrl: String,
      attributes: [{
        trait_type: String,
        value: String
      }]
    },
    blockchain: {
      network: { type: String, default: 'stacks-testnet' },
      contractAddress: String,
      transactionId: String,
      blockHeight: Number,
      timestamp: Date
    },
    isActive: { type: Boolean, default: true },
    issuedAt: { type: Date, default: Date.now }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

// Indexes
sbtSchema.index({ 'recipient.address': 1, isActive: 1 });
sbtSchema.index({ 'issuer.address': 1 });
sbtSchema.index({ category: 1 });
sbtSchema.index({ 'metadata.tags': 1 });

export const SBT = mongoose.model('SBT', sbtSchema);
