import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Check if tables already exist to avoid errors
  const hasAiModels = await knex.schema.hasTable("ai_models");
  const hasAiRoutingRules = await knex.schema.hasTable("ai_routing_rules");
  const hasAiFallbacks = await knex.schema.hasTable("ai_fallbacks");

  // Create AI models table
  if (!hasAiModels) {
    await knex.schema.createTable("ai_models", (table) => {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.string("provider", 50).notNullable(); // gemini, huggingface, custom
      table.string("model_identifier", 255).notNullable();
      table.text("api_key").nullable();
      table.string("base_url", 1024).nullable();
      table.float("temperature").defaultTo(0.7);
      table.integer("max_tokens").unsigned().defaultTo(1024);
      table.text("stop_sequences").nullable(); // JSON array of stop sequences
      table.text("system_prompt").nullable();
      table.boolean("is_default").defaultTo(false);
      table.boolean("is_global").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("tenant_id").unsigned().notNullable();
      table.integer("created_by").unsigned().nullable();

      // Foreign keys
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");
      table
        .foreign("created_by")
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");

      // Indexes
      table.index("tenant_id");
      table.index("provider");
      table.index("is_default");
    });
  }

  // Create AI routing rules table
  if (!hasAiRoutingRules) {
    await knex.schema.createTable("ai_routing_rules", (table) => {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.text("description").nullable();
      table.string("condition_type", 50).notNullable(); // keyword, regex, category, length, language
      table.text("condition_value").notNullable(); // JSON value (string, array, or number)
      table.integer("target_model_id").unsigned().notNullable();
      table.integer("priority").unsigned().defaultTo(10);
      table.boolean("is_active").defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("tenant_id").unsigned().notNullable();
      table.integer("created_by").unsigned().nullable();

      // Foreign keys
      table
        .foreign("target_model_id")
        .references("id")
        .inTable("ai_models")
        .onDelete("CASCADE");
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");
      table
        .foreign("created_by")
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");

      // Indexes
      table.index("tenant_id");
      table.index("priority");
      table.index("is_active");
    });
  }

  // Create AI fallbacks table
  if (!hasAiFallbacks) {
    await knex.schema.createTable("ai_fallbacks", (table) => {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.text("description").nullable();
      table.string("trigger_condition", 50).notNullable(); // error, timeout, low_confidence, content_filter
      table.string("action", 50).notNullable(); // use_alternative_model, use_static_response, notify_admin
      table.integer("alternative_model_id").unsigned().nullable();
      table.text("static_response").nullable();
      table.boolean("is_active").defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("tenant_id").unsigned().notNullable();
      table.integer("created_by").unsigned().nullable();

      // Foreign keys
      table
        .foreign("alternative_model_id")
        .references("id")
        .inTable("ai_models")
        .onDelete("SET NULL");
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");
      table
        .foreign("created_by")
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");

      // Indexes
      table.index("tenant_id");
      table.index("trigger_condition");
      table.index("is_active");
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to respect foreign key constraints
  await knex.schema.dropTableIfExists("ai_fallbacks");
  await knex.schema.dropTableIfExists("ai_routing_rules");
  await knex.schema.dropTableIfExists("ai_models");
}
