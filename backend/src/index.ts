import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import db from './config/knex';
import { initAuthRoutes } from './routes/auth';
import { initSavedSearchRoutes } from './routes/savedSearches';
import { initRepositoryRoutes } from './routes/repositories';
import { initOrganizationRoutes } from './routes/organizations';
import { initAnalyticsRoutes } from './routes/analytics';
import searchRoutes from './routes/search';
import indexingRoutes from './routes/indexing';
import { DatabaseService } from './services/databaseService';

dotenv.config();

const app = express();
const port = Number(process.env.API_PORT || 3001);
const dbService = new DatabaseService(db);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Code Search Platform API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', initAuthRoutes(db));
app.use('/api/v1/saved-searches', initSavedSearchRoutes(db, dbService));
app.use('/api/v1/repositories', initRepositoryRoutes(db, dbService));
app.use('/api/v1/organizations', initOrganizationRoutes(db));
app.use('/api/v1/analytics', initAnalyticsRoutes(db));
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/indexing', indexingRoutes);

// Error handling middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`\n🚀 Code Search Platform API running on http://localhost:${port}`);
  console.log(`📝 Health check: http://localhost:${port}/health`);
  console.log(`\n📚 API Documentation:`);
  console.log(`  Authentication: POST /api/v1/auth/register, /api/v1/auth/login`);
  console.log(`  Search: POST /api/v1/search`);
  console.log(`  Repositories: GET|POST /api/v1/repositories`);
  console.log(`  Organizations: GET|POST /api/v1/organizations`);
  console.log(`  Saved Searches: GET|POST|PUT|DELETE /api/v1/saved-searches`);
  console.log(`  Analytics: GET /api/v1/analytics/*`);
});
