# SaaS Product Dashboard Pages

## User Dashboard Pages

### 1. **Dashboard / Home** (`/dashboard`)
- Search bar (central)
- Recent searches
- Saved search shortcuts
- Quick stats (total searches, avg time)
- Featured repositories
- Recommended searches based on history

### 2. **Search Results** (`/search?q=...`)
- Search bar with filters
- Filter chips (language, repo, path, type)
- Results list with:
  - File path with breadcrumb
  - Code snippet with highlighting
  - Match type badge (symbol/content/path)
  - Score/relevance indicator
  - Copy link button
  - Save to saved search option
- Pagination
- Result facets sidebar (languages, repos, top paths)
- Search timing and result count

### 3. **Saved Searches** (`/saved-searches`)
- List of user's saved searches
- Search by title
- Sort by date, frequency, last used
- Cards showing:
  - Title
  - Query preview
  - Last used date
  - Usage count
  - Quick run button
  - Edit/delete options
- Create new saved search button
- Share saved search (link/embed)

### 4. **Code Browser** (`/browse/:repo`)
- Repository file tree
- File explorer
- File preview with syntax highlighting
- Symbol list (functions, classes)
- Symbol navigation and references
- Quick search within repo

### 5. **Repositories** (`/repositories`)
- List of indexed repositories
- Search by name/org
- Filter by language
- Sort by stars, last indexed, added date
- Repository card showing:
  - Name and description
  - Primary language
  - Star count
  - Last indexed date
  - File count
  - Symbol count
  - Status (indexed/indexing/failed)
  - Edit/view/delete options
- Add repository button (modal form)
- Reindex button for each repo

### 6. **Settings / Account** (`/settings/account`)
- Profile information
- Email and username
- Password change
- Avatar upload
- API keys management
- Connected accounts (GitHub, etc.)
- Session management
- Delete account option

### 7. **Search History** (`/settings/history`)
- Timeline of all searches
- Query text
- Results count
- Execution time
- Timestamp
- Delete individual search
- Clear all history
- Export history as JSON/CSV

## Organization Pages

### 8. **Organization Dashboard** (`/org/:slug`)
- Organization name and logo
- Organization-wide search
- Team members count
- Repositories count
- Recent activity feed
- Search analytics summary
- Quick stats dashboard
- Invite team member button

### 9. **Organization Members** (`/org/:slug/members`)
- List of organization members
- Member search
- Filter by role
- Member card showing:
  - Avatar and name
  - Email
  - Role (member/admin)
  - Join date
  - Remove/update role options
- Invite member form (email input)
- Pending invitations list
- Export members list

### 10. **Organization Repositories** (`/org/:slug/repositories`)
- All repositories in organization
- Search and filter
- Add repository to org
- Bulk indexing options
- Repository management
- Access control settings per repo

### 11. **Organization Analytics** (`/org/:slug/analytics`)
- Total searches by team
- Search trends (chart)
- Most searched repositories
- Most searched symbols/functions
- Team member activity heatmap
- Average query execution time
- Popular search queries
- Export analytics report
- Time range filter (week/month/quarter)

### 12. **Organization Settings** (`/org/:slug/settings`)
- Organization name and description
- Logo and branding
- API keys management
- Billing and plan information
- Integrations (GitHub, GitLab, etc.)
- Webhooks configuration
- Security settings
- Audit logs
- Export organization data

## Admin Pages

### 13. **Admin Dashboard** (`/admin`)
- Platform overview statistics
- Active users count
- Total repositories indexed
- System health metrics
- Indexing queue status
- Recent user activity
- Alert/error logs

### 14. **Admin Users Management** (`/admin/users`)
- List all users
- Search and filter
- User details:
  - Email, username, role
  - Created date
  - Last login
  - Search count
  - Suspend/delete user options

### 15. **Admin Audit Logs** (`/admin/audit-logs`)
- All platform audit events
- Filter by action, resource type, user
- Detailed event information
- IP address and user agent
- Export logs
- Alert on suspicious activity

### 16. **Admin System Settings** (`/admin/settings`)
- Feature flags
- Rate limiting configuration
- Search timeout settings
- Indexing service configuration
- Maintenance mode toggle
- System logs viewer

## Public/Landing Pages

### 17. **Landing Page** (`/`)
- Hero section with search demo
- Feature highlights
- Pricing tiers
- Screenshots/demo video
- Customer testimonials
- CTA buttons (Sign up, Get started)
- Navigation bar

### 18. **Pricing** (`/pricing`)
- Pricing plans (Free, Pro, Enterprise)
- Feature comparison table
- FAQ section
- Sign up buttons

### 19. **Documentation** (`/docs`)
- API documentation
- Search syntax guide
- Integration guides
- Examples and tutorials
- FAQ
- Support contact

### 20. **Login/Register** (`/auth/login`, `/auth/register`)
- Email and password form
- Password reset link
- Sign up form
- OAuth integration buttons (GitHub, Google)
- Remember me option

---

## Component Hierarchy

```
App
├── Layout
│   ├── Navbar (logged in)
│   │   ├── Logo
│   │   ├── Search bar (global)
│   │   ├── Nav links
│   │   ├── Notifications
│   │   └── User menu
│   ├── Sidebar (org context)
│   │   ├── Navigation
│   │   ├── Org switcher
│   │   └── Quick actions
│   └── Main Content
│       └── Page-specific content
│   └── Footer
├── Modal (for dialogs)
├── Toast (for notifications)
└── Theme provider (dark/light)
```

## Key UI Components

- **SearchBar**: Global search input with autocomplete and suggestions
- **ResultCard**: Individual search result display with snippet
- **FilterChip**: Removable filter tag
- **CodeBlock**: Syntax-highlighted code display
- **SymbolBadge**: Type badge for symbols (function, class, etc.)
- **Pagination**: For result sets
- **DataTable**: For lists (repositories, members, etc.)
- **Chart**: For analytics visualization
- **Avatar**: User/org profile pictures
- **Badge**: Status and role indicators
- **Breadcrumb**: Navigation hierarchy
- **Tabs**: For page sections
- **Modal/Dialog**: For forms and confirmations
