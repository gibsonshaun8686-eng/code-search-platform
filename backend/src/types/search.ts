export interface SearchQualifier {
  type: 'repo' | 'org' | 'user' | 'language' | 'path' | 'symbol' | 'content' | 'is';
  value: string;
  negate?: boolean;
}

export interface ParsedQuery {
  terms: string[];
  qualifiers: SearchQualifier[];
  operators: ('AND' | 'OR' | 'NOT')[];
  rawQuery: string;
}

export interface SearchResult {
  id: string;
  repoName: string;
  repoUrl: string;
  filePath: string;
  fileUrl: string;
  content: string;
  snippet: string;
  lineStart?: number;
  lineEnd?: number;
  language: string;
  score: number;
  matchType: 'content' | 'symbol' | 'path' | 'semantic';
  symbolInfo?: SymbolMatch;
}

export interface SymbolMatch {
  name: string;
  type: 'class' | 'function' | 'method' | 'variable' | 'constant';
  signature?: string;
  lineStart: number;
  lineEnd: number;
}

export interface SearchRequest {
  query: string;
  filters?: {
    repos?: string[];
    org?: string;
    language?: string;
    paths?: string[];
    isGenerated?: boolean;
    isVendored?: boolean;
  };
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  query: string;
  totalResults: number;
  results: SearchResult[];
  executionTimeMs: number;
  facets?: SearchFacets;
}

export interface SearchFacets {
  languages?: { [key: string]: number };
  repos?: { [key: string]: number };
  paths?: { [key: string]: number };
}
