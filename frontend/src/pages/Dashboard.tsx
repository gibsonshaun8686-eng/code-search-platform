import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import SearchResults, { SearchResult } from './components/SearchResults';
import { Heart, MoreVertical } from 'lucide-react';

const mockResults: SearchResult[] = [
  {
    id: '1',
    repoName: 'facebook/react',
    filePath: 'packages/react-dom/src/index.ts',
    snippet: 'export function useState(initialState: any) { ... }',
    language: 'typescript',
    score: 98.5,
    matchType: 'symbol',
    symbolInfo: { name: 'useState', type: 'function' },
  },
  {
    id: '2',
    repoName: 'microsoft/vscode',
    filePath: 'src/editor/search.ts',
    snippet: 'export interface SearchOptions { query: string; ... }',
    language: 'typescript',
    score: 87.2,
    matchType: 'content',
  },
];

export default function Dashboard() {
  const [user] = useState({ email: 'user@example.com', username: 'johndoe' });
  const [org] = useState({ slug: 'my-org', name: 'My Organization' });
  const [results, setResults] = useState<SearchResult[]>(mockResults);
  const [recentSearches] = useState([
    'language:typescript symbol:useState',
    'repo:facebook/react path:/hooks/',
    'content:useEffect NOT path:/tests/',
  ]);

  const handleSearch = (query: string, filters: Record<string, string[]>) => {
    console.log('Searching:', query, filters);
    // TODO: Call search API
  };

  const handleLogout = () => {
    console.log('Logout');
    // TODO: Handle logout
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar currentOrg={org} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar user={user} onLogout={handleLogout} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back, {user.username}!</h1>
              <p className="text-xl text-gray-600">Search code across your repositories with GitHub-style syntax.</p>
            </div>

            {/* Search Section */}
            <div className="mb-12">
              <SearchBar onSearch={handleSearch} showFilters={true} />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-3 gap-8">
              {/* Results - Takes 2 columns */}
              <div className="col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Results</h2>
                <SearchResults results={results} totalResults={2} executionTimeMs={234} />
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-6">
                {/* Recent Searches */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Searches</h3>
                  <div className="space-y-3">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSearch(search, {})}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all"
                      >
                        <p className="text-sm text-gray-700 line-clamp-2 font-mono">{search}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Total Searches</p>
                      <p className="text-3xl font-bold text-blue-600">247</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Saved Searches</p>
                      <p className="text-3xl font-bold text-green-600">12</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Avg. Response Time</p>
                      <p className="text-3xl font-bold text-purple-600">234ms</p>
                    </div>
                  </div>
                </div>

                {/* Popular Searches */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Popular in Org</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">useEffect</span>
                      <span className="text-xs text-gray-500">34 searches</span>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">ErrorBoundary</span>
                      <span className="text-xs text-gray-500">28 searches</span>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">useContext</span>
                      <span className="text-xs text-gray-500">21 searches</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
