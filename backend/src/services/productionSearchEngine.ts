import { SearchResult, SearchRequest, SearchResponse } from '../types/search';
import { DatabaseService } from './databaseService';
import { QueryParser } from './queryParser';
import { SemanticRanker } from './semanticRanker';
import { SymbolExtractor } from './symbolExtractor';

/**
 * Production-grade search engine with database backend
 */
export class ProductionSearchEngine {
  private db: DatabaseService;
  private semanticRanker: SemanticRanker;
  private symbolExtractor: SymbolExtractor;

  constructor(dbService: DatabaseService) {
    this.db = dbService;
    this.semanticRanker = new SemanticRanker();
    this.symbolExtractor = new SymbolExtractor();
  }

  async search(req: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();
    const parsed = QueryParser.parse(req.query);

    let results: SearchResult[] = [];

    // Determine search strategy based on qualifiers
    const symbolQualifier = parsed.qualifiers.find(q => q.type === 'symbol');
    const contentQualifier = parsed.qualifiers.find(q => q.type === 'content');
    const pathQualifier = parsed.qualifiers.find(q => q.type === 'path');

    if (symbolQualifier) {
      // Symbol-focused search
      results = await this.searchSymbols(parsed, req.filters);
    } else if (contentQualifier) {
      // Content-only search
      results = await this.searchContent(parsed, req.filters);
    } else {
      // Combined search (default)
      results = await this.searchCombined(parsed, req.filters);
    }

    // Apply semantic ranking
    const rankedResults = this.semanticRanker.rankResults(results, req.query);

    // Pagination
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    const paginatedResults = rankedResults.slice(offset, offset + limit);

    const executionTimeMs = Date.now() - startTime;

    return {
      query: req.query,
      totalResults: results.length,
      results: paginatedResults,
      executionTimeMs,
      facets: this.extractFacets(rankedResults),
    };
  }

  private async searchSymbols(
    parsed: any,
    filters?: any
  ): Promise<SearchResult[]> {
    const symbolQualifier = parsed.qualifiers.find((q: any) => q.type === 'symbol');
    const repoQualifier = parsed.qualifiers.find((q: any) => q.type === 'repo');
    const languageQualifier = parsed.qualifiers.find((q: any) => q.type === 'language');

    const symbols = await this.db.searchSymbols(
      symbolQualifier?.value || parsed.terms[0] || '',
      repoQualifier?.value,
      languageQualifier?.value
    );

    const results: SearchResult[] = [];

    for (const symbol of symbols) {
      const file = await this.db.getFileIndex(symbol.file_id);
      if (file) {
        const repo = await this.db.getRepository(symbol.repo_id);
        if (repo) {
          results.push({
            id: symbol.id,
            repoName: repo.name,
            repoUrl: repo.url,
            filePath: file.path,
            fileUrl: `${repo.url}/blob/${repo.branch}/${file.path}#L${symbol.line_start}`,
            content: file.content,
            snippet: this.extractSnippet(
              file.content,
              symbol.line_start,
              symbol.line_end
            ),
            lineStart: symbol.line_start,
            lineEnd: symbol.line_end,
            language: file.language,
            score: 100,
            matchType: 'symbol',
            symbolInfo: {
              name: symbol.name,
              type: symbol.type,
              signature: symbol.signature,
              lineStart: symbol.line_start,
              lineEnd: symbol.line_end,
            },
          });
        }
      }
    }

    return results;
  }

  private async searchContent(
    parsed: any,
    filters?: any
  ): Promise<SearchResult[]> {
    const contentQualifier = parsed.qualifiers.find((q: any) => q.type === 'content');
    const repoQualifier = parsed.qualifiers.find((q: any) => q.type === 'repo');
    const languageQualifier = parsed.qualifiers.find((q: any) => q.type === 'language');

    const query = contentQualifier?.value || parsed.terms[0] || '';

    const files = await this.db.searchFiles(
      query,
      repoQualifier?.value,
      languageQualifier?.value
    );

    const results: SearchResult[] = [];

    for (const file of files) {
      const repo = await this.db.getRepository(file.repo_id);
      if (repo) {
        results.push({
          id: file.id,
          repoName: repo.name,
          repoUrl: repo.url,
          filePath: file.path,
          fileUrl: `${repo.url}/blob/${repo.branch}/${file.path}`,
          content: file.content,
          snippet: this.extractSnippet(file.content, undefined, undefined, [query]),
          language: file.language,
          score: 50,
          matchType: 'content',
        });
      }
    }

    return results;
  }

  private async searchCombined(
    parsed: any,
    filters?: any
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // First try symbol search
    const symbolResults = await this.searchSymbols(parsed, filters);
    results.push(...symbolResults);

    // Then file content search
    const contentResults = await this.searchContent(parsed, filters);
    results.push(...contentResults);

    // Remove duplicates
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }

  private extractSnippet(
    content: string,
    lineStart?: number,
    lineEnd?: number,
    terms?: string[]
  ): string {
    if (lineStart && lineEnd) {
      const lines = content.split('\n');
      return lines.slice(Math.max(0, lineStart - 1), lineEnd).join('\n').substring(0, 300);
    }

    if (terms && terms.length > 0) {
      const term = terms[0];
      const index = content.toLowerCase().indexOf(term.toLowerCase());
      if (index > -1) {
        const start = Math.max(0, index - 60);
        const end = Math.min(content.length, index + term.length + 60);
        return content.substring(start, end);
      }
    }

    return content.substring(0, 200);
  }

  private extractFacets(results: SearchResult[]) {
    const facets = {
      languages: {} as { [key: string]: number },
      repos: {} as { [key: string]: number },
      paths: {} as { [key: string]: number },
    };

    for (const result of results) {
      facets.languages[result.language] = (facets.languages[result.language] || 0) + 1;
      facets.repos[result.repoName] = (facets.repos[result.repoName] || 0) + 1;

      const pathDir = result.filePath.split('/').slice(0, -1).join('/');
      if (pathDir) {
        facets.paths[pathDir] = (facets.paths[pathDir] || 0) + 1;
      }
    }

    return facets;
  }
}
