# Feedback Hub

A comprehensive feedback management platform that enables users to submit, vote, and discuss product improvement ideas.

## Tech Stack

- React frontend with TypeScript
- Node.js backend with Express
- Neon PostgreSQL database
- Drizzle ORM
- TailwindCSS for styling

## Prerequisites

Before you begin, ensure you have the following installed on your macOS:

1. Node.js (v20 or later)
   ```bash
   brew install node
   ```

2. Git
   ```bash
   brew install git
   ```

## Installation

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Database Setup with Neon

1. Create a Neon Account:
   - Visit [https://neon.tech](https://neon.tech)
   - Sign up for a new account using your email or GitHub
   - Verify your email address

2. Create a New Project:
   - Click "New Project" in the Neon dashboard
   - Choose a name for your project
   - Select a region closest to your users
   - Choose the "Free Tier"
   - Click "Create Project"

3. Get Your Database Credentials:
   - In your project dashboard, find the "Connection Details" section
   - Switch to "Prisma" format in the dropdown (it's compatible with Drizzle)
   - Copy the connection string
   - The connection string will look like:
     ```
     postgresql://[user]:[password]@[host]/[database]
     ```

4. Security Best Practices:
   - Never commit your connection string to version control
   - Use environment variables for sensitive information
   - Regularly rotate database passwords
   - Set up IP allow lists in Neon dashboard if needed

## Environment Setup

1. Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```

2. Add your database URL:
   ```
   DATABASE_URL=your_neon_connection_string_here
   SESSION_SECRET=your_random_string_here
   ```
   Note: Generate a random string for SESSION_SECRET using:
   ```bash
   openssl rand -base64 32
   ```

3. Push the database schema:
   ```bash
   npm run db:push
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Features

- **User Authentication**: Register and login to manage your feedback
- **Feedback Management**: Create, view, and delete feedback
- **Voting System**: Upvote or downvote feedback items
- **Comments**: Engage in discussions through comments
- **Search**: Search through feedback items
- **Real-time Updates**: Instant updates when feedback items change

## Development

- Frontend code is in the `client/src` directory
- Backend code is in the `server` directory
- Database schema is in `shared/schema.ts`
- API routes are in `server/routes.ts`

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   └── pages/       # Page components
├── server/               # Backend Express application
│   ├── auth.ts          # Authentication logic
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database operations
└── shared/              # Shared code
    └── schema.ts        # Database schema
```

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run db:push`: Push schema changes to the database
- `npm start`: Run the production server

## Database Management

### Initial Setup
After setting up your Neon database:

1. Verify Connection:
   - The application will automatically test the connection on startup
   - Check the console logs for any database connection errors

2. Schema Management:
   - All database schema changes are defined in `shared/schema.ts`
   - After making changes to the schema:
     ```bash
     npm run db:push
     ```
   - This will safely update your database schema without losing data

### Troubleshooting Database Issues

1. Connection Issues:
   - Verify your DATABASE_URL in .env matches the Neon connection string
   - Check if your IP is allowed in Neon's dashboard
   - Ensure your database is active (Neon auto-scales to zero)

2. Schema Issues:
   - Run `npm run db:push` to sync schema changes
   - Check the console for detailed error messages
   - Verify your schema in `shared/schema.ts`

3. Performance:
   - Monitor query performance in Neon's dashboard
   - Use appropriate indexes for frequently queried fields
   - Consider connection pooling for production

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT