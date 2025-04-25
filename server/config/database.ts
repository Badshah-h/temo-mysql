// Database configuration
import dotenv from "dotenv";
import path from "path";


// Define database configuration interface
interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  waitForConnections: boolean;
  queueLimit: number;
  connectTimeout: number;
  acquireTimeout: number;
  timezone: string;
}

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const dbConfig: DbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "chat_widget_db",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000, // 10 seconds
  timezone: "Z", // UTC timezone
};

export default dbConfig;
