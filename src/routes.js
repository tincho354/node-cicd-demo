import { Router } from 'express';
import pkg from '../package.json' assert { type: 'json' };

const router = Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Hello from Node CI/CD demo 👋' });
});

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/version', (_req, res) => {
  const version = process.env.VERSION || pkg.version || '0.0.0';
  res.json({ version });
});

export default router;
