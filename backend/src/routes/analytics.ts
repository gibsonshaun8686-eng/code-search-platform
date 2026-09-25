import express, { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { AuthService } from '../services/authService';
import { authenticateToken } from './auth';

const router: Router = express.Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

let authService: AuthService;

export function initAnalyticsRoutes(db: Knex): Router {
  authService = new AuthService(db);

  /**
   * GET /api/v1/analytics/search-stats
   * Get search statistics for user
   */
  router.get(
    '/search-stats',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const stats = await db('search_history')
          .where({ user_id: req.user!.id })
          .select(db.raw('COUNT(*) as total_searches'))
          .select(db.raw('AVG(execution_time_ms) as avg_execution_time'))
          .select(db.raw('MAX(execution_time_ms) as max_execution_time'))
          .first();

        return res.status(200).json({ stats });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to fetch analytics',
          message: errorMessage,
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/org/:orgId/stats
   * Get organization-wide analytics
   */
  router.get(
    '/org/:orgId/stats',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const members = await db('organization_members')
          .where({ org_id: req.params.orgId })
          .select('user_id');

        const userIds = members.map(m => m.user_id);

        const stats = await db('search_history')
          .whereIn('user_id', userIds)
          .select(db.raw('COUNT(*) as total_searches'))
          .select(db.raw('COUNT(DISTINCT user_id) as unique_users'))
          .select(db.raw('AVG(execution_time_ms) as avg_execution_time'))
          .first();

        const topQueries = await db('search_history')
          .whereIn('user_id', userIds)
          .select('query')
          .select(db.raw('COUNT(*) as count'))
          .groupBy('query')
          .orderBy('count', 'desc')
          .limit(10);

        return res.status(200).json({
          stats,
          topQueries,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to fetch org analytics',
          message: errorMessage,
        });
      }
    }
  );

  /**
   * GET /api/v1/analytics/audit-logs
   * Get audit logs
   */
  router.get(
    '/audit-logs',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const logs = await authService.getAuditLogs({
          limit: 100,
        });

        return res.status(200).json({ logs });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to fetch audit logs',
          message: errorMessage,
        });
      }
    }
  );

  return router;
}
