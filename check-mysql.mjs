// Check MySQL connection
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function checkMySQLConnection() {
  console.log("Checking MySQL connection...");
  console.log(`Host: ${process.env.DB_HOST || "localhost"}`);
  console.log(`Port: ${process.env.DB_PORT || "3306"}`);
  console.log(`User: ${process.env.DB_USER || "root"}`);
  
  try {
    // Create connection to MySQL server (without database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });
    
    console.log("MySQL connection successful!");
    await connection.end();
    return true;
  } catch (error) {
    console.error("MySQL connection failed:", error);
    return false;
  }
}

checkMySQLConnection()
  .then(success => {
    if (success) {
      console.log("MySQL is running and accessible.");
      process.exit(0);
    } else {
      console.log("Failed to connect to MySQL. Please check if MySQL is running.");
      process.exit(1);
    }
  });
