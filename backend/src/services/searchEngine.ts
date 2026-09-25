import { ParsedQuery, SearchRequest, SearchResponse, SearchResult } from '../types/search';
import { QueryParser } from './queryParser';
import { MockSearchIndex } from './mockSearchIndex';

export class SearchEngine {
  private mockIndex: MockSearchIndex;

  constructor() {
    this.mockIndex = new MockSearchIndex();
  }

  async search(req: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();

    // Parse the query
    const parsed = QueryParser.parse(req.query);

    // Apply filters and search logic
    let results = await this.executeSearch(parsed, req.filters);

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    // Apply pagination
    const limit = req.limit || 50;
    const offset = req.offset || 0;
    const paginatedResults = results.slice(offset, offset + limit);

    const executionTimeMs = Date.now() - startTime;

    return {
      query: req.query,
      totalResults: results.length,
      results: paginatedResults,
      executionTimeMs,
      facets: this.extractFacets(results),
    };
  }

  private async executeSearch(
    parsed: ParsedQuery,
    filters?: SearchRequest['filters']
  ): Promise<SearchResult[]> {
    let results: SearchResult[] = [];

    // Filter by repo qualifier
    const repoQualifier = parsed.qualifiers.find(q => q.type === 'repo');
    const orgQualifier = parsed.qualifiers.find(q => q.type === 'org');
    const languageQualifier = parsed.qualifiers.find(q => q.type === 'language');
    const pathQualifier = parsed.qualifiers.find(q => q.type === 'path');
    const symbolQualifier = parsed.qualifiers.find(q => q.type === 'symbol');
    const contentQualifier = parsed.qualifiers.find(q => q.type === 'content');

    // Search the mock index
    results = this.mockIndex.search({
      terms: parsed.terms,
      repoName: repoQualifier?.value,
      org: orgQualifier?.value || filters?.org,
      language: languageQualifier?.value || filters?.language,
      path: pathQualifier?.value,
      symbol: symbolQualifier?.value,
      contentOnly: !!contentQualifier,
    });

    // Apply NOT operator filtering
    if (parsed.operators.includes('NOT')) {
      const notTerms = parsed.terms.filter((_, i) => i > 0 && parsed.operators[i - 1] === 'NOT');
      results = results.filter(r => !notTerms.some(t => r.content.includes(t)));
    }

    return results;
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
