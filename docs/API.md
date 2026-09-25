# Backend API Routes & Endpoints

## Authentication

### Register
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword"
}

Response: 201
{
  "user": { "id", "email", "username" },
  "token": "jwt_token_here"
}
```

### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 200
{
  "user": { "id", "email", "username" },
  "token": "jwt_token_here"
}
```

### Get Current User
```
GET /api/v1/auth/me
Authorization: Bearer jwt_token_here

Response: 200
{
  "user": { "id", "email", "username", "role", ... }
}
```

## Search

### Execute Search
```
POST /api/v1/search
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "query": "language:typescript symbol:useState",
  "filters": {
    "repos": ["facebook/react"],
    "language": "typescript"
  },
  "limit": 50,
  "offset": 0
}

Response: 200
{
  "query": "language:typescript symbol:useState",
  "totalResults": 156,
  "results": [
    {
      "id": "file_id",
      "repoName": "facebook/react",
      "filePath": "packages/react-dom/src/hooks.ts",
      "snippet": "const useState = (initialState) => { ... }",
      "score": 95.5,
      "matchType": "symbol",
      "symbolInfo": { "name": "useState", "type": "function" }
    }
  ],
  "executionTimeMs": 234,
  "facets": { "languages": {}, "repos": {}, "paths": {} }
}
```

### Search Suggestions
```
GET /api/v1/search/suggestions?q=language
Authorization: Bearer jwt_token_here

Response: 200
{
  "suggestions": [
    { "type": "qualifier", "value": "language:", "description": "..." }
  ]
}
```

### Search Templates
```
GET /api/v1/search/templates
Authorization: Bearer jwt_token_here

Response: 200
{
  "templates": [
    {
      "id": "find-auth",
      "title": "Find authentication logic",
      "query": "symbol:authenticate OR symbol:login",
      "description": "..."
    }
  ]
}
```

## Repositories

### List Repositories
```
GET /api/v1/repositories?org=myorg
Authorization: Bearer jwt_token_here

Response: 200
{
  "repositories": [
    {
      "id": "repo_id",
      "name": "my-app",
      "url": "https://github.com/org/my-app",
      "language": "typescript",
      "stars": 45,
      "last_indexed_at": "2026-09-25T20:58:00Z"
    }
  ]
}
```

### Add Repository
```
POST /api/v1/repositories
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "name": "my-app",
  "url": "https://github.com/org/my-app",
  "org": "myorg",
  "language": "typescript",
  "branch": "main"
}

Response: 201
{
  "repository": { "id", "name", "url", ... }
}
```

### Get Repository
```
GET /api/v1/repositories/:id
Authorization: Bearer jwt_token_here

Response: 200
{
  "repository": { ... }
}
```

### Update Repository
```
PUT /api/v1/repositories/:id
Authorization: Bearer jwt_token_here
Content-Type: application/json

{ "branch": "develop", "description": "..." }

Response: 200
{
  "repository": { ... }
}
```

### Delete Repository
```
DELETE /api/v1/repositories/:id
Authorization: Bearer jwt_token_here

Response: 204 (No Content)
```

## Saved Searches

### Create Saved Search
```
POST /api/v1/saved-searches
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "title": "React Hooks",
  "description": "Find React hook implementations",
  "query": "symbol:use* language:typescript",
  "filters": { "repos": ["facebook/react"] }
}

Response: 201
{
  "search": { "id", "title", "query", ... }
}
```

### List Saved Searches
```
GET /api/v1/saved-searches
Authorization: Bearer jwt_token_here

Response: 200
{
  "searches": [ { ... }, { ... } ]
}
```

### Get Saved Search
```
GET /api/v1/saved-searches/:id
Authorization: Bearer jwt_token_here

Response: 200
{
  "search": { ... }
}
```

### Update Saved Search
```
PUT /api/v1/saved-searches/:id
Authorization: Bearer jwt_token_here
Content-Type: application/json

{ "title": "React Custom Hooks" }

Response: 200
{
  "search": { ... }
}
```

### Delete Saved Search
```
DELETE /api/v1/saved-searches/:id
Authorization: Bearer jwt_token_here

Response: 204 (No Content)
```

## Organizations

### Create Organization
```
POST /api/v1/organizations
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "name": "My Company",
  "slug": "my-company",
  "description": "..."
}

Response: 201
{
  "organization": { "id", "name", "slug", ... }
}
```

### List User Organizations
```
GET /api/v1/organizations
Authorization: Bearer jwt_token_here

Response: 200
{
  "organizations": [ { ... } ]
}
```

### Get Organization Details
```
GET /api/v1/organizations/:id
Authorization: Bearer jwt_token_here

Response: 200
{
  "organization": { ... }
}
```

### List Organization Members
```
GET /api/v1/organizations/:id/members
Authorization: Bearer jwt_token_here

Response: 200
{
  "members": [ { "user_id", "role", ... } ]
}
```

### Add Organization Member
```
POST /api/v1/organizations/:id/members
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "user_id": "user_id",
  "role": "member"
}

Response: 201
{
  "member": { ... }
}
```

### Update Member Role
```
PUT /api/v1/organizations/:id/members/:userId
Authorization: Bearer jwt_token_here
Content-Type: application/json

{ "role": "admin" }

Response: 200
{
  "member": { ... }
}
```

### Remove Organization Member
```
DELETE /api/v1/organizations/:id/members/:userId
Authorization: Bearer jwt_token_here

Response: 204 (No Content)
```

## Analytics

### User Search Statistics
```
GET /api/v1/analytics/search-stats
Authorization: Bearer jwt_token_here

Response: 200
{
  "stats": {
    "total_searches": 152,
    "avg_execution_time": 234,
    "max_execution_time": 1200
  }
}
```

### Organization Analytics
```
GET /api/v1/analytics/org/:orgId/stats
Authorization: Bearer jwt_token_here

Response: 200
{
  "stats": {
    "total_searches": 5432,
    "unique_users": 45,
    "avg_execution_time": 198
  },
  "topQueries": [
    { "query": "language:typescript", "count": 234 }
  ]
}
```

### Audit Logs
```
GET /api/v1/analytics/audit-logs
Authorization: Bearer jwt_token_here

Response: 200
{
  "logs": [
    {
      "id": "log_id",
      "user_id": "user_id",
      "action": "CREATE",
      "resource_type": "repository",
      "resource_id": "repo_id",
      "changes": { ... },
      "created_at": "2026-09-25T20:58:00Z"
    }
  ]
}
```

## Indexing

### Trigger Repository Indexing
```
POST /api/v1/indexing/index
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "repoUrl": "https://github.com/org/repo"
}

Response: 202 (Accepted)
{
  "job": {
    "id": "job_id",
    "repoName": "org/repo",
    "status": "pending",
    "fileCount": 0,
    "symbolCount": 0
  }
}
```

### Get Indexing Job Status
```
GET /api/v1/indexing/job/:jobId
Authorization: Bearer jwt_token_here

Response: 200
{
  "job": {
    "id": "job_id",
    "status": "completed",
    "fileCount": 245,
    "symbolCount": 1234,
    "completedAt": "2026-09-25T20:58:00Z"
  }
}
```

### List Indexed Repositories
```
GET /api/v1/indexing/repos
Authorization: Bearer jwt_token_here

Response: 200
{
  "repos": [ { "name", "url", "fileCount", "symbolCount", ... } ]
}
```

### Reindex Repository
```
POST /api/v1/indexing/reindex
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "repoUrl": "https://github.com/org/repo"
}

Response: 202 (Accepted)
{
  "job": { ... }
}
```
