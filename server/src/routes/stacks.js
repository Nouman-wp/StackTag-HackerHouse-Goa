import { Router } from 'express';
import stacksNetwork from '@stacks/network';
import stacksTx from '@stacks/transactions';

const router = Router();

// This route prepares a contract call to claim a BNS-like name on testnet.
// The client should sign the transaction with the connected wallet.
router.post('/stacks/prepare-claim', async (req, res) => {
  try {
    const { name, ownerAddress } = req.body;
    if (!name || !ownerAddress) return res.status(400).json({ error: 'name_and_owner_required' });

    const { StacksTestnet } = stacksNetwork;
    const { bufferCV, stringAsciiCV } = stacksTx;
    const network = new StacksTestnet({ url: process.env.STACKS_CORE_API || 'https://stacks-node-api.testnet.stacks.co' });

    // We only serialize a suggested payload representation for the client to sign.
    // In practice the frontend will use @stacks/connect to open a contract call popup.
    const payload = {
      contractAddress: process.env.CONTRACT_ADDRESS || 'ST000000000000000000002AMW42H',
      contractName: process.env.BNS_CONTRACT_NAME || 'better-bns',
      functionName: 'claim',
      functionArgs: [stringAsciiCV(name), bufferCV(Buffer.from(ownerAddress))],
      network: 'testnet',
    };

    res.json({ ok: true, payload });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'prepare_failed' });
  }
});

export default router;


