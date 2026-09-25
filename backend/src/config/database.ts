import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT || 5432),
  user: process.env.DATABASE_USER || 'user',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'code_search_db',
};

export const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
};

export const elasticsearchConfig = {
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  username: process.env.ELASTICSEARCH_USER || 'elastic',
  password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
  indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX || 'code_search_',
};
