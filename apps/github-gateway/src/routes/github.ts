import { Router, Request, Response } from 'express';
import { githubService } from '../services/githubService';

const router = Router();

router.all('/*', async (req: Request, res: Response) => {
  try {
    const result = await githubService.proxyRequest(req);
    res.status(result.status).set(result.headers).send(result.data);
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

export { router as githubApiRouter };
