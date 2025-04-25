// Database utility functions
import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import dbConfig from "../config/database.js";

/**
 * Create a MySQL connection pool
 * This allows for better performance and connection management
 */
const pool: Pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: dbConfig.waitForConnections,
  connectionLimit: dbConfig.connectionLimit,
  queueLimit: dbConfig.queueLimit,
  timezone: dbConfig.timezone,
});

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const connection: PoolConnection = await pool.getConnection();
    console.log("Database connection established successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return false;
  }
}

/**
 * Execute a query with parameters
 * @param sql - SQL query
 * @param params - Query parameters
 * @returns Query results
 */
export async function query<T = RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: any[] = []
): Promise<T> {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export default pool;
