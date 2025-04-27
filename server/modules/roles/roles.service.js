const getRoleById = async (id) => {
  try {
    const role = await db("roles").where({ id }).first();

    if (!role) {
      throw new Error("Role not found");
    }

    // Get permissions for this role
    const permissions = await db("role_permissions")
      .join(
        "permissions",
        "role_permissions.permission_id",
        "=",
        "permissions.id",
      )
      .where("role_permissions.role_id", id)
      .select("permissions.id", "permissions.name", "permissions.description");

    return { ...role, permissions };
  } catch (error) {
    console.error("Error in getRoleById service:", error);
    throw error;
  }
};
