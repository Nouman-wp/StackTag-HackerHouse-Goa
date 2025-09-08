import { PinataSDK } from 'pinata-web3';

// Simplified service without Stacks contract integration for now
// We'll add contract functionality after basic IPFS works

class SBTService {
  constructor() {
    this.pinata = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT,
      pinataGateway: process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud'
    });
    // Removed Stacks network initialization for now
    this.contractAddress = process.env.SBT_CONTRACT_ADDRESS || '';
    this.contractName = process.env.SBT_CONTRACT_NAME || 'simple-sbt';
  }

  // Upload SBT metadata to IPFS via Pinata
  async uploadSBTMetadata(sbtData) {
    try {
      const metadata = {
        name: sbtData.name,
        description: sbtData.description,
        image: sbtData.imageUrl || '',
        issuer: sbtData.issuer,
        message: sbtData.message || '',
        issuedAt: new Date().toISOString(),
        attributes: [
          {
            trait_type: "Issuer",
            value: sbtData.issuer
          },
          {
            trait_type: "Issued At",
            value: new Date().toLocaleDateString()
          }
        ]
      };

      // Add custom attributes if provided
      if (sbtData.attributes) {
        metadata.attributes.push(...sbtData.attributes);
      }

      console.log('📤 Uploading SBT metadata to IPFS...');
      const upload = await this.pinata.upload.json(metadata);
      
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;
      console.log(`✅ Metadata uploaded to IPFS: ${ipfsUrl}`);

      return {
        ipfsHash: upload.IpfsHash,
        ipfsUrl: ipfsUrl,
        metadata: metadata
      };

    } catch (error) {
      console.error('❌ Failed to upload to IPFS:', error);
      throw new Error('Failed to upload metadata to IPFS');
    }
  }

  // Upload image to IPFS if it's a file
  async uploadImageToIPFS(imageBuffer, filename) {
    try {
      console.log('📤 Uploading image to IPFS...');
      const upload = await this.pinata.upload.file(imageBuffer, {
        metadata: {
          name: filename
        }
      });

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${upload.IpfsHash}`;
      console.log(`✅ Image uploaded to IPFS: ${ipfsUrl}`);

      return {
        ipfsHash: upload.IpfsHash,
        ipfsUrl: ipfsUrl
      };

    } catch (error) {
      console.error('❌ Failed to upload image to IPFS:', error);
      throw new Error('Failed to upload image to IPFS');
    }
  }

  // Contract functions temporarily disabled - will re-enable after Stacks import fix
  // createMintSBTTransaction(senderPrivateKey, recipientAddress, name, description, imageUrl, issuer) {
  //   // TODO: Re-implement after fixing Stacks library imports
  //   throw new Error('Contract functionality temporarily disabled');
  // }

  // broadcastTransaction(transaction) {
  //   // TODO: Re-implement after fixing Stacks library imports  
  //   throw new Error('Contract functionality temporarily disabled');
  // }

  // Get SBT metadata from contract
  async getSBTMetadata(sbtId) {
    try {
      // This would typically use a read-only function call
      // For now, we'll return a placeholder
      return {
        name: 'SBT Token',
        description: 'A Soulbound Token',
        image: '',
        issuer: 'Unknown',
        recipient: 'Unknown'
      };
    } catch (error) {
      console.error('❌ Failed to get SBT metadata:', error);
      throw new Error('Failed to get SBT metadata');
    }
  }

  // Validate SBT data
  validateSBTData(sbtData) {
    const errors = [];

    if (!sbtData.name || sbtData.name.trim().length === 0) {
      errors.push('Name is required');
    }
    if (sbtData.name && sbtData.name.length > 64) {
      errors.push('Name must be 64 characters or less');
    }

    if (!sbtData.description || sbtData.description.trim().length === 0) {
      errors.push('Description is required');
    }
    if (sbtData.description && sbtData.description.length > 256) {
      errors.push('Description must be 256 characters or less');
    }

    if (!sbtData.issuer || sbtData.issuer.trim().length === 0) {
      errors.push('Issuer is required');
    }
    if (sbtData.issuer && sbtData.issuer.length > 64) {
      errors.push('Issuer must be 64 characters or less');
    }

    if (sbtData.imageUrl && sbtData.imageUrl.length > 256) {
      errors.push('Image URL must be 256 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Process complete SBT creation (upload metadata + prepare for minting)
  async processSBTCreation(sbtData) {
    try {
      // Validate data
      const validation = this.validateSBTData(sbtData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Upload metadata to IPFS
      const ipfsResult = await this.uploadSBTMetadata(sbtData);

      // Return the IPFS URL to be used as the image/metadata URL in the contract
      return {
        success: true,
        ipfsHash: ipfsResult.ipfsHash,
        ipfsUrl: ipfsResult.ipfsUrl,
        metadata: ipfsResult.metadata
      };

    } catch (error) {
      console.error('❌ Failed to process SBT creation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new SBTService();
