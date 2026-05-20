# Team Task Manager (MERN Stack)

## Live-Link : https://team-task-pi.vercel.app/

A full-stack project management application with Kanban-style task tracking, role-based access control, and dynamic dashboard analytics.

## Features Completed
- **User Authentication**: Secure JWT-based authentication in HTTP-only cookies.
- **Role-Based Access Control**: Admins can manage projects and users; Members only interact with tasks explicitly assigned to them.
- **Interactive Kanban Board**: Full drag-and-drop support across status columns using `@hello-pangea/dnd`.
- **Dynamic Analytics Dashboard**: Interactive charts displaying task statistics, completion percentages, and overdue tasks using `Recharts`.
- **Project Management**: Explicit UI to add or remove members from projects.
- **Form Validation**: Clean error handling and robust validation using `react-hook-form`.
- **Polished UI**: Modern UI using Tailwind CSS v4, loading skeletons, empty state illustrations, and toast notifications (`react-hot-toast`).

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, React Router DOM, Recharts, React Hook Form, @hello-pangea/dnd
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)

## Environment Setup
Create a `.env` file in the root of the project with the following keys:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

## Running Locally

1. Install dependencies in the root directory:
```bash
npm install
```

2. Start the development environment (concurrently starts both client and server):
```bash
npm run dev
```

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:5000`

## Deployment to Railway

This repository is fully configured for a seamless monorepo deployment on Railway.

1. Create a new project on **Railway** and connect this GitHub repository.
2. In the Railway dashboard, go to the **Variables** tab and add your `MONGO_URI` and `JWT_SECRET`.
3. Railway will automatically detect the `package.json` and install dependencies.
4. The root `start` script handles running the backend server, and the backend is configured to statically serve the `client/dist` frontend bundle.
5. Once built, the entire application will be publicly accessible from a single Railway URL!
