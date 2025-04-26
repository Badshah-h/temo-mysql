const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Test route is working" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test API available at http://localhost:${PORT}/api/test`);
});
