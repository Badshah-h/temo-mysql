  .then((connected: boolean) => {
    if (!connected) {
      console.error("Database connection failed. Server will start, but functionality may be limited.");
    } else {
      console.log("Database connection successful");
    }
  })
  .catch((error: Error) => {
    console.error("Error testing database connection:", error);
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Protected route example
app.get("/api/protected", authenticate, (req: Request, res: Response) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
