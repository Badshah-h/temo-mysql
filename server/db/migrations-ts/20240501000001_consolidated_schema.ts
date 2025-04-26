import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Check if tables already exist to avoid errors
  const hasUsers = await knex.schema.hasTable("users");
  const hasTenants = await knex.schema.hasTable("tenants");
  const hasRoles = await knex.schema.hasTable("roles");
  const hasPermissions = await knex.schema.hasTable("permissions");
  const hasUserRoles = await knex.schema.hasTable("user_roles");
  const hasRolePermissions = await knex.schema.hasTable("role_permissions");
  const hasPromptTemplates = await knex.schema.hasTable("prompt_templates");
  const hasResponseFormats = await knex.schema.hasTable("response_formats");
  const hasWidgetConfigs = await knex.schema.hasTable("widget_configs");
  const hasConversations = await knex.schema.hasTable("conversations");
  const hasMessages = await knex.schema.hasTable("messages");

  // Create tenants table
  if (!hasTenants) {
    await knex.schema.createTable("tenants", (table) => {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.string("slug", 255).notNullable().unique();
      table.string("logo_url", 1024).nullable();
      table.string("primary_color", 20).nullable();
      table.string("secondary_color", 20).nullable();
      table.string("domain", 255).nullable();
      table.boolean("api_enabled").defaultTo(false);
      table.string("api_key", 255).nullable();
      table.text("welcome_message").nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("created_by").unsigned().nullable();

      // Indexes
      table.index("slug");
    });
  }

  // Create users table
  if (!hasUsers) {
    await knex.schema.createTable("users", (table) => {
      table.increments("id").primary();
      table.integer("tenant_id").unsigned().notNullable();
      table.string("email", 255).notNullable();
      table.string("password", 255).notNullable();
      table.string("full_name", 255).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("last_login").nullable();
      table.boolean("is_active").defaultTo(true);

      // Unique constraint for email within a tenant
      table.unique(["tenant_id", "email"]);

      // Foreign key to tenants
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");

      // Indexes
      table.index("email");
      table.index("tenant_id");
    });

    // Add foreign key to tenants.created_by after users table exists
    await knex.schema.alterTable("tenants", (table) => {
      table
        .foreign("created_by")
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
    });
  }

  // Create roles table
  if (!hasRoles) {
    await knex.schema.createTable("roles", (table) => {
      table.increments("id").primary();
      table.string("name", 100).notNullable();
      table.string("description", 255).nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("tenant_id").unsigned().nullable();

      // Foreign key to tenants (null means system role)
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");

      // Unique constraint for name within a tenant
      table.unique(["name", "tenant_id"]);
    });
  }

  // Create permissions table
  if (!hasPermissions) {
    await knex.schema.createTable("permissions", (table) => {
      table.increments("id").primary();
      table.string("name", 100).notNullable().unique();
      table.string("description", 255).nullable();
      table.string("category", 100).nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }

  // Create user_roles junction table
  if (!hasUserRoles) {
    await knex.schema.createTable("user_roles", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable();
      table.integer("role_id").unsigned().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      // Foreign keys
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onDelete("CASCADE");
      table
        .foreign("role_id")
        .references("id")
        .inTable("roles")
        .onDelete("CASCADE");

      // Unique constraint to prevent duplicate assignments
      table.unique(["user_id", "role_id"]);
    });
  }

  // Create role_permissions junction table
  if (!hasRolePermissions) {
    await knex.schema.createTable("role_permissions", (table) => {
      table.increments("id").primary();
      table.integer("role_id").unsigned().notNullable();
      table.integer("permission_id").unsigned().notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      // Foreign keys
      table
        .foreign("role_id")
        .references("id")
        .inTable("roles")
        .onDelete("CASCADE");
      table
        .foreign("permission_id")
        .references("id")
        .inTable("permissions")
        .onDelete("CASCADE");

      // Unique constraint to prevent duplicate assignments
      table.unique(["role_id", "permission_id"]);
    });
  }

  // Create response_formats table
  if (!hasResponseFormats) {
    await knex.schema.createTable("response_formats", (table) => {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.text("description").nullable();
      table.text("structure").notNullable(); // JSON structure
      table.string("category", 100).nullable();
      table.text("tags").nullable(); // JSON array of tags
      table.boolean("is_global").defaultTo(false);
      table.integer("usage_count").unsigned().defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("created_by").unsigned().nullable();
      table.integer("tenant_id").unsigned().notNullable();

      // Foreign keys
      table
        .foreign("created_by")
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");

      // Indexes
      table.index("name");
      table.index("category");
      table.index("tenant_id");
    });
  }

  // Create prompt_templates table
  if (!hasPromptTemplates) {
    await knex.schema.createTable("prompt_templates", (table) => {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.text("description").nullable();
      table.text("content").notNullable();
      table.string("category", 100).nullable();
      table.text("tags").nullable(); // JSON array of tags
      table.boolean("is_global").defaultTo(false);
      table.integer("usage_count").unsigned().defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("created_by").unsigned().nullable();
      table.integer("tenant_id").unsigned().notNullable();
      table.integer("response_format_id").unsigned().nullable();

      // Foreign keys
      table
        .foreign("created_by")
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");
      table
        .foreign("response_format_id")
        .references("id")
        .inTable("response_formats")
        .onDelete("SET NULL");

      // Indexes
      table.index("name");
      table.index("category");
      table.index("tenant_id");
    });
  }

  // Create widget_configs table
  if (!hasWidgetConfigs) {
    await knex.schema.createTable("widget_configs", (table) => {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.text("config").notNullable(); // JSON configuration
      table.boolean("is_active").defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.integer("created_by").unsigned().nullable();
      table.integer("tenant_id").unsigned().notNullable();

      // Foreign keys
      table
        .foreign("created_by")
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");

      // Indexes
      table.index("tenant_id");
    });
  }

  // Create conversations table
  if (!hasConversations) {
    await knex.schema.createTable("conversations", (table) => {
      table.increments("id").primary();
      table.string("session_id", 255).notNullable();
      table.integer("user_id").unsigned().nullable(); // Can be null for guest users
      table.string("guest_id", 255).nullable(); // For tracking guest users
      table.string("guest_name", 255).nullable();
      table.string("guest_email", 255).nullable();
      table.string("guest_phone", 50).nullable();
      table.timestamp("started_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.timestamp("ended_at").nullable();
      table.integer("message_count").unsigned().defaultTo(0);
      table.string("source", 50).defaultTo("widget"); // widget, standalone, api
      table.integer("tenant_id").unsigned().notNullable();
      table.integer("widget_config_id").unsigned().nullable();

      // Foreign keys
      table
        .foreign("user_id")
        .references("id")
        .inTable("users")
        .onDelete("SET NULL");
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");
      table
        .foreign("widget_config_id")
        .references("id")
        .inTable("widget_configs")
        .onDelete("SET NULL");

      // Indexes
      table.index("session_id");
      table.index("user_id");
      table.index("guest_id");
      table.index("tenant_id");
      table.index("started_at");
    });
  }

  // Create messages table
  if (!hasMessages) {
    await knex.schema.createTable("messages", (table) => {
      table.increments("id").primary();
      table.integer("conversation_id").unsigned().notNullable();
      table.enum("sender_type", ["user", "ai", "system"]).notNullable();
      table.text("content").notNullable();
      table.text("raw_content").nullable(); // Original AI response before formatting
      table.text("metadata").nullable(); // JSON metadata
      table.timestamp("sent_at").defaultTo(knex.fn.now());
      table.boolean("is_read").defaultTo(false);
      table.integer("prompt_template_id").unsigned().nullable();
      table.integer("response_format_id").unsigned().nullable();
      table.integer("tenant_id").unsigned().notNullable();

      // Foreign keys
      table
        .foreign("conversation_id")
        .references("id")
        .inTable("conversations")
        .onDelete("CASCADE");
      table
        .foreign("prompt_template_id")
        .references("id")
        .inTable("prompt_templates")
        .onDelete("SET NULL");
      table
        .foreign("response_format_id")
        .references("id")
        .inTable("response_formats")
        .onDelete("SET NULL");
      table
        .foreign("tenant_id")
        .references("id")
        .inTable("tenants")
        .onDelete("CASCADE");

      // Indexes
      table.index("conversation_id");
      table.index("sent_at");
      table.index("tenant_id");
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to respect foreign key constraints
  await knex.schema.dropTableIfExists("messages");
  await knex.schema.dropTableIfExists("conversations");
  await knex.schema.dropTableIfExists("widget_configs");
  await knex.schema.dropTableIfExists("prompt_templates");
  await knex.schema.dropTableIfExists("response_formats");
  await knex.schema.dropTableIfExists("role_permissions");
  await knex.schema.dropTableIfExists("user_roles");
  await knex.schema.dropTableIfExists("permissions");
  await knex.schema.dropTableIfExists("roles");

  // Remove foreign key from tenants to users before dropping users
  await knex.schema.alterTable("tenants", (table) => {
    table.dropForeign(["created_by"]);
  });

  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("tenants");
}
