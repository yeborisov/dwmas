import { Router } from 'express';
import { cacheService } from '../services/cacheService';

const router = Router();

router.delete('/', async (req, res) => {
  await cacheService.invalidateAll();
  res.json({ status: 'cache invalidated' });
});

router.delete('/prefix', async (req, res) => {
  const { prefix } = req.body;
  await cacheService.invalidatePrefix(prefix);
  res.json({ status: 'cache prefix invalidated', prefix });
});

export { router as cacheRouter };
