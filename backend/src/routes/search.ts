import express, { Router, Request, Response } from 'express';
import { SearchEngine } from '../services/searchEngine';
import { SemanticRanker } from '../services/semanticRanker';
import { SearchRequest } from '../types/search';

const router: Router = express.Router();
const searchEngine = new SearchEngine();
const semanticRanker = new SemanticRanker();

/**
 * POST /api/v1/search
 * Execute a code search query
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const searchReq: SearchRequest = {
      query: req.body.query,
      filters: req.body.filters,
      limit: req.body.limit || 50,
      offset: req.body.offset || 0,
    };

    if (!searchReq.query) {
      return res.status(400).json({
        error: 'Query is required',
      });
    }

    // Execute search
    let response = await searchEngine.search(searchReq);

    // Apply semantic ranking
    const semanticReranked = semanticRanker.rankResults(
      response.results,
      searchReq.query
    );
    response.results = semanticReranked;

    return res.status(200).json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Search failed',
      message: errorMessage,
    });
  }
});

/**
 * GET /api/v1/search/suggestions
 * Get search suggestions based on partial query
 */
router.get('/suggestions', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';

  const suggestions = [
    { type: 'qualifier', value: 'repo:', description: 'Search in specific repository' },
    { type: 'qualifier', value: 'language:', description: 'Filter by programming language' },
    { type: 'qualifier', value: 'path:', description: 'Search within path' },
    { type: 'qualifier', value: 'symbol:', description: 'Search for symbol definitions' },
    { type: 'qualifier', value: 'content:', description: 'Search content only' },
    { type: 'operator', value: 'AND', description: 'Match all terms' },
    { type: 'operator', value: 'OR', description: 'Match any term' },
    { type: 'operator', value: 'NOT', description: 'Exclude term' },
  ].filter(s => s.value.toLowerCase().includes(query.toLowerCase()));

  return res.status(200).json({ suggestions });
});

/**
 * GET /api/v1/search/templates
 * Get pre-built search templates
 */
router.get('/templates', (req: Request, res: Response) => {
  const templates = [
    {
      id: 'find-auth',
      title: 'Find authentication logic',
      query: 'symbol:authenticate OR symbol:login language:typescript',
      description: 'Find auth-related functions in TypeScript',
    },
    {
      id: 'find-api',
      title: 'Find API endpoints',
      query: 'path:/routes/ OR path:/api/ language:typescript NOT path:/tests/',
      description: 'Discover API route handlers',
    },
    {
      id: 'find-errors',
      title: 'Find error handling',
      query: 'content:"Error" OR content:"Exception" NOT path:/node_modules/',
      description: 'Locate error handling code',
    },
    {
      id: 'find-config',
      title: 'Find configuration',
      query: 'path:/config/ OR path:/env/ OR /\.env/',
      description: 'Search for config files',
    },
  ];

  return res.status(200).json({ templates });
});

export default router;
