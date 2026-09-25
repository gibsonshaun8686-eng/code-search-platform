import express, { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { AuthService } from '../services/authService';
import { authenticateToken } from './auth';

const router: Router = express.Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

let authService: AuthService;

export function initOrganizationRoutes(db: Knex): Router {
  authService = new AuthService(db);

  /**
   * POST /api/v1/organizations
   * Create a new organization
   */
  router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { name, slug, description } = req.body;

      if (!name || !slug) {
        return res.status(400).json({
          error: 'Name and slug are required',
        });
      }

      const org = await authService.createOrganization({
        name,
        slug,
        owner_id: req.user!.id,
        description,
      });

      return res.status(201).json({ organization: org });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to create organization',
        message: errorMessage,
      });
    }
  });

  /**
   * GET /api/v1/organizations
   * List user's organizations
   */
  router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const orgs = await authService.listUserOrganizations(req.user!.id);
      return res.status(200).json({ organizations: orgs });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to fetch organizations',
        message: errorMessage,
      });
    }
  });

  /**
   * GET /api/v1/organizations/:id
   * Get organization details
   */
  router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const org = await authService.getOrganization(req.params.id);

      if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      return res.status(200).json({ organization: org });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to fetch organization',
        message: errorMessage,
      });
    }
  });

  /**
   * GET /api/v1/organizations/:id/members
   * List organization members
   */
  router.get(
    '/:id/members',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const members = await authService.getOrganizationMembers(req.params.id);
        return res.status(200).json({ members });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to fetch members',
          message: errorMessage,
        });
      }
    }
  );

  /**
   * POST /api/v1/organizations/:id/members
   * Add member to organization
   */
  router.post(
    '/:id/members',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const { user_id, role } = req.body;

        if (!user_id) {
          return res.status(400).json({
            error: 'User ID is required',
          });
        }

        const member = await authService.addOrganizationMember(
          req.params.id,
          user_id,
          role || 'member'
        );

        return res.status(201).json({ member });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to add member',
          message: errorMessage,
        });
      }
    }
  );

  /**
   * DELETE /api/v1/organizations/:id/members/:userId
   * Remove member from organization
   */
  router.delete(
    '/:id/members/:userId',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        await authService.removeOrganizationMember(req.params.id, req.params.userId);
        return res.status(204).send();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to remove member',
          message: errorMessage,
        });
      }
    }
  );

  /**
   * PUT /api/v1/organizations/:id/members/:userId
   * Update member role
   */
  router.put(
    '/:id/members/:userId',
    authenticateToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const { role } = req.body;

        if (!role) {
          return res.status(400).json({
            error: 'Role is required',
          });
        }

        const member = await authService.updateOrganizationMemberRole(
          req.params.id,
          req.params.userId,
          role
        );

        return res.status(200).json({ member });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({
          error: 'Failed to update member',
          message: errorMessage,
        });
      }
    }
  );

  return router;
}
