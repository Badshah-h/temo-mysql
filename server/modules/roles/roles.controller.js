router.post("/", authenticate, async (req, res) => {
  try {
    const { name, description, isDefault, permissionIds } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Role name is required" });
    }

    const result = await rolesService.createRole({
      name,
      description,
      isDefault,
      permissionIds,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in create role controller:", error);
    res.status(400).json({ error: error.message });
  }
});
