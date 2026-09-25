import express, { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { AuthService } from '../services/authService';
import { authenticateToken } from './auth';

const router: Router = express.Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

let authService: AuthService;

export function initSavedSearchRoutes(db: Knex, dbService: any): Router {
  authService = new AuthService(db);

  /**
   * POST /api/v1/saved-searches
   * Create a saved search
   */
  router.post(
    '/',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const { title, description, query, filters } = req.body;

        if (!title || !query) {
          return res.status(400).json({
            error: 'Title and query are required',
          });
        }

        const search = await dbService.createSavedSearch({
          user_id: req.user!.id,
          title,
          description,
          query,
          filters: filters || {},
        });

        return res.status(201).json({ search });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to create saved search',
          message: errorMessage,
        });
      }
    }
  );

  /**
   * GET /api/v1/saved-searches
   * List user's saved searches
   */
  router.get(
    '/',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const searches = await dbService.listSavedSearches(req.user!.id);
        return res.status(200).json({ searches });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to fetch saved searches',
          message: errorMessage,
        });
      }
    }
  );

  /**
   * GET /api/v1/saved-searches/:id
   * Get a saved search by ID
   */
  router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const search = await dbService.getSavedSearch(req.params.id);

      if (!search || search.user_id !== req.user!.id) {
        return res.status(404).json({ error: 'Saved search not found' });
      }

      return res.status(200).json({ search });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to fetch saved search',
        message: errorMessage,
      });
    }
  });

  /**
   * PUT /api/v1/saved-searches/:id
   * Update a saved search
   */
  router.put(
    '/:id',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const search = await dbService.getSavedSearch(req.params.id);

        if (!search || search.user_id !== req.user!.id) {
          return res.status(404).json({ error: 'Saved search not found' });
        }

        const updated = await dbService.updateSavedSearch(req.params.id, req.body);
        return res.status(200).json({ search: updated });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to update saved search',
          message: errorMessage,
        });
      }
    }
  );

  /**
   * DELETE /api/v1/saved-searches/:id
   * Delete a saved search
   */
  router.delete(
    '/:id',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const search = await dbService.getSavedSearch(req.params.id);

        if (!search || search.user_id !== req.user!.id) {
          return res.status(404).json({ error: 'Saved search not found' });
        }

        await dbService.deleteSavedSearch(req.params.id);
        return res.status(204).send();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to delete saved search',
          message: errorMessage,
        });
      }
    }
  );

  return router;
}
