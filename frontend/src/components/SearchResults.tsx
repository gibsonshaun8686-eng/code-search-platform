import React, { useState } from 'react';
import { Search, ChevronDown, Copy, ExternalLink, Bookmark } from 'lucide-react';

export interface SearchResult {
  id: string;
  repoName: string;
  filePath: string;
  snippet: string;
  language: string;
  score: number;
  matchType: 'content' | 'symbol' | 'path' | 'semantic';
  symbolInfo?: { name: string; type: string };
}

interface SearchResultsProps {
  results: SearchResult[];
  totalResults: number;
  isLoading?: boolean;
  executionTimeMs?: number;
  onResultClick?: (result: SearchResult) => void;
  onSaveSearch?: (result: SearchResult) => void;
}

export default function SearchResults({
  results,
  totalResults,
  isLoading,
  executionTimeMs,
  onResultClick,
  onSaveSearch,
}: SearchResultsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 text-lg">No results found</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-700">
            Found <span className="font-bold text-blue-600">{totalResults}</span> results
            {executionTimeMs && <span className="text-gray-500 ml-2">in {executionTimeMs}ms</span>}
          </p>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map(result => (
          <div
            key={result.id}
            className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
          >
            {/* Result Header */}
            <button
              onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
              className="w-full text-left p-4 flex items-start justify-between gap-4 hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                {/* Repo and Path */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-blue-600">{result.repoName}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {result.language}
                  </span>
                  {result.symbolInfo && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {result.symbolInfo.type}: {result.symbolInfo.name}
                    </span>
                  )}
                </div>

                {/* File Path */}
                <p className="text-sm text-gray-600 font-mono break-all">{result.filePath}</p>

                {/* Snippet Preview */}
                <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 font-mono line-clamp-2">
                  {result.snippet}
                </div>
              </div>

              {/* Score and Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-700">{result.score.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">relevance</div>
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {expandedId === result.id && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {/* Full Snippet */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Code Snippet</h4>
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <code>{result.snippet}</code>
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.snippet);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded border border-gray-300"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                  <a
                    href={`#`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded border border-gray-300"
                  >
                    <ExternalLink size={16} />
                    Open in GitHub
                  </a>
                  <button
                    onClick={() => onSaveSearch?.(result)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-white rounded border border-gray-300"
                  >
                    <Bookmark size={16} />
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
