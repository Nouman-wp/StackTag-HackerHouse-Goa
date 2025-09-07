import { Router } from 'express';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Simple BNS API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;