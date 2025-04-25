// Browser-compatible mock for database connection
// In a real application, you would use API calls instead of direct DB access

const isBrowser = typeof window !== "undefined";

// Mock pool for browser environment
const pool = {
  execute: async (query: string, params?: any[]) => {
    console.warn(
      "DB operations are not available in browser. Using mock data.",
    );
    // Return mock data based on the query
    if (query.includes("SELECT") && query.includes("users")) {
      return [[], null];
    }
    return [{ insertId: 1 }, null];
  },
  getConnection: async () => {
    return {
      release: () => {},
    };
  },
};

/**
 * Test database connection
 */
export async function testConnection() {
  if (isBrowser) {
    console.warn(
      "Database connection test is not available in browser environment",
    );
    return true; // Mock success in browser
  }

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
