import { Knex } from 'knex';
import { SearchResult, SymbolMatch } from '../types/search';

export interface RepositoryRecord {
  id: string;
  name: string;
  url: string;
  org: string;
  branch: string;
  description?: string;
  language: string;
  stars: number;
  last_indexed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface FileIndexRecord {
  id: string;
  repo_id: string;
  path: string;
  content: string;
  language: string;
  size: number;
  lines: number;
  is_generated: boolean;
  is_vendored: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SymbolIndexRecord {
  id: string;
  file_id: string;
  repo_id: string;
  name: string;
  type: 'class' | 'function' | 'method' | 'variable' | 'constant';
  line_start: number;
  line_end: number;
  signature?: string;
  documentation?: string;
  created_at: Date;
}

export interface SavedSearchRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  query: string;
  filters: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface SearchHistoryRecord {
  id: string;
  user_id: string;
  query: string;
  filters: Record<string, any>;
  results_count: number;
  execution_time_ms: number;
  created_at: Date;
}

export class DatabaseService {
  constructor(private db: Knex) {}

  // Repository operations
  async createRepository(repo: Omit<RepositoryRecord, 'id' | 'created_at' | 'updated_at'>): Promise<RepositoryRecord> {
    const [result] = await this.db('repositories')
      .insert({ ...repo, id: this.generateId(), created_at: new Date(), updated_at: new Date() })
      .returning('*');
    return result;
  }

  async getRepository(id: string): Promise<RepositoryRecord | null> {
    return this.db('repositories').where({ id }).first();
  }

  async listRepositories(orgId?: string): Promise<RepositoryRecord[]> {
    let query = this.db('repositories');
    if (orgId) {
      query = query.where({ org: orgId });
    }
    return query.orderBy('stars', 'desc');
  }

  async updateRepository(id: string, updates: Partial<RepositoryRecord>): Promise<RepositoryRecord> {
    const [result] = await this.db('repositories')
      .where({ id })
      .update({ ...updates, updated_at: new Date() })
      .returning('*');
    return result;
  }

  async deleteRepository(id: string): Promise<void> {
    await this.db('repositories').where({ id }).delete();
  }

  // File indexing operations
  async indexFile(file: Omit<FileIndexRecord, 'id' | 'created_at' | 'updated_at'>): Promise<FileIndexRecord> {
    const [result] = await this.db('file_index')
      .insert({ ...file, id: this.generateId(), created_at: new Date(), updated_at: new Date() })
      .returning('*');
    return result;
  }

  async getFileIndex(id: string): Promise<FileIndexRecord | null> {
    return this.db('file_index').where({ id }).first();
  }

  async searchFiles(query: string, repoId?: string, language?: string): Promise<FileIndexRecord[]> {
    let q = this.db('file_index');

    if (repoId) {
      q = q.where({ repo_id: repoId });
    }
    if (language) {
      q = q.where({ language });
    }

    // Full-text search on content and path
    q = q.whereRaw('LOWER(path) LIKE ? OR LOWER(content) LIKE ?', [
      `%${query.toLowerCase()}%`,
      `%${query.toLowerCase()}%`,
    ]);

    return q.limit(100);
  }

  async deleteFileIndex(id: string): Promise<void> {
    await this.db('file_index').where({ id }).delete();
  }

  // Symbol indexing operations
  async indexSymbol(symbol: Omit<SymbolIndexRecord, 'id' | 'created_at'>): Promise<SymbolIndexRecord> {
    const [result] = await this.db('symbol_index')
      .insert({ ...symbol, id: this.generateId(), created_at: new Date() })
      .returning('*');
    return result;
  }

  async searchSymbols(name: string, repoId?: string, type?: string): Promise<SymbolIndexRecord[]> {
    let q = this.db('symbol_index')
      .whereRaw('LOWER(name) LIKE ?', [`%${name.toLowerCase()}%`]);

    if (repoId) {
      q = q.where({ repo_id: repoId });
    }
    if (type) {
      q = q.where({ type });
    }

    return q.limit(50);
  }

  async getSymbolsByFile(fileId: string): Promise<SymbolIndexRecord[]> {
    return this.db('symbol_index').where({ file_id: fileId });
  }

  // Saved searches
  async createSavedSearch(search: Omit<SavedSearchRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SavedSearchRecord> {
    const [result] = await this.db('saved_searches')
      .insert({ ...search, id: this.generateId(), created_at: new Date(), updated_at: new Date() })
      .returning('*');
    return result;
  }

  async getSavedSearch(id: string): Promise<SavedSearchRecord | null> {
    return this.db('saved_searches').where({ id }).first();
  }

  async listSavedSearches(userId: string): Promise<SavedSearchRecord[]> {
    return this.db('saved_searches')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  async updateSavedSearch(id: string, updates: Partial<SavedSearchRecord>): Promise<SavedSearchRecord> {
    const [result] = await this.db('saved_searches')
      .where({ id })
      .update({ ...updates, updated_at: new Date() })
      .returning('*');
    return result;
  }

  async deleteSavedSearch(id: string): Promise<void> {
    await this.db('saved_searches').where({ id }).delete();
  }

  // Search history
  async recordSearch(history: Omit<SearchHistoryRecord, 'id' | 'created_at'>): Promise<SearchHistoryRecord> {
    const [result] = await this.db('search_history')
      .insert({ ...history, id: this.generateId(), created_at: new Date() })
      .returning('*');
    return result;
  }

  async getUserSearchHistory(userId: string, limit: number = 50): Promise<SearchHistoryRecord[]> {
    return this.db('search_history')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  async getSearchStats(userId: string): Promise<{ totalSearches: number; topQueries: string[] }> {
    const history = await this.db('search_history')
      .where({ user_id: userId })
      .select('query')
      .groupBy('query')
      .orderByRaw('COUNT(*) DESC')
      .limit(10);

    return {
      totalSearches: history.length,
      topQueries: history.map(h => h.query),
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
