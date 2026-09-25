import { EventEmitter } from 'events';

export interface RepositoryMetadata {
  id: string;
  name: string;
  url: string;
  org?: string;
  branch: string;
  lastIndexedAt?: Date;
  fileCount: number;
  symbolCount: number;
}

export interface IndexingJob {
  id: string;
  repoName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  fileCount: number;
  symbolCount: number;
  error?: string;
}

export class IndexingService extends EventEmitter {
  private jobs: Map<string, IndexingJob> = new Map();
  private indexedRepos: Map<string, RepositoryMetadata> = new Map();

  constructor() {
    super();
  }

  async indexRepository(repoUrl: string): Promise<IndexingJob> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job: IndexingJob = {
      id: jobId,
      repoName: repoUrl,
      status: 'pending',
      fileCount: 0,
      symbolCount: 0,
    };

    this.jobs.set(jobId, job);
    this.emit('job:created', job);

    // Simulate indexing with setTimeout
    setTimeout(() => this.runIndexingJob(job), 100);

    return job;
  }

  private async runIndexingJob(job: IndexingJob): Promise<void> {
    job.status = 'running';
    job.startedAt = new Date();
    this.emit('job:started', job);

    try {
      // Simulate repository clone and analysis
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data: simulate indexing results
      job.fileCount = Math.floor(Math.random() * 500) + 50;
      job.symbolCount = Math.floor(Math.random() * 2000) + 200;

      const metadata: RepositoryMetadata = {
        id: `repo-${Date.now()}`,
        name: job.repoName,
        url: job.repoName,
        branch: 'main',
        fileCount: job.fileCount,
        symbolCount: job.symbolCount,
        lastIndexedAt: new Date(),
      };

      this.indexedRepos.set(job.repoName, metadata);

      job.status = 'completed';
      job.completedAt = new Date();
      this.emit('job:completed', job);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
      this.emit('job:failed', job);
    }
  }

  getJob(jobId: string): IndexingJob | undefined {
    return this.jobs.get(jobId);
  }

  getIndexedRepos(): RepositoryMetadata[] {
    return Array.from(this.indexedRepos.values());
  }

  async reindexRepository(repoUrl: string): Promise<IndexingJob> {
    // Remove old index
    this.indexedRepos.delete(repoUrl);
    // Create new indexing job
    return this.indexRepository(repoUrl);
  }
}
