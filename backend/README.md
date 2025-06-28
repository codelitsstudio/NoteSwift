# MERN Server — README

## Overview

This is the backend server for the MERN stack project, built with:

- **Express.js** for HTTP routing  
- **Mongoose** for MongoDB object modeling   
- Environment variables via **dotenv**

---

## Prerequisites

- **Node.js** (v16 or higher recommended)  
- **npm** or **yarn** package manager  
- **MongoDB connection URI** (local or cloud, e.g. MongoDB Atlas)

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure environment variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
SESSION_SECRET=your_secret_key_here
```

- `PORT` — The port the server listens on (default: 5000) *(dont change 5000 unless needed)*
- `MONGO_URI` — Your MongoDB connection string  
- `SESSION_SECRET` — Secret key used to sign JWT tokens and cookies

### 3. Run the server in development mode

```bash
npm run dev
```

- Runs the server with **nodemon** and auto-restarts on file changes  
- Supports TypeScript path aliases via `tsconfig-paths`

### 4. Build and start production server

```bash
npm run build
npm start
```

- Compiles TypeScript to JavaScript in the `compiled` folder  
- Runs the compiled JavaScript server

---

## Available Scripts

| Command       | Description                            |
|---------------|-------------------------------------|
| `npm run dev` | Run server with hot-reloading (development) |
| `npm run build` | Compile TypeScript to JavaScript            |
| `npm start`   | Run compiled JavaScript server (production) |

---

## Server Architecture

- **src/app.ts** — Main entry point  
- **routes/** — API route definitions  
- **controllers/** — Route controllers and logic  
- **models/** — Mongoose models and schemas  
- **middleware/** — Express middleware (auth, validation, etc.)  
- **lib/Response.ts** — JSON response helper class  

---

## Middleware Configuration

- `cookie-parser` — Parses cookies on incoming requests  
- `body-parser.json()` — Parses incoming JSON payloads  
- `cors` — Enables cross-origin requests (currently allowing all origins with credentials)

---

## Starting the Server

Once running, the server listens on the port specified in `.env` (default 5000).  
API endpoints are prefixed with `/api`.

Example:

```
http://localhost:5000/api/student/signup
```

---

## Troubleshooting

- Make sure your `.env` variables are set correctly.  
- MongoDB connection errors will be logged to console.  
- Use `npm run dev` during development for automatic reloads.

---
