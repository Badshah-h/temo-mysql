# Server for Chat Widget Application

This is the backend server for the Chat Widget application, providing authentication, database management, and API endpoints.

## Directory Structure

```
server/
├── config/         # Configuration files
├── db/             # Database migrations and seeds
│   ├── migrations/ # SQL migration files
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
