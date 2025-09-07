import pinataSDK from '@pinata/sdk';

const pinataJwt = process.env.PINATA_JWT;

export function createPinata() {
  if (!pinataJwt) {
    throw new Error('Missing PINATA_JWT');
  }
  // Using JWT auth mode
  const pinata = new pinataSDK({ pinataJWTKey: pinataJwt });
  return pinata;
}


