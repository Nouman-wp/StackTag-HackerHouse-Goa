import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    blockchain: {
      type: String,
      required: true,
      enum: ['stacks', 'bitcoin', 'ethereum', 'base', 'solana', 'polygon', 'other']
    },
    network: {
      type: String,
      required: true,
      enum: ['mainnet', 'testnet', 'devnet']
    },
    address: { 
      type: String, 
      required: true,
      trim: true 
    },
    label: { 
      type: String,
      trim: true 
    },
    isPrimary: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: true },
    balance: {
      amount: { type: Number, default: 0 },
      currency: { type: String },
      lastUpdated: { type: Date }
    },
    order: { type: Number, default: 0 }
  },
  { 
    timestamps: true 
  }
);

// Compound indexes
walletSchema.index({ userId: 1, blockchain: 1, network: 1 });
walletSchema.index({ address: 1, blockchain: 1, network: 1 }, { unique: true });
walletSchema.index({ userId: 1, isPrimary: 1 });

export const Wallet = mongoose.model('Wallet', walletSchema);
