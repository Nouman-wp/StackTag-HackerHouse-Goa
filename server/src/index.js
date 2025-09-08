import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/index.js';
import uploadRouter from './routes/upload.js';
import stacksRouter from './routes/stacks.js';
import sbtRouter from './routes/sbt.js';
import usersRouter from './routes/users.js';
import sbtsRouter from './routes/sbts.js';
import domainsRouter from './routes/domains.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: process.env.APP_DEPLOYMENT_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/api', apiRouter);
app.use('/api', uploadRouter);
app.use('/api', stacksRouter);
app.use('/api', sbtRouter);
app.use('/api', usersRouter);
app.use('/api', sbtsRouter);
app.use('/api/domains', domainsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Start server first so health endpoint is available even if Mongo is down
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Mongo connection (non-blocking)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/better_bns';
mongoose
  .connect(mongoUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Mongo connected');

    // Allow multiple users per wallet by dropping legacy unique index if present
    try {
      const db = mongoose.connection.db;
      db.collection('users').dropIndex('walletAddress_1').then(
        () => console.log('Dropped unique index walletAddress_1 (if it existed)'),
        () => {} // ignore if index not present
      );
    } catch {}
  })
  .catch((err) => {
    console.error('Mongo connection error (continuing without DB)', err?.message || err);
  });


