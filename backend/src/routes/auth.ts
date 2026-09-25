import express, { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { AuthService } from '../services/authService';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

let authService: AuthService;

export function initAuthRoutes(db: Knex): Router {
  authService = new AuthService(db);

  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  router.post('/register', async (req: AuthRequest, res: Response) => {
    try {
      const { email, username, password } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({
          error: 'Email, username, and password are required',
        });
      }

      const existingUser = await authService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'User with this email already exists',
        });
      }

      const user = await authService.createUser({ email, username, password });

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      return res.status(201).json({
        user: { id: user.id, email: user.email, username: user.username },
        token,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Registration failed',
        message: errorMessage,
      });
    }
  });

  /**
   * POST /api/v1/auth/login
   * Login user
   */
  router.post('/login', async (req: AuthRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required',
        });
      }

      const user = await authService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
        });
      }

      const passwordValid = await authService.verifyPassword(user, password);
      if (!passwordValid) {
        return res.status(401).json({
          error: 'Invalid credentials',
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRY || '7d' }
      );

      return res.status(200).json({
        user: { id: user.id, email: user.email, username: user.username },
        token,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Login failed',
        message: errorMessage,
      });
    }
  });

  /**
   * POST /api/v1/auth/logout
   * Logout user (client-side token removal)
   */
  router.post('/logout', (req: AuthRequest, res: Response) => {
    return res.status(200).json({ message: 'Logged out successfully' });
  });

  /**
   * GET /api/v1/auth/me
   * Get current user
   */
  router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const user = await authService.getUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        error: 'Failed to fetch user',
        message: errorMessage,
      });
    }
  });

  return router;
}

/**
 * Middleware to verify JWT token
 */
export function authenticateToken(req: AuthRequest, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
