# Code Search Platform - Quick Start Guide

## Overview

This is a **professional, production-ready code search and intelligence platform** built with:
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Search**: Advanced query parser + semantic ranking + symbol extraction
- **DevOps**: Docker + GitHub Actions + Cloud-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/gibsonshaun8686-eng/code-search-platform.git
cd code-search-platform

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start services (using Docker Compose recommended)
docker-compose -f docker/docker-compose.yml up -d

# Run migrations
npm run migrate

# Start development servers
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

## 📁 Project Structure

```
code-search-platform/
├── frontend/                    # React app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API client
│   │   ├── store/              # State management
│   │   └── styles/             # CSS/Tailwind
│   └── package.json
├── backend/                     # Express API
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── services/           # Business logic
│   │   │   ├── searchEngine.ts        # Search core
│   │   │   ├── queryParser.ts         # Query parsing
│   │   │   ├── symbolExtractor.ts     # Symbol detection
│   │   │   ├── semanticRanker.ts      # Result ranking
│   │   │   └── databaseService.ts     # DB queries
│   │   ├── types/              # TypeScript types
│   │   ├── config/             # Configuration
│   │   └── index.ts            # Server entry
│   └── package.json
├── indexing-service/            # Indexing worker
│   ├── src/
│   │   ├── indexer.ts          # Main indexing logic
│   │   ├── queue/              # Job queue
│   │   └── processors/         # Index processors
│   └── package.json
├── database/                    # Database
│   ├── schema.sql              # Database schema
│   ├── migrations/             # Migrations
│   └── seeds/                  # Seed data
├── docker/                      # Docker config
│   ├── docker-compose.yml      # Local dev setup
│   ├── Dockerfile              # Backend image
│   └── Dockerfile.frontend     # Frontend image
├── docs/                        # Documentation
│   ├── API.md                  # API reference
│   ├── ARCHITECTURE.md         # Architecture guide
│   ├── SEARCH_SYNTAX.md        # Search syntax
│   ├── FRONTEND_GUIDE.md       # Frontend guide
│   ├── DASHBOARD_PAGES.md      # UI pages
│   └── IMPLEMENTATION_ROADMAP.md # Roadmap
└── .env.example                # Environment template
```

## 🔑 Key Features

### Search Engine
- **GitHub-style query syntax**: `repo:`, `language:`, `path:`, `symbol:`, `content:`
- **Boolean operators**: `AND`, `OR`, `NOT`
- **Regular expressions**: Full regex support with `/pattern/`
- **Exact matching**: Quote-based phrase search
- **Symbol search**: Find function/class definitions
- **Semantic ranking**: ML-powered result relevance

### User Features
- **Global search bar**: Search across all repositories
- **Advanced filters**: Language, repository, path, symbol type
- **Saved searches**: Persist and reuse complex queries
- **Search history**: Track all searches
- **Code snippets**: Syntax-highlighted results
- **Quick filters**: Faceted search refinement

### Team Features
- **Organizations**: Group repositories and team members
- **Member management**: Invite, manage roles, permissions
- **Organization analytics**: Team-wide search insights
- **Search templates**: Pre-built query templates for teams
- **Audit logging**: Track all platform activities

### Admin Features
- **User management**: Admin dashboard for users
- **Repository management**: Add, index, remove repositories
- **Organization settings**: Configure org-wide settings
- **Analytics dashboard**: Platform-wide metrics
- **API keys**: Programmatic access to search API

## 🔍 Search Examples

```bash
# Find a function definition
symbol:useState language:typescript

# Search in specific repository
repo:facebook/react path:/hooks/ "useEffect"

# Boolean queries
(language:python OR language:go) AND NOT path:/tests/

# Regex pattern matching
/^class.*Error$/

# Multiple filters
org:github language:typescript symbol:* NOT is:generated
```

## 🗄️ Database Schema Highlights

- **users**: User accounts and authentication
- **organizations**: Team organizations
- **repositories**: Indexed repositories
- **file_index**: Full-text searchable file content
- **symbol_index**: Function, class, method definitions
- **saved_searches**: User-saved query templates
- **search_history**: Query audit trail
- **audit_logs**: Platform activity logging
- **organization_members**: Team membership and roles

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Search
- `POST /api/v1/search` - Execute search query
- `GET /api/v1/search/suggestions` - Query suggestions
- `GET /api/v1/search/templates` - Search templates

### Repositories
- `GET /api/v1/repositories` - List repositories
- `POST /api/v1/repositories` - Add repository
- `DELETE /api/v1/repositories/:id` - Remove repository

