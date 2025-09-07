import { Router } from 'express';
import multer from 'multer';
import { createPinata } from '../services/pinata.js';
import stream from 'stream';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload/image', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file_required' });
    const pinata = createPinata();
    const pass = new stream.PassThrough();
    pass.end(req.file.buffer);
    const result = await pinata.pinFileToIPFS(pass, {
      pinataMetadata: { name: req.file.originalname },
      pinataOptions: { cidVersion: 1 },
    });
    res.json({ cid: result.IpfsHash, uri: `ipfs://${result.IpfsHash}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'upload_failed' });
  }
});

export default router;


