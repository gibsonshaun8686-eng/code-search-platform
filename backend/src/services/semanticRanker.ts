import { SearchResult } from '../types/search';

/**
 * Semantic ranker that re-scores search results based on:
 * - Query intent and relevance
 * - Code structure and patterns
 * - Popularity and usage signals
 * - Temporal signals (freshness)
 */
export class SemanticRanker {
  /**
   * Re-rank search results with semantic scoring
   */
  rankResults(results: SearchResult[], query: string, context?: RankingContext): SearchResult[] {
    return results.map(result => ({
      ...result,
      score: this.calculateSemanticScore(result, query, context),
    })).sort((a, b) => b.score - a.score);
  }

  private calculateSemanticScore(
    result: SearchResult,
    query: string,
    context?: RankingContext
  ): number {
    let score = result.score;

    // Boost symbol matches significantly
    if (result.matchType === 'symbol') {
      score *= 1.5;
    }

    // Boost matches in main source directories
    if (this.isMainSourcePath(result.filePath)) {
      score *= 1.3;
    }

    // Penalize vendored and generated code
    if (this.isVendoredPath(result.filePath)) {
      score *= 0.5;
    }
    if (this.isGeneratedPath(result.filePath)) {
      score *= 0.3;
    }

    // Boost relevant code structures
    if (this.hasSemanticRelevance(result.content, query)) {
      score *= 1.2;
    }

    return score;
  }

  private isMainSourcePath(filePath: string): boolean {
    const mainPatterns = [
      /\/src\//,
      /\/lib\//,
      /\/app\//,
      /\/services\//,
      /\/components\//,
      /\/models\//,
      /\/controllers\//,
    ];
    return mainPatterns.some(pattern => pattern.test(filePath));
  }

  private isVendoredPath(filePath: string): boolean {
    const vendoredPatterns = [
      /\/node_modules\//,
      /\/vendor\//,
      /\/third_party\//,
      /\/external\//,
    ];
    return vendoredPatterns.some(pattern => pattern.test(filePath));
  }

  private isGeneratedPath(filePath: string): boolean {
    const generatedPatterns = [
      /\.generated\./,
      /\/dist\//,
      /\/build\//,
      /\/out\//,
      /\/\.next\//,
    ];
    return generatedPatterns.some(pattern => pattern.test(filePath));
  }

  private hasSemanticRelevance(content: string, query: string): boolean {
    const semanticKeywords = {
      function: ['function', 'const', 'let', 'var', '=>', 'def', 'func'],
      class: ['class', 'struct', 'interface', 'type', 'protocol'],
      import: ['import', 'require', 'from', 'include', 'using'],
      export: ['export', 'module.exports', 'pub'],
    };

    const hasKeyword = Object.values(semanticKeywords).some(keywords =>
      keywords.some(kw => content.includes(kw))
    );

    return hasKeyword;
  }
}

export interface RankingContext {
  userPreference?: 'speed' | 'relevance' | 'balanced';
  language?: string;
  fileType?: string;
}
