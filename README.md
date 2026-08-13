# evoTracker

A body measurement tracking app. Log measurements across multiple body parts, visualise progress over time, and get trend-based estimates.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Material UI, Recharts |
| Backend | Laravel 11 (PHP 8.2+), Laravel Sanctum (token auth) |
| Database | MySQL |
| Local dev | Docker Compose |
| Deployment | Render.com (Docker) |

---

## Running Locally (Docker)

Requires Docker Desktop.

```bash
docker compose up --build
```

This starts four containers:

| Service | URL | What it is |
|---|---|---|
| `frontend` | http://localhost:5173 | React/Vite dev server (hot reload) |
| `api` | http://localhost:8080 | Laravel API |
| `mysql` | localhost:3307 | Database |
| `phpmyadmin` | http://localhost:8081 | Web UI for browsing tables (user: `evotracker`, password: `secret`) |

Your source is bind-mounted into the containers, so edits on disk apply live — no rebuild needed unless you change a `Dockerfile.dev`. On first boot, the `api` container installs Composer dependencies and runs migrations automatically (see `api/docker-entrypoint.dev.sh`).

---

## Project Structure

```
evotracker/
├── api/                        # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/    # AuthController, MeasurementController, ProfileController, ProgressController
│   │   └── Models/              # User, Measurement, Profile
│   ├── database/migrations/
│   ├── routes/
│   │   └── api.php             # All API routes
│   ├── Dockerfile               # Production image (Render deployment)
│   └── Dockerfile.dev           # Local dev image (used by docker-compose.yml)
│
├── frontend/                   # React frontend
│   └── src/
│       ├── hooks/              # useAuth, useMeasurements
│       ├── pages/              # Login, Onboarding, Dashboard, Measurements, Progress
│       └── services/
│           ├── api.js          # Axios instance (attaches stored auth token)
│           └── auth.js         # login/register/logout helpers
│
└── docker-compose.yml          # Local dev stack: mysql, phpmyadmin, api, frontend
```

---

## Auth

Email/password auth, backed by Laravel Sanctum. `POST /api/register` and `POST /api/login` return a bearer token, which the frontend stores in `localStorage` and attaches to every request via the axios interceptor in `frontend/src/services/api.js`. All other `/api/*` routes require `Authorization: Bearer <token>` and are protected by the `auth:sanctum` middleware.

## API Routes

| Method | Endpoint | Auth required | Description |
|--------|----------|:---:|-------------|
| `POST` | `/api/register` | – | Create an account, returns a token |
| `POST` | `/api/login` | – | Log in, returns a token |
| `POST` | `/api/logout` | ✓ | Revoke the current token |
| `GET` | `/api/me` | ✓ | Current user |
| `GET` | `/api/measurements` | ✓ | List all measurements |
| `POST` | `/api/measurements` | ✓ | Add (or update today's) measurement |
| `GET` | `/api/measurements/{body_part}` | ✓ | Measurements for a specific body part |
| `DELETE` | `/api/measurements/{id}` | ✓ | Delete a measurement |
| `GET` | `/api/profile` | ✓ | Get user profile |
| `PUT` | `/api/profile` | ✓ | Update user profile |
| `GET` | `/api/progress/estimate` | ✓ | Get trend-based estimates |

---

## Deployment

The backend is configured for deployment on **Render.com** via `api/render.yaml`, building from `api/Dockerfile` (PHP 8.2 CLI, production, exposes port `8080`). Render needs its own MySQL (or other) database service, with `DB_*` env vars set in the dashboard to point at it — this repo's `docker-compose.yml` only provisions a database for local dev.

For the frontend, deploy the `frontend/` directory to any static host (Vercel, Netlify, etc.) after setting `VITE_API_URL` to the deployed API's URL.
