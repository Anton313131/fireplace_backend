# Flora Bouquet Backend

Express + Sequelize + PostgreSQL backend for the Flora Bouquet catalogue.

## Local development

1. Install dependencies: `npm install`
2. Copy environment template: `cp .env.example .env`
3. Provide a reachable `DATABASE_URL` and set `CORS_ORIGIN` to the storefront origin(s).
4. Start the server: `npm run dev` (or `npm start` for plain Node).

The server authenticates the database, runs non-destructive synchronization, then
binds the configured port. A database connection failure logs to `console.error`
and exits with code 1.

## Endpoints

- `GET /health` — public liveness probe, returns `200`.
- `GET /api-docs` — Swagger UI (added in a later slice).

## Environment variables

| Name | Required | Notes |
| --- | --- | --- |
| `PORT` | no | Defaults to `3000`. |
| `NODE_ENV` | no | `development` (default) or `production`. |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `CORS_ORIGIN` | no | Comma-separated list of allowed origins. Production uses a single storefront origin. |
| `ADMIN_API_KEY` | no | Bearer key required for write operations. |
| `CLOUDINARY_CLOUD_NAME` | no | Cloudinary credentials for image storage. |
| `CLOUDINARY_API_KEY` | no | |
| `CLOUDINARY_API_SECRET` | no | |
