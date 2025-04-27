const updateUser = async (id, userData) => {
  try {
    const { email, firstName, lastName, roleIds } = userData;

    // Check if user exists
    const existingUser = await db("users").where({ id }).first();

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Update user data
    await db("users")
      .where({ id })
      .update({
        email: email || existingUser.email,
        first_name: firstName || existingUser.first_name,
        last_name: lastName || existingUser.last_name,
        updated_at: new Date(),
      });

    // Update roles if provided
    if (roleIds && Array.isArray(roleIds)) {
      // Verify roles exist
      const roles = await db("roles").whereIn("id", roleIds);

      if (roles.length !== roleIds.length) {
        throw new Error("One or more invalid role IDs");
      }

      // Delete existing roles
      await db("user_roles").where({ user_id: id }).delete();

      // Insert new roles
      if (roleIds.length > 0) {
        await db("user_roles").insert(
          roleIds.map((roleId) => ({
            user_id: id,
            role_id: roleId,
            created_at: new Date(),
            updated_at: new Date(),
          })),
        );
      }
    }

    return { id };
  } catch (error) {
    console.error("Error in updateUser service:", error);
    throw error;
  }
};
