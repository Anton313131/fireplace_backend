# Flora Bouquet Backend

Express + Sequelize + PostgreSQL backend for the Flora Bouquet catalogue.

## Local development

1. Install dependencies: `npm install`
2. Copy environment template: `cp .env.example .env`
3. Provide a reachable `DATABASE_URL`, set `CORS_ORIGIN` to the storefront origin(s),
   and add Cloudinary credentials if you plan to seed images.
4. Start the server: `npm run dev` (or `npm start` for plain Node).

The server authenticates the database, runs non-destructive synchronization, then
binds the configured port. A database connection failure logs to `console.error`
and exits with code 1.

## Seeding the catalogue

`npm run seed` uploads the 11 unique storefront records to Cloudinary and inserts
them into the database. Re-running skips records whose title already exists.

Required environment variables for the seed:
- `DATABASE_URL` (any reachable PostgreSQL, including Render's External Database URL)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SEED_IMAGES_DIR` — absolute path to the storefront `img/` directory

## Endpoints

- `GET /health` — public liveness probe, returns `200`.
- `GET /api/bouquets` — public list of all Bouquets, plain JSON array.
- `GET /api/bouquets/:id` — public Bouquet lookup; `400` for invalid id, `404` for absent.
- `POST /api/bouquets` — administrative create. Requires `Authorization: Bearer <ADMIN_API_KEY>`.
  Multipart fields: `image` (jpeg/png/webp/gif, ≤ 6 MB), `title`, `description`, `price` (positive, ≤ 2 decimal places), `favorite` (boolean, optional, default `false`). Returns `201` with the public Bouquet.
- `PUT /api/bouquets/:id` — administrative partial update. Requires Bearer auth. Multipart with any subset of `title`, `description`, `price`, `favorite`, `image`; omitted fields are preserved. Rejects empty payload (no fields and no image) with `400`. On image replacement, the new asset is uploaded, the DB row is updated, then the old Cloudinary asset is removed. Returns `200` with the updated Bouquet, `404` if absent.
- `PATCH /api/bouquets/:id/favorite` — administrative favorite toggle. Requires Bearer auth. Body: `{ "favorite": true|false }` (no extra fields). Returns `200` with the updated Bouquet, `404` if absent.
- `DELETE /api/bouquets/:id` — administrative delete. Requires Bearer auth. Removes the row, then best-effort destroys the Cloudinary asset (failure is logged, response stays `204`). Returns `204` (no body), `404` if absent.
- `GET /api-docs` — Swagger UI; use the Authorize button to set the Bearer key.

## Environment variables

| Name | Required | Notes |
| --- | --- | --- |
| `PORT` | no | Defaults to `3000`. |
| `NODE_ENV` | no | `development` (default) or `production`. |
| `DATABASE_URL` | yes | PostgreSQL connection string. |
| `CORS_ORIGIN` | no | Comma-separated list of allowed origins. Production uses a single storefront origin. |
| `ADMIN_API_KEY` | no | Bearer key required for write operations. |
| `CLOUDINARY_CLOUD_NAME` | seed | Cloudinary cloud name. |
| `CLOUDINARY_API_KEY` | seed | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | seed | Cloudinary API secret. |
| `CLOUDINARY_FOLDER` | no | Cloudinary folder for uploads, defaults to `flora-bouquets`. |
| `SEED_IMAGES_DIR` | seed | Absolute path to the storefront `img/` directory. |
