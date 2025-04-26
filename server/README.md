# Chat Widget Server

## Database Migration System

This project uses Knex.js for database migrations with MySQL. All migrations are written in TypeScript and located in the `db/migrations-ts` directory.

### Migration Structure

The migration system has been consolidated to use TypeScript migrations with Knex. This provides several benefits:

- Type safety and better IDE support
- Consistent migration format
- Automatic tracking of applied migrations
- Support for rollbacks

### Running Migrations

To set up the database and run all migrations:

```bash
npm run db:setup
```

To run only pending migrations:

```bash
npm run db:migrate
```

### Creating New Migrations

To create a new migration, add a new TypeScript file in the `db/migrations-ts` directory following the naming convention:

```
YYYYMMDDHHMMSS_descriptive_name.ts
```

For example: `20240502120000_add_user_preferences.ts`

Each migration file should export `up` and `down` functions:

```typescript
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Migration code to apply changes
  await knex.schema.createTable("example", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("tenant_id").unsigned().notNullable();
    table.foreign("tenant_id").references("id").inTable("tenants");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  // Migration code to revert changes
  await knex.schema.dropTable("example");
}
```

### Important Guidelines

1. **Always include tenant_id**: All tables that store tenant-specific data should include a `tenant_id` column with a foreign key to the `tenants` table.

2. **Include created_by when appropriate**: Tables that track user-created content should include a `created_by` column with a foreign key to the `users` table.

3. **Use timestamps**: Include `created_at` and `updated_at` timestamps on all tables.

4. **Check for existence**: Always check if tables/columns exist before creating them to make migrations idempotent.

5. **Foreign keys**: Define proper foreign key constraints to maintain data integrity.

6. **Indexes**: Add appropriate indexes for columns used in WHERE clauses or joins.

### Migration Best Practices

- Keep migrations small and focused on a single concern
- Always provide a working `down` function to support rollbacks
- Test migrations in development before applying to production
- Document complex migrations with comments
- Use transactions for multi-step migrations to ensure atomicity

## Directory Structure

```
server/
├── config/         # Configuration files
├── db/             # Database migrations and seeds
│   ├── migrations-ts/ # TypeScript migration files
│   └── seeds/      # SQL seed files
├── lib/            # Utility libraries
├── scripts/        # Database and utility scripts
└── index.js        # Main server entry point
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

### Installation

1. Make sure you have a `.env` file in the project root with the following variables:

```
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=chat_widget_db

# JWT Configuration
JWT_SECRET=your-secret-key-should-be-at-least-32-chars
JWT_EXPIRY=2h

# Server Configuration
PORT=3001
NODE_ENV=development
```

2. Install dependencies:

```bash
npm install
```

### Database Setup

Run the database setup script to create the necessary tables:

```bash
npm run db:setup
```

This will create the database and all required tables with initial data.

### Running the Server

Development mode:

```bash
npm run server
```

Or run both client and server:

```bash
npm run dev:all
```

## Database Management

- **Setup Database**: `npm run db:setup` - Creates the database and applies migrations
- **Run Migrations**: `npm run db:migrate` - Applies pending migrations
- **Run Seeds**: `npm run db:seed` - Seeds the database with initial data
- **Reset Database**: `npm run db:reset` - Drops and recreates the database