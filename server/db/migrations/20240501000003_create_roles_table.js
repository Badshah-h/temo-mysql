exports.up = function (knex) {
  return knex.schema.createTable("roles", function (table) {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("description");
    table.boolean("is_default").defaultTo(false);
    table.integer("tenant_id").unsigned().nullable();
    table.foreign("tenant_id").references("id").inTable("tenants");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Make name unique when tenant_id is null
    table.unique(["name", knex.raw("IFNULL(tenant_id, 0)")]);
  });
};
