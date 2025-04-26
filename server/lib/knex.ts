import knex from 'knex';
import dbConfig from '../config/database';

// Create a Knex.js instance with MySQL configuration
const db = knex({
  client: 'mysql2',
  connection: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  },
  pool: {
    min: 0,
    max: dbConfig.connectionLimit || 10,
  },
});

export default db;
