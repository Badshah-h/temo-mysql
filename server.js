const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "chat_widget",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection successful");
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

testConnection();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// JWT Secret
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-should-be-at-least-32-chars";

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.sub) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Get user from database
    const [rows] = await pool.execute(
      "SELECT id, email, full_name as fullName, role FROM users WHERE id = ?",
      [decoded.sub],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      "INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, fullName, role || "user"],
    );

    const userId = result.insertId;

    // Generate token
    const token = jwt.sign(
      {
        sub: userId,
        email: email,
        name: fullName,
        role: role || "user",
      },
      JWT_SECRET,
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: userId,
        email,
        fullName,
        role: role || "user",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const [users] = await pool.execute(
      "SELECT id, email, password, full_name as fullName, role FROM users WHERE email = ?",
      [email],
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login timestamp
    await pool.execute(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id],
    );

    // Generate token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
      },
      JWT_SECRET,
    );

    // Remove password from response
    delete user.password;

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    // Get user roles
    const [roles] = await pool.execute(
      `SELECT r.id, r.name, r.description
       FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [req.user.id],
    );

    res.json({
      user: {
        ...req.user,
        roles: roles || [],
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/logout", (_req, res) => {
  // Client-side will handle token removal
  res.json({ message: "Logged out successfully" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
