import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chat_widget_db",
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "../migrations",
  },
  seeds: {
    directory: "../seeds",
  },
  timezone: "UTC",
};
