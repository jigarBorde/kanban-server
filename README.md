# Kanban Board Backend

Backend server for the Kanban Board project built with Node.js, Express, MongoDB, and TypeScript.

## Prerequisites

- Node.js 20.8.1 (LTS)
- MongoDB (local installation or MongoDB Atlas account)
- npm (comes with Node.js)
- Git

## Project Setup

### 1. Clone the Repository

```bash
git clone [your-repository-url]
cd kanban-server
```

### 2. Environment Setup

1. Create a new `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Configure the following environment variables in `.env`:
   ```plaintext
   # Server Configuration
   PORT=5001
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/kanban_board
   DB_NAME=kanban_board

   # Authentication
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your_google_client_id

### 3. Install Dependencies

Install project dependencies using npm:
```bash
npm ci
```

### 4. Database Setup

1. Make sure MongoDB is running locally or you have a MongoDB Atlas connection string
2. The application will automatically create the required collections on first run

### 5. Start the Server

For development (with hot reload):
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

The server will start running on `http://localhost:5001` (or the port specified in your `.env`)

## Available Scripts

- `npm run dev` - Starts the development server using nodemon
- `npm start` - Runs the production server
- `npm run build` - Compiles TypeScript to JavaScript
- `npm run watch` - Watches for TypeScript changes and recompiles
- `npm test` - Runs tests (currently not configured)


## Tech Stack

- Node.js (v20.8.1)
- Express.js
- MongoDB with Mongoose
- TypeScript
- JSON Web Tokens (JWT)
- Google Auth Library
- Cookie Parser
- CORS

## Development

- Uses TypeScript for type safety
- Implements Google OAuth for authentication
- JWT for session management
- MongoDB with Mongoose for data persistence
- Express.js for routing and middleware

## Security

- JWT-based authentication
- CORS protection
- Cookie security
- Environment variable protection
- Input validation

## Additional Notes

- Ensure MongoDB is running before starting the server
- The server uses strict TypeScript configuration
- For production deployment, ensure all environment variables are properly set
- The project uses nodemon for development hot-reloading