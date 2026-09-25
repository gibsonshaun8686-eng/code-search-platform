import knex from 'knex';
import path from 'path';

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'code_search_db',
  },
  migrations: {
    directory: path.join(__dirname, '../migrations'),
  },
  seeds: {
    directory: path.join(__dirname, '../seeds'),
  },
};

const db = knex(knexConfig);

export default db;
