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
them into the database, then seeds the storefront testimonials. Re-running skips
bouquets whose title already exists and testimonials whose name+text already exist.

Required environment variables for the seed:
- `DATABASE_URL` (any reachable PostgreSQL, including Render's External Database URL)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SEED_IMAGES_DIR` — absolute path to the storefront `img/` directory

## Endpoints

- `GET /health` — public liveness probe, returns `200`.
- `GET /api/bouquets` — public list. Optional query params: `favorite` (boolean)
  filters by favorite state; `page` (≥1) + `limit` (1–100) enable pagination. Without
  pagination params returns a plain JSON array; with them returns
  `{ data, total, page, limit, totalPages }`.
- `GET /api/bouquets/:id` — public Bouquet lookup; `400` for invalid id, `404` for absent.
- `POST /api/bouquets` — administrative create. Requires `Authorization: Bearer <ADMIN_API_KEY>`.
  Multipart fields: `image` (jpeg/png/webp/gif, ≤ 6 MB), `title`, `description`, `price` (positive, ≤ 2 decimal places), `favorite` (boolean, optional, default `false`). Returns `201` with the public Bouquet.
- `PUT /api/bouquets/:id` — administrative partial update. Requires Bearer auth. Multipart with any subset of `title`, `description`, `price`, `favorite`, `image`; omitted fields are preserved. Rejects empty payload (no fields and no image) with `400`. On image replacement, the new asset is uploaded, the DB row is updated, then the old Cloudinary asset is removed. Returns `200` with the updated Bouquet, `404` if absent.
- `PATCH /api/bouquets/:id/favorite` — administrative favorite toggle. Requires Bearer auth. Body: `{ "favorite": true|false }` (no extra fields). Returns `200` with the updated Bouquet, `404` if absent.
- `DELETE /api/bouquets/:id` — administrative delete. Requires Bearer auth. Removes the row, then best-effort destroys the Cloudinary asset (failure is logged, response stays `204`). Returns `204` (no body), `404` if absent.
- `GET /api/testimonials` — public list of all Testimonials, plain JSON array (`id`, `name`, `text`, timestamps).
- `POST /api/testimonials` — public create. JSON body: `{ "name": string (1–100), "text": string (1–1000) }`. Returns `201` with the created Testimonial.
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

## Deploying to Render

The repository ships a `render.yaml` Blueprint that provisions both the database
and the web service in a single step.

### One-time setup

1. **Push the backend to a GitHub repo.** From the `fireplace_backend/`
   directory:
   ```bash
   git init
   git add .
   git commit -m "Flora bouquet backend"
   gh repo create flora-bouquet-backend --private --source=. --push
   ```
2. **Create a Blueprint instance.** In Render: **New + → Blueprint**, point it
   at the new repo, accept `render.yaml`. Render creates the free PostgreSQL
   instance and the free Node web service with the env vars declared in the
   blueprint (`NODE_ENV`, `CORS_ORIGIN`, `ADMIN_API_KEY` auto-generated,
   `CLOUDINARY_FOLDER`).
3. **Add Cloudinary secrets in the dashboard.** Open the `flora-api` service →
   *Environment* → add:
   - `CLOUDINARY_CLOUD_NAME` = `dxuacztvw`
   - `CLOUDINARY_API_KEY` = your key
   - `CLOUDINARY_API_SECRET` = your secret
   - `CLOUDINARY_FOLDER` = `flora-bouquets` (already in the blueprint, no need
     to duplicate)
   These are not in `render.yaml` so they never reach git.
4. **Trigger a deploy.** Render redeploys automatically once the secrets land;
   wait for **Live** status and tail the logs to see
   `Database connection successful` followed by `Server listening on port …`.

### Seeding the remote database

The free Render Postgres does not expose a local filesystem, so seeding runs
from a machine that has the storefront images. Use the **External Database
URL** from the Render Postgres dashboard and the storefront `img/` path:

```bash
DATABASE_URL='postgres://flora:…@dpg-….oregon-postgres.render.com/flora_external' \
SEED_IMAGES_DIR='/absolute/path/to/UMT-markup-practice-Hryhorenko/img' \
CLOUDINARY_CLOUD_NAME=dxuacztvw \
CLOUDINARY_API_KEY=… \
CLOUDINARY_API_SECRET=… \
npm run seed
```

Re-running the command is safe: existing titles are skipped, the database is
not cleared, and Cloudinary assets are reused (not duplicated).

### Verifying the live service

- `https://<flora-api>.onrender.com/health` → `200`
- `https://<flora-api>.onrender.com/api-docs` → Swagger UI; click *Authorize*
  and paste the `ADMIN_API_KEY` from the dashboard to exercise the write paths.
- `https://<flora-api>.onrender.com/api/bouquets` → JSON array.

### Connecting the storefront

1. Set the GitHub repository variable for the storefront:
   `FLORA_API_BASE_URL` = `https://<flora-api>.onrender.com`
2. Re-run the Pages deploy workflow. The generated `dist/js/config.js` will
   now point at the live API. Verify in the browser console: no `db.json`
   requests, no CORS errors.

### Manual setup (no Blueprint)

If you prefer the click-through flow, create a free Web Service and a free
PostgreSQL instance separately, then add the env vars from the
[Environment variables](#environment-variables) table to the web service:

| key | value |
| --- | --- |
| `DATABASE_URL` | *Internal Database URL* from the Postgres page |
| `NODE_VERSION` | `20` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://anton313131.github.io` |
| `ADMIN_API_KEY` | a strong random string (32+ chars) |
| `CLOUDINARY_CLOUD_NAME` | `dxuacztvw` |
| `CLOUDINARY_API_KEY` | your key |
| `CLOUDINARY_API_SECRET` | your secret |
| `CLOUDINARY_FOLDER` | `flora-bouquets` |

Health-check path: `/health`. Build: `npm ci`. Start: `npm start`.
