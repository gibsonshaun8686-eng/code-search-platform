import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterChip {
  type: string;
  value: string;
  label: string;
}

interface SearchBarProps {
  onSearch?: (query: string, filters: Record<string, string[]>) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search code, symbols, repositories...',
  showFilters = true,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedRepo, setSelectedRepo] = useState('');

  const handleSearch = () => {
    onSearch?.(query, filters);
  };

  const addFilter = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: [...(prev[type] || []), value],
    }));
  };

  const removeFilter = (type: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].filter(v => v !== value),
    }));
  };

  const allFilters: FilterChip[] = [];
  Object.entries(filters).forEach(([type, values]) => {
    values.forEach(value => {
      allFilters.push({ type, value, label: `${type}:${value}` });
    });
  });

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              placeholder={placeholder}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base"
            />
          </div>
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter size={20} />
              Filters
            </button>
          )}
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      {allFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allFilters.map(filter => (
            <div
              key={filter.label}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
            >
              <span>{filter.label}</span>
              <button
                onClick={() => removeFilter(filter.type, filter.value)}
                className="hover:text-blue-900"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setFilters({})}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <select
              value={selectedLanguage}
              onChange={e => {
                setSelectedLanguage(e.target.value);
                if (e.target.value) addFilter('language', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select language...</option>
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Repository</label>
            <input
              type="text"
              placeholder="e.g., facebook/react"
              value={selectedRepo}
              onChange={e => setSelectedRepo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedRepo && (
              <button
                onClick={() => {
                  addFilter('repo', selectedRepo);
                  setSelectedRepo('');
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Add repo filter
              </button>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" /> Exclude generated files
            </label>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mt-2">
              <input type="checkbox" className="w-4 h-4" /> Exclude vendored code
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
