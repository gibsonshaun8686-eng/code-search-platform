import express, { Router, Request, Response } from 'express';
import { IndexingService } from '../services/indexingService';

const router: Router = express.Router();
const indexingService = new IndexingService();

/**
 * POST /api/v1/indexing/index
 * Trigger indexing for a repository
 */
router.post('/index', async (req: Request, res: Response) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        error: 'Repository URL is required',
      });
    }

    const job = await indexingService.indexRepository(repoUrl);

    return res.status(202).json({
      job,
      message: 'Indexing job created',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Indexing failed',
      message: errorMessage,
    });
  }
});

/**
 * GET /api/v1/indexing/job/:jobId
 * Get status of an indexing job
 */
router.get('/job/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = indexingService.getJob(jobId);

  if (!job) {
    return res.status(404).json({
      error: 'Job not found',
    });
  }

  return res.status(200).json({ job });
});

/**
 * GET /api/v1/indexing/repos
 * List all indexed repositories
 */
router.get('/repos', (req: Request, res: Response) => {
  const repos = indexingService.getIndexedRepos();
  return res.status(200).json({ repos });
});

/**
 * POST /api/v1/indexing/reindex
 * Reindex a repository
 */
router.post('/reindex', async (req: Request, res: Response) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        error: 'Repository URL is required',
      });
    }

    const job = await indexingService.reindexRepository(repoUrl);

    return res.status(202).json({
      job,
      message: 'Reindexing job created',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Reindexing failed',
      message: errorMessage,
    });
  }
});

export default router;
