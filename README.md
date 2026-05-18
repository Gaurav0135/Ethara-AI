# Team Task Manager

A professional full-stack MERN application for managing team tasks and projects, featuring robust code quality tooling (ESLint & Prettier), JWT authentication, role-based access control, and a modern UI.

## Tech Stack
- **Frontend**: React (Vite), React Router DOM, Tailwind CSS, Axios, Context API, Recharts, React Icons
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs
- **Code Quality**: ESLint, Prettier

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Git

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```
3. Set up environment variables:
   - Copy `server/.env.example` to `server/.env` and update the values.
   - Copy `client/.env.example` to `client/.env` and update the values.

## ESLint & Prettier Setup
This project strictly enforces code quality rules using ESLint and Prettier across both backend and frontend.

- To lint code: `npm run lint`
- To format code: `npm run format`

## Deployment on Railway

1. Push your repository to GitHub.
2. Sign up/Log in to Railway.app and create a new project.
3. Choose "Deploy from GitHub repo" and select this repository.
4. Add the necessary Environment Variables in the Railway project settings (`MONGO_URI`, `JWT_SECRET`, etc.).
5. Ensure the Root Directory setting is empty (Railway usually auto-detects `package.json` scripts if configured correctly, though you may need a separate service for client/server or a single root build step).
