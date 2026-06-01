# Research Backend

Node.js + Express API for the Research Management System.

## Setup

```bash
npm install
```

Create `.env` from `.env.example` and fill in values.

```bash
npm run dev
```

## Scripts

- `npm run dev` - start with nodemon
- `npm start` - start server
- `npm run seed` - seed sample data (skips if data exists)

To overwrite existing data when seeding:

```bash
SEED_RESET=true npm run seed
```

## Environment Variables

- `PORT` - Server port (Render will supply `PORT` automatically)
- `NODE_ENV` - `development` or `production`
- `MONGO_URI` - MongoDB Atlas connection string
- `FRONTEND_ORIGIN` - Vercel or localhost origin allowed by CORS
- `AWS_REGION` - AWS region (for example `ap-south-1`)
- `AWS_S3_BUCKET` - S3 bucket name for file storage
- `AWS_ACCESS_KEY_ID` - IAM access key with S3 write permissions
- `AWS_SECRET_ACCESS_KEY` - IAM secret key

## Render Deployment Prep

This repo includes a `render.yaml` blueprint with the production start command.
Set the environment variables in Render (do not commit production values).

Recommended steps:

1. Push this backend folder to GitHub.
2. Create a new Render Web Service from the repo.
3. Use the default build/start commands or the ones in `render.yaml`.
4. Add `MONGO_URI` and `FRONTEND_ORIGIN` in Render env settings.

## API Overview

Base URL: `/api`

- `GET /api/health`
- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `GET /api/departments`
- `POST /api/departments`
- `GET /api/departments/:id`
- `PATCH /api/departments/:id`
- `GET /api/submissions`
- `POST /api/submissions` (multipart supported)
- `GET /api/submissions/:id`
- `PATCH /api/submissions/:id/status`
- `GET /api/approvals`
- `GET /api/reports/summary`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/uploads`
