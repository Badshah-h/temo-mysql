import mysql from "mysql2/promise";
import dbConfig from "../config/database";

/**
 * Create a MySQL connection pool
 * This allows for better performance and connection management
 */
const pool = mysql.createPool({
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
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection established successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return false;
  }
}

export default pool;
