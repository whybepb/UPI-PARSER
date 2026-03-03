import express from 'express';
import syncRoutes from './routes/sync.js';
import { initSchema } from './lib/db.js';

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use('/api', syncRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
initSchema().then(() => {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`SyncSpend backend listening on ${port}`);
  });
}).catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Backend startup failed:', error?.message || error);
  if (error?.code) {
    // eslint-disable-next-line no-console
    console.error('Error code:', error.code);
  }
  if (Array.isArray(error?.errors)) {
    // eslint-disable-next-line no-console
    console.error('Aggregate errors:', error.errors);
  }
  process.exit(1);
});
