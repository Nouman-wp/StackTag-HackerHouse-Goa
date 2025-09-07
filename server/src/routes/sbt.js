import { Router } from 'express';
import stacksTx from '@stacks/transactions';

const router = Router();

// Prepare an issue call payload; the client will sign/broadcast via Stacks Connect
router.post('/sbt/prepare-issue', async (req, res) => {
  try {
    const { recipientAddress, metadataCid } = req.body;
    if (!recipientAddress || !metadataCid) return res.status(400).json({ error: 'recipient_and_metadata_required' });

    const { stringAsciiCV } = stacksTx;
    const payload = {
      contractAddress: process.env.CONTRACT_ADDRESS || 'ST000000000000000000002AMW42H',
      contractName: process.env.SBT_CONTRACT_NAME || 'better-sbt',
      functionName: 'issue',
      functionArgs: [stringAsciiCV(recipientAddress), stringAsciiCV(metadataCid)],
      network: 'testnet',
    };
    res.json({ ok: true, payload });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'prepare_failed' });
  }
});

export default router;