### Saved Searches
- `GET /api/v1/saved-searches` - List saved searches
- `POST /api/v1/saved-searches` - Create saved search
- `PUT /api/v1/saved-searches/:id` - Update saved search
- `DELETE /api/v1/saved-searches/:id` - Delete saved search

### Organizations
- `GET /api/v1/organizations` - List user organizations
- `POST /api/v1/organizations` - Create organization
- `GET /api/v1/organizations/:id/members` - List members
- `POST /api/v1/organizations/:id/members` - Add member

### Analytics
- `GET /api/v1/analytics/search-stats` - User search statistics
- `GET /api/v1/analytics/org/:orgId/stats` - Organization analytics
- `GET /api/v1/analytics/audit-logs` - Audit trail

See [API.md](./docs/API.md) for complete endpoint documentation.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                 Frontend (React)                 │
│        Dashboard | Search | Settings | Admin    │
└────────────────────┬────────────────────────────┘
                     │ HTTP/REST
                     ↓
┌─────────────────────────────────────────────────┐
│              Backend API (Express)              │
│  Auth | Search | Repos | Orgs | Analytics      │
└────────────────────┬────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      ↓              ↓              ↓
  PostgreSQL      Redis       Elasticsearch
  (Metadata)   (Cache/Queue)   (Full-text)
      │              │              │
      └──────────────┼──────────────┘
                     │
                     ↓
            ┌────────────────┐
            │ Indexing       │
            │ Service        │
            │ (Background)   │
            └────────────────┘
```

## 📊 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|----------|
| Frontend | React 18 + TypeScript | User interface |
| Styling | Tailwind CSS | Component styling |
| Build | Vite | Fast bundler |
| Backend | Express + TypeScript | REST API |
| Database | PostgreSQL | Primary data store |
| Cache | Redis | Caching & queues |
| Search | Elasticsearch/Meilisearch | Full-text search |
| Auth | JWT | Authentication |
| DevOps | Docker + GitHub Actions | Deployment |

## 🔐 Security

- JWT-based authentication
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS security
- Rate limiting
- Audit logging
- Role-based access control (RBAC)

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build images
docker-compose -f docker/docker-compose.yml build

# Start services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f
```

### Cloud Platforms
- **AWS**: ECS, RDS, ElastiCache
- **GCP**: Cloud Run, Cloud SQL, Memorystore
- **Azure**: App Service, SQL Database, Cache for Redis
- **Heroku**: Dyno + Postgres + Redis add-ons
- **Vercel**: Frontend (React)
- **Render/Railway**: Backend (Node.js)

## 📚 Documentation

- [API Reference](./docs/API.md) - Complete REST API documentation
- [Architecture Guide](./docs/ARCHITECTURE.md) - System design and components
- [Search Syntax](./docs/SEARCH_SYNTAX.md) - Query syntax examples
- [Frontend Guide](./docs/FRONTEND_GUIDE.md) - React component guide
- [Dashboard Pages](./docs/DASHBOARD_PAGES.md) - UI/UX pages
- [Implementation Roadmap](./docs/IMPLEMENTATION_ROADMAP.md) - Development phases

## 🛠️ Development

```bash
# Start all services in development
npm run dev

# Run tests
npm test
npm run test:coverage
npm run test:e2e

# Linting and formatting
npm run lint
npm run lint:fix
npm run format

# Database migrations
npm run migrate
npm run migrate:create
npm run seed
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Project Status

**Current Phase**: MVP Foundation (Phase 1)

✅ Completed:
- Project structure and configuration
- Authentication system (JWT)
- Database schema
- Query parser (GitHub-style syntax)
- Mock search engine
- API route structure
- Frontend components (Navbar, Sidebar, SearchBar, Results)

🚧 In Progress:
- Real search engine integration
- Repository indexing
- Saved searches persistence
- Frontend pages implementation

⏳ Coming Next:
- Symbol extraction service
- Semantic ranking
- Organization management
- Analytics dashboard
- Mobile responsiveness

See [IMPLEMENTATION_ROADMAP.md](./docs/IMPLEMENTATION_ROADMAP.md) for detailed phases and timeline.

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@codesearchplatform.dev
- **Docs**: Full documentation in `/docs` folder

## 📄 License

MIT License - see LICENSE file for details

## 🎉 Acknowledgments

Built with inspiration from:
- GitHub Code Search
- Sourcegraph
- Stripe's engineering culture
- Modern SaaS best practices

---

**Ready to build the future of code search?** 🚀

Start with the [Frontend Guide](./docs/FRONTEND_GUIDE.md) or dive into [API Development](./docs/API.md).
