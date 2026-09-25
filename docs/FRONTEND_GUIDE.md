# Frontend Implementation Guide

## Project Setup

```bash
cd frontend
npm install
npm run dev
```

## Component Architecture

### Layout Components
- **Navbar.tsx**: Top navigation with search, notifications, user menu
- **Sidebar.tsx**: Left sidebar with org switching, navigation links
- **Layout.tsx**: Main layout wrapper combining navbar + sidebar

### Feature Components
- **SearchBar.tsx**: Global search input with filters
- **SearchResults.tsx**: Display search results with pagination
- **RepositoryList.tsx**: List of repositories
- **SavedSearches.tsx**: User's saved searches

### Page Components
- **pages/Dashboard.tsx**: Main dashboard page
- **pages/Search.tsx**: Search results page
- **pages/Repository.tsx**: Repository browser
- **pages/SavedSearches.tsx**: Saved searches list
- **pages/Settings.tsx**: User settings
- **pages/Organization/**: Organization pages
- **pages/Admin/**: Admin dashboard pages

## Styling

Using Tailwind CSS with custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        blue: {
          600: '#2563eb',  // Primary
          700: '#1d4ed8',  // Hover
        },
      },
    },
  },
};
```

## State Management

Using React hooks with Context API or Zustand:

```typescript
// Store example
interface AppStore {
  user: User | null;
  org: Organization | null;
  setUser: (user: User) => void;
  setOrg: (org: Organization) => void;
}

const useAppStore = create<AppStore>((set) => ({
  user: null,
  org: null,
  setUser: (user) => set({ user }),
  setOrg: (org) => set({ org }),
}));
```

## API Integration

API service client:

```typescript
// services/api.ts
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
});

export const searchApi = {
  search: (query: string, filters: Record<string, any>) =>
    api.post('/api/v1/search', { query, filters }),
  getSavedSearches: () => api.get('/api/v1/saved-searches'),
  savSearch: (data: any) => api.post('/api/v1/saved-searches', data),
};
```

## Key Pages Implementation Order

1. **Authentication** (Login/Register)
   - Form validation
   - JWT token storage
   - Protected routes

2. **Dashboard**
   - Search bar integration
   - Recent searches
   - Quick stats
   - Quick links

3. **Search Page**
   - Query execution
   - Results display
   - Pagination
   - Filtering

4. **Saved Searches**
   - List display
   - Create/edit/delete
   - Quick run
   - Share functionality

5. **Repository Manager**
   - List repositories
   - Add/remove repos
   - Trigger indexing
   - Repository details

6. **Organization Pages**
   - Members list
   - Member management
   - Organization settings
   - Analytics dashboard

7. **User Settings**
   - Profile editing
   - Password change
   - API keys
   - Preferences

## Performance Optimizations

1. **Code Splitting**
   ```typescript
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   const Search = lazy(() => import('./pages/Search'));
   ```

2. **Lazy Loading Results**
   ```typescript
   const { entries, setSize } = useInfiniteScroll({
     initialSize: 50,
     size: 50,
   });
   ```

3. **Memoization**
   ```typescript
   const SearchResults = memo(SearchResultsComponent);
   ```

4. **Query Caching**
   ```typescript
   const queryClient = new QueryClient();
   ```

## Testing Strategy

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress or Playwright
- **Visual Tests**: Percy or Chromatic

```bash
# Run tests
npm run test
npm run test:e2e
npm run test:coverage
```

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENVIRONMENT=development
REACT_APP_SENTRY_DSN=
```

## Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to hosting (Vercel, Netlify, etc.)
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari 12+, Chrome Android latest

## Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Screen reader testing

## Dark Mode Support

```typescript
// Theme context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <div className={isDark ? 'dark' : ''}>{children}</div>
    </ThemeContext.Provider>
  );
};
```

## Common Patterns

### Loading State
```typescript
if (isLoading) return <Spinner />;
if (error) return <ErrorBoundary error={error} />;
return <Content />;
```

### Form Handling
```typescript
const { register, handleSubmit, formState: { errors } } = useForm();
```

### Data Fetching
```typescript
const { data, isLoading, error } = useQuery('key', fetchFn);
```
