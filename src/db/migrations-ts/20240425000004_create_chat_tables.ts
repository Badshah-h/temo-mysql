import { Knex } from "knex";
import fs from "fs";
import path from "path";

export async function up(knex: Knex): Promise<void> {
  // Read and execute the SQL migration file
  const sqlPath = path.join(
    __dirname,
    "..",
    "migrations",
    "004_chat_tables.sql",
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
  await knex.schema.dropTableIfExists("knowledge_base_articles");
  await knex.schema.dropTableIfExists("ai_context_rules");
  await knex.schema.dropTableIfExists("chat_messages");
  await knex.schema.dropTableIfExists("chat_sessions");
}
