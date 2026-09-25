import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

const app = express();
const port = Number(process.env.API_PORT || 3001);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', timestamp: new Date().toISOString() });
});

app.get('/api/v1/search', (_req, res) => {
  res.json({
    query: _req.query.q || '',
    results: [],
    message: 'Search API ready for implementation',
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
