import { Knex } from "knex";
import fs from "fs";
import path from "path";

export async function up(knex: Knex): Promise<void> {
  // Read and execute the SQL migration file
  const sqlPath = path.join(
    __dirname,
    "..",
    "migrations",
    "001_initial_schema.sql",
  );
  const sql = fs.readFileSync(sqlPath, "utf8");

  // Split SQL by semicolons and execute each statement
  const statements = sql.split(";").filter((statement) => statement.trim());

  for (const statement of statements) {
    await knex.raw(statement);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to avoid foreign key constraints
  await knex.schema.dropTableIfExists("audit_logs");
  await knex.schema.dropTableIfExists("refresh_tokens");
  await knex.schema.dropTableIfExists("user_roles");
  await knex.schema.dropTableIfExists("roles");
  await knex.schema.dropTableIfExists("users");
}
