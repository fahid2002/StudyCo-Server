# StudyCo Server

StudyCo Server is the Express, TypeScript, MongoDB, JWT, and Gemini API backend for the StudyCo full-stack study-session booking and AI study assistant platform.

## Live Links

- Live API base URL: https://studyco-server.onrender.com/api
- Health check: https://studyco-server.onrender.com/api/health
- Live client: https://studyco-client.vercel.app
- Server repository: https://github.com/fahid2002/StudyCo-Server
- Client repository: https://github.com/fahid2002/StudyCo-Client
- LinkedIn: https://www.linkedin.com/in/fahid-hasan/

## Project Summary

The backend powers StudyCo's authentication, session catalog, bookings, reviews, user activity history, saved study tools, AI chat assistant, AI notes generator, AI recommendations, and document intelligence features.

All main application data is stored in MongoDB. Protected routes use JWT authentication. AI features use Gemini through the server so API keys remain private and are never exposed to the frontend.

## Features

- JWT authentication with email/password.
- Google OAuth login and registration flow.
- Demo login endpoint for quick testing.
- User profile and interest updates.
- Public session browsing with filters, sorting, pagination, and detail view.
- Protected session creation, deletion, reservation, and reviews.
- MongoDB-backed activity history.
- Activity history cleanup through MongoDB TTL behavior.
- AI chat assistant with regular and streaming endpoints.
- AI notes/content generator.
- AI document intelligence for PDF, DOCX, and TXT uploads.
- AI recommendations and feedback.
- Saved notes library APIs.
- Bookmark/favorite session APIs.
- Study timetable APIs.
- Quiz score tracking APIs.
- Centralized error handling for readable API responses.

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- Google Auth Library
- Gemini API
- Multer
- pdf-parse
- Mammoth
- Zod

## Folder Structure

```text
src/
  config/              # Environment and database configuration
  controllers/         # Route handlers
  middleware/          # Auth, upload, and error middleware
  models/              # Mongoose models
  routes/              # API route definitions
  scripts/             # Seed scripts
  services/            # Business logic and integrations
  utils/               # Shared utility classes/functions
  app.ts               # Express app setup
  server.ts            # Server entry point
```

## Local Setup

1. Clone the repository.

```bash
git clone https://github.com/fahid2002/StudyCo-Server.git
cd StudyCo-Server
```

2. Install dependencies.

```bash
npm install
```

3. Create or update `.env`.

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=365d

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest

GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

4. Run the development server.

```bash
npm run dev
```

5. Confirm the API is running.

```text
http://localhost:5000/api/health
```

## Available Scripts

```bash
npm run dev      # Start development server with nodemon and ts-node
npm run build    # Compile TypeScript into dist/
npm run start    # Run compiled production server
npm run seed     # Seed MongoDB with starter/demo data
npm run lint     # Run ESLint
```

## API Overview

Base URL:

```text
http://localhost:5000/api
```

Production base URL:

```text
https://studyco-server.onrender.com/api
```

### Health

- `GET /health`

### Authentication

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/demo-login`
- `POST /auth/google`
- `GET /auth/me`
- `PATCH /auth/me/interests`

### Sessions

- `GET /sessions`
- `GET /sessions/:id`
- `GET /sessions/mine`
- `POST /sessions`
- `DELETE /sessions/:id`
- `POST /sessions/:id/reserve`
- `POST /sessions/:id/reviews`

### AI

- `GET /ai/chat`
- `POST /ai/chat`
- `POST /ai/chat/stream`
- `POST /ai/generate`
- `GET /ai/generate`
- `GET /ai/recommendations`
- `POST /ai/recommendations/feedback`
- `POST /ai/document`

### Activity

- `GET /activity`
- `DELETE /activity`
- `DELETE /activity/:id`

### Study Tools

- `GET /study/notes`
- `POST /study/notes`
- `DELETE /study/notes/:id`
- `GET /study/bookmarks`
- `POST /study/bookmarks/:sessionId`
- `GET /study/timetable`
- `POST /study/timetable`
- `DELETE /study/timetable/:id`
- `GET /study/quiz-scores`
- `POST /study/quiz-scores`

## Authentication

Protected routes require this header:

```http
Authorization: Bearer your_jwt_token
```

Use `/auth/login`, `/auth/google`, or `/auth/demo-login` to receive a token.

## Deployment

The server is deployed on Render.

Production environment variables should include:

```env
NODE_ENV=production
CLIENT_ORIGIN=https://studyco-client.vercel.app
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=365d
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm run start
```

## Notes

- Gemini free-tier quota can be rate-limited. If quota is exceeded, the API returns a clean user-facing message instead of Google's raw error payload.
- MongoDB Atlas Network Access must allow the deployment host to connect.
- Never commit real `.env` values or API keys to GitHub.

## Credits

Developed by Fahid Hasan.

- GitHub: https://github.com/fahid2002
- LinkedIn: https://www.linkedin.com/in/fahid-hasan/

This project was built for an Agentic AI full-stack assignment using Express, TypeScript, MongoDB, JWT authentication, Google OAuth, Gemini AI, and a Next.js client.
