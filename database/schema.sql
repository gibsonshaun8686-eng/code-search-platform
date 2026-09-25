-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(128) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  org_id VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_org (org_id)
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  description TEXT,
  owner_id VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_owner (owner_id),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id VARCHAR(255) PRIMARY KEY,
  org_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_org_user (org_id, user_id),
  UNIQUE (org_id, user_id),
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT UNIQUE NOT NULL,
  org VARCHAR(255),
  branch VARCHAR(128) DEFAULT 'main',
  description TEXT,
  language VARCHAR(50),
  stars INT DEFAULT 0,
  last_indexed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_org (org),
  INDEX idx_language (language),
  INDEX idx_indexed (last_indexed_at)
);

-- File index table (for full-text search)
CREATE TABLE IF NOT EXISTS file_index (
  id VARCHAR(255) PRIMARY KEY,
  repo_id VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  content LONGTEXT,
  language VARCHAR(50),
  size INT,
  lines INT,
  is_generated BOOLEAN DEFAULT FALSE,
  is_vendored BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_content (content, path),
  INDEX idx_repo (repo_id),
  INDEX idx_language (language),
  INDEX idx_path (path(255)),
  FOREIGN KEY (repo_id) REFERENCES repositories(id)
);

-- Symbol index table (for symbol search)
CREATE TABLE IF NOT EXISTS symbol_index (
  id VARCHAR(255) PRIMARY KEY,
  file_id VARCHAR(255) NOT NULL,
  repo_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  line_start INT,
  line_end INT,
  signature TEXT,
  documentation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_repo (repo_id),
  INDEX idx_type (type),
  FOREIGN KEY (file_id) REFERENCES file_index(id),
  FOREIGN KEY (repo_id) REFERENCES repositories(id)
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  query TEXT NOT NULL,
  filters JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  filters JSON,
  results_count INT,
  execution_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  changes JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_action (user_id, action),
  INDEX idx_resource (resource_type, resource_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- API keys table (for integration)
CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  org_id VARCHAR(255),
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

-- Indexing jobs table
CREATE TABLE IF NOT EXISTS indexing_jobs (
  id VARCHAR(255) PRIMARY KEY,
  repo_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  file_count INT DEFAULT 0,
  symbol_count INT DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_repo_status (repo_id, status),
  FOREIGN KEY (repo_id) REFERENCES repositories(id)
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id VARCHAR(255) PRIMARY KEY,
  org_id VARCHAR(255),
  event_type VARCHAR(100),
  metric_key VARCHAR(255),
  metric_value INT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_org_event (org_id, event_type),
  INDEX idx_metric (metric_key),
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);
