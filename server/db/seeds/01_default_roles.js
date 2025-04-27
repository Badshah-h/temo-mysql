/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Delete existing entries
  await knex("roles").del();

  // Insert default roles (not tenant-specific)
  await knex("roles").insert([
    {
      name: "admin",
      description: "Administrator with full access",
      is_default: false,
      tenant_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: "user",
      description: "Regular user with limited access",
      is_default: true,
      tenant_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};
