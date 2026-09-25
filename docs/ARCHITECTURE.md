# Architecture Blueprint

## System overview

The platform is composed of four core layers:

1. Client layer: web UI for search, filters, results, and repo management.
2. API layer: auth, search execution, repo indexing orchestration, and metrics.
3. Search layer: query parsing, indexing, and ranking results.
4. Data layer: repository metadata, code content, symbols, and user data.

## Request flow

```text
User query
  -> Frontend form
  -> Search API
  -> Query parser
  -> Search engine
  -> Indexed repo data
  -> Ranked results
  -> UI result display
```

## Main services

### Frontend service
- Presents query builder and results.
- Supports filters and saved-search UI.
- Shows snippets and previews.

### Backend API
- Validates auth and permissions.
- Executes search requests.
- Manages repositories and saved searches.
- Exposes analytics endpoints.

### Indexing service
- Pulls repository metadata and file content.
- Extracts symbols and paths.
- Maintains fast search indexes.
- Rebuilds indexes on source changes.

## Search pipeline

```text
query string
  -> lexer and parser
  -> qualifier extraction
  -> boolean evaluation
  -> repo targeting
  -> content/symbol search
  -> rank and summarize
  -> return matches
```

## Primary data stores

- PostgreSQL: users, repositories, saved searches, audit logs.
- Redis: queueing, caching, rate limiting.
- Elasticsearch or Meilisearch: search index.
- Object storage: large file blobs or snapshots if needed.

## Security model

- JWT authentication.
- RBAC by organization and repository.
- Audit logs for sensitive actions.
- Query rate limiting.
- Input validation and sanitized search execution.

## Production design

- Separate services for frontend, API, and indexing.
- Background job workers for indexing tasks.
- Metrics and logs via OpenTelemetry or equivalent.
- CI/CD pipeline for validation and deployment.
