router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Register user
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", userId: result.userId });
  } catch (error) {
    console.error("Error in register controller:", error);
    res.status(400).json({ error: error.message });
  }
});
