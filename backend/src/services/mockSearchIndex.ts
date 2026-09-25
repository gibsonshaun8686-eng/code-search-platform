import { SearchResult, SymbolMatch } from '../types/search';

interface SearchOptions {
  terms: string[];
  repoName?: string;
  org?: string;
  language?: string;
  path?: string;
  symbol?: string;
  contentOnly?: boolean;
}

// Mock data for demonstration
const MOCK_REPOSITORIES = [
  {
    name: 'github/docs',
    org: 'github',
    url: 'https://github.com/github/docs',
    files: [
      {
        path: 'content/search-github/github-code-search/understanding-github-code-search-syntax.md',
        language: 'markdown',
        content:
          'You can build search queries for the results you want with specialized code qualifiers, regular expressions, and boolean operations.',
      },
      {
        path: 'src/search/engine.ts',
        language: 'typescript',
        content:
          'export class SearchEngine { constructor() { this.index = new SearchIndex(); } search(query: string) { return this.index.query(query); } }',
        symbols: [
          { name: 'SearchEngine', type: 'class' as const, lineStart: 1, lineEnd: 10 },
          { name: 'search', type: 'method' as const, lineStart: 5, lineEnd: 7 },
        ],
      },
    ],
  },
  {
    name: 'microsoft/vscode',
    org: 'microsoft',
    url: 'https://github.com/microsoft/vscode',
    files: [
      {
        path: 'src/vs/editor/search.ts',
        language: 'typescript',
        content:
          'export function findMatches(query: string, content: string): Match[] { const regex = new RegExp(query, "gi"); return Array.from(content.matchAll(regex)).map(m => ({ offset: m.index, text: m[0] })); }',
        symbols: [
          { name: 'findMatches', type: 'function' as const, lineStart: 1, lineEnd: 5 },
        ],
      },
    ],
  },
  {
    name: 'facebook/react',
    org: 'facebook',
    url: 'https://github.com/facebook/react',
    files: [
      {
        path: 'packages/react-dom/src/client/ReactDOMRoot.js',
        language: 'javascript',
        content:
          'function createRoot(container, options) { const root = new ReactDOMRoot(container); if (options && options.hydrate) { root._hydrate = true; } return root; }',
      },
    ],
  },
];

export class MockSearchIndex {
  search(options: SearchOptions): SearchResult[] {
    const results: SearchResult[] = [];

    for (const repo of MOCK_REPOSITORIES) {
      // Filter by repo name
      if (options.repoName && repo.name !== options.repoName) continue;

      // Filter by org
      if (options.org && repo.org !== options.org) continue;

      for (const file of repo.files) {
        // Filter by language
        if (options.language && file.language !== options.language) continue;

        // Filter by path
        if (options.path && !file.path.includes(options.path)) continue;

        // Match terms in content or path
        let matched = false;
        let score = 0;
        const matchedTerms: string[] = [];

        for (const term of options.terms) {
          const cleanTerm = term.replace(/["\/']/g, '');
          if (options.contentOnly) {
            if (file.content.toLowerCase().includes(cleanTerm.toLowerCase())) {
              matched = true;
              score += 10;
              matchedTerms.push(cleanTerm);
            }
          } else {
            const pathMatches = file.path.toLowerCase().includes(cleanTerm.toLowerCase());
            const contentMatches = file.content.toLowerCase().includes(cleanTerm.toLowerCase());

            if (pathMatches || contentMatches) {
              matched = true;
              score += pathMatches ? 15 : 10;
              matchedTerms.push(cleanTerm);
            }
          }
        }

        // Match symbols if symbol qualifier provided
        if (options.symbol && file.symbols) {
          const symbolMatches = file.symbols.filter(
            s =>
              s.name.toLowerCase().includes(options.symbol!.toLowerCase()) ||
              s.type === options.symbol
          );
          if (symbolMatches.length > 0) {
            matched = true;
            score += 25;

            for (const symbol of symbolMatches) {
              results.push({
                id: `${repo.name}:${file.path}:${symbol.name}`,
                repoName: repo.name,
                repoUrl: repo.url,
                filePath: file.path,
                fileUrl: `${repo.url}/blob/main/${file.path}#L${symbol.lineStart}`,
                content: file.content,
                snippet: this.extractSnippet(file.content, symbol.lineStart, symbol.lineEnd),
                lineStart: symbol.lineStart,
                lineEnd: symbol.lineEnd,
                language: file.language,
                score,
                matchType: 'symbol',
                symbolInfo: symbol,
              });
            }
            continue;
          }
        }

        if (matched) {
          results.push({
            id: `${repo.name}:${file.path}`,
            repoName: repo.name,
            repoUrl: repo.url,
            filePath: file.path,
            fileUrl: `${repo.url}/blob/main/${file.path}`,
            content: file.content,
            snippet: this.extractSnippet(file.content, undefined, undefined, matchedTerms),
            language: file.language,
            score,
            matchType: options.contentOnly ? 'content' : 'path',
          });
        }
      }
    }

    return results;
  }

  private extractSnippet(content: string, lineStart?: number, lineEnd?: number, terms?: string[]): string {
    // If we have line numbers, extract those lines
    if (lineStart && lineEnd) {
      const lines = content.split('\n');
      return lines.slice(lineStart - 1, lineEnd).join('\n').substring(0, 200);
    }

    // Otherwise, find first match with context
    if (terms && terms.length > 0) {
      const term = terms[0];
      const index = content.toLowerCase().indexOf(term.toLowerCase());
      if (index > -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + term.length + 50);
        return content.substring(start, end) + '...';
      }
    }

    return content.substring(0, 200) + '...';
  }
}
