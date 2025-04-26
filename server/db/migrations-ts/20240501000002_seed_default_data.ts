import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function up(knex: Knex): Promise<void> {
  // Check if default tenant exists
  const defaultTenant = await knex("tenants")
    .where({ slug: "default" })
    .first();

  // Create default tenant if it doesn't exist
  let tenantId: number;
  if (!defaultTenant) {
    const [insertedTenant] = await knex("tenants").insert({
      name: "Default Tenant",
      slug: "default",
      primary_color: "#3b82f6",
      secondary_color: "#10b981",
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
    tenantId = insertedTenant;
    console.log("Created default tenant with ID:", tenantId);
  } else {
    tenantId = defaultTenant.id;
    console.log("Default tenant already exists with ID:", tenantId);
  }

  // Check if admin user exists
  const adminUser = await knex("users")
    .where({ email: "admin@example.com", tenant_id: tenantId })
    .first();

  // Create admin user if it doesn't exist
  let userId: number;
  if (!adminUser) {
    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const [insertedUser] = await knex("users").insert({
      tenant_id: tenantId,
      email: "admin@example.com",
      password: hashedPassword,
      full_name: "Admin User",
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
    userId = insertedUser;
    console.log("Created admin user with ID:", userId);
  } else {
    userId = adminUser.id;
    console.log("Admin user already exists with ID:", userId);
  }

  // Update tenant.created_by with admin user ID
  if (!defaultTenant?.created_by) {
    await knex("tenants")
      .where({ id: tenantId })
      .update({ created_by: userId });
    console.log("Updated default tenant with creator ID:", userId);
  }

  // Create default roles if they don't exist
  const roles = [
    { name: "admin", description: "Administrator with full access" },
    { name: "user", description: "Regular user with limited access" },
    {
      name: "moderator",
      description: "Moderator with content management access",
    },
  ];

  for (const role of roles) {
    const existingRole = await knex("roles")
      .where({ name: role.name, tenant_id: tenantId })
      .first();

    if (!existingRole) {
      const [roleId] = await knex("roles").insert({
        name: role.name,
        description: role.description,
        tenant_id: tenantId,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });
      console.log(`Created role '${role.name}' with ID:`, roleId);
    } else {
      console.log(
        `Role '${role.name}' already exists with ID:`,
        existingRole.id,
      );
    }
  }

  // Assign admin role to admin user
  const adminRole = await knex("roles")
    .where({ name: "admin", tenant_id: tenantId })
    .first();

  if (adminRole) {
    const existingAssignment = await knex("user_roles")
      .where({ user_id: userId, role_id: adminRole.id })
      .first();

    if (!existingAssignment) {
      await knex("user_roles").insert({
        user_id: userId,
        role_id: adminRole.id,
        created_at: knex.fn.now(),
      });
      console.log(`Assigned admin role to user ID ${userId}`);
    } else {
      console.log(`User ID ${userId} already has admin role assigned`);
    }
  }

  // Create default permissions
  const permissionCategories = {
    users: ["users.view", "users.create", "users.edit", "users.delete"],
    roles: ["roles.view", "roles.create", "roles.edit", "roles.delete"],
    permissions: ["permissions.view", "permissions.manage"],
    templates: [
      "templates.view",
      "templates.create",
      "templates.edit",
      "templates.delete",
    ],
    widget: ["widget.configure", "widget.embed"],
    context: [
      "context.view",
      "context.create",
      "context.manage",
      "context.test",
    ],
    kb: ["kb.view", "kb.manage"],
    embed: ["embed.generate", "embed.customize"],
    logs: ["logs.view"],
    analytics: ["analytics.view"],
    settings: ["settings.view", "settings.manage"],
    ai: ["ai.configure"],
  };

  for (const [category, permissions] of Object.entries(permissionCategories)) {
    for (const permissionName of permissions) {
      const existingPermission = await knex("permissions")
        .where({ name: permissionName })
        .first();

      if (!existingPermission) {
        const [permissionId] = await knex("permissions").insert({
          name: permissionName,
          category,
          description: `Permission to ${permissionName.split(".")[1]} ${category}`,
          created_at: knex.fn.now(),
          updated_at: knex.fn.now(),
        });
        console.log(
          `Created permission '${permissionName}' with ID:`,
          permissionId,
        );
      } else {
        console.log(
          `Permission '${permissionName}' already exists with ID:`,
          existingPermission.id,
        );
      }
    }
  }

  // Assign all permissions to admin role
  const allPermissions = await knex("permissions").select("id");
  const adminRoleId = adminRole?.id;

  if (adminRoleId) {
    for (const permission of allPermissions) {
      const existingAssignment = await knex("role_permissions")
        .where({ role_id: adminRoleId, permission_id: permission.id })
        .first();

      if (!existingAssignment) {
        await knex("role_permissions").insert({
          role_id: adminRoleId,
          permission_id: permission.id,
          created_at: knex.fn.now(),
        });
        console.log(`Assigned permission ID ${permission.id} to admin role`);
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // This is a seed migration, so down would remove the seeded data
  // However, this could be destructive in production, so we'll just log a warning
  console.log("Warning: Not removing seeded data to prevent data loss");
}
