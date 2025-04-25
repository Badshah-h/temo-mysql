# Chat Widget Authentication Server

This is the backend server for the Chat Widget application, providing authentication and user management functionality.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

### Installation

1. Clone the repository
2. Navigate to the server directory: `cd src/server`
3. Install dependencies: `npm install`
4. Copy the example environment file: `cp .env.example .env`
5. Update the `.env` file with your MySQL credentials and JWT secret

### Database Setup

Run the database setup script to create the necessary tables:

```bash
npm run setup-db
```

This will create the database and all required tables with initial data.

### Running the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout a user

## Default Admin User

Email: admin@example.com
Password: admin123
