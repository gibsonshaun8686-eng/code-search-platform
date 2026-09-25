import express, { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { AuthService } from '../services/authService';
import { authenticateToken } from './auth';

const router: Router = express.Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

let authService: AuthService;

export function initRepositoryRoutes(db: Knex, dbService: any): Router {
  authService = new AuthService(db);

  /**
   * GET /api/v1/repositories
   * List repositories
   */
  router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const org = (req.query.org as string) || undefined;
      const repos = await dbService.listRepositories(org);
      return res.status(200).json({ repositories: repos });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to fetch repositories',
        message: errorMessage,
      });
    }
  });

  /**
   * POST /api/v1/repositories
   * Add a new repository
   */
  router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { name, url, org, language, branch } = req.body;

      if (!name || !url) {
        return res.status(400).json({
          error: 'Repository name and URL are required',
        });
      }

      const repo = await dbService.createRepository({
        name,
        url,
        org,
        language: language || 'mixed',
        branch: branch || 'main',
        stars: 0,
      });

      await authService.logAudit({
        user_id: req.user!.id,
        action: 'CREATE',
        resource_type: 'repository',
        resource_id: repo.id,
        changes: { created: repo },
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      return res.status(201).json({ repository: repo });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to create repository',
        message: errorMessage,
      });
    }
  });

  /**
   * GET /api/v1/repositories/:id
   * Get repository details
   */
  router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const repo = await dbService.getRepository(req.params.id);

      if (!repo) {
        return res.status(404).json({ error: 'Repository not found' });
      }

      return res.status(200).json({ repository: repo });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to fetch repository',
        message: errorMessage,
      });
    }
  });

  /**
   * PUT /api/v1/repositories/:id
   * Update repository
   */
  router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const repo = await dbService.getRepository(req.params.id);

      if (!repo) {
        return res.status(404).json({ error: 'Repository not found' });
      }

      const updated = await dbService.updateRepository(req.params.id, req.body);

      await authService.logAudit({
        user_id: req.user!.id,
        action: 'UPDATE',
        resource_type: 'repository',
        resource_id: repo.id,
        changes: req.body,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      return res.status(200).json({ repository: updated });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to update repository',
        message: errorMessage,
      });
    }
  });

  /**
   * DELETE /api/v1/repositories/:id
   * Delete repository
   */
  router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const repo = await dbService.getRepository(req.params.id);

      if (!repo) {
        return res.status(404).json({ error: 'Repository not found' });
      }

      await dbService.deleteRepository(req.params.id);

      await authService.logAudit({
        user_id: req.user!.id,
        action: 'DELETE',
        resource_type: 'repository',
        resource_id: repo.id,
        changes: {},
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      return res.status(204).send();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to delete repository',
        message: errorMessage,
      });
    }
  });

  return router;
}
