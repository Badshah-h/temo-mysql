// src/utils/db.ts
import knex from 'knex';
import dbConfig from '../config/database';

const db = knex({
  client: 'mysql2',
  connection: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  },
  pool: { min: 2, max: 10 },
});

/**
 * Test database connection.
 * Logs success/failure and returns a boolean.
 */
export async function testConnection(): Promise<boolean> {
  let connection: knex.QueryBuilder | null = null;
  try {
    connection = await db.raw('SELECT 1');
    console.log("✅ Database connection established successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    return false;
  }
}

/**
 * Execute a SQL query using the pool.
 * @param sql SQL query string
 * @param params Optional parameters
 * @returns Query result as typed data
 */
export async function query<T = knex.QueryBuilder>(
  sql: string,
  params: any[] = []
): Promise<T> {
  try {
    const results = await db.raw(sql, params);
    return results as T;
  } catch (error) {
    console.error("❌ Database query failed:", {
      sql,
      params,
      error,
    });
    throw new Error("Database query execution failed");
  }
}

export default db;
