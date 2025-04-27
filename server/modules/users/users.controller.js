router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await usersService.deleteUser(id);
    res.json(result);
  } catch (error) {
    console.error("Error in delete user controller:", error);
    res.status(400).json({ error: error.message });
  }
});
