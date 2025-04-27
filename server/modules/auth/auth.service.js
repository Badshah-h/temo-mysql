const login = async (email, password) => {
  try {
    // Find user by email
    const user = await db("users").where({ email }).first();
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Get user roles
    const userRoles = await db("user_roles")
      .join("roles", "user_roles.role_id", "=", "roles.id")
      .where("user_roles.user_id", user.id)
      .select("roles.id", "roles.name");

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        roles: userRoles.map((role) => role.name),
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        roles: userRoles,
      },
    };
  } catch (error) {
    console.error("Error in login service:", error);
    throw error;
  }
};
