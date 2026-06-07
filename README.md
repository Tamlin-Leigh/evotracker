# evoTracker

A body measurement tracking app. Log measurements across multiple body parts, visualise progress over time, and get trend-based estimates.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Material UI, Recharts |
| Backend | Laravel 11 (PHP 8.2+) |
| Auth | Firebase Authentication (email/password + Google OAuth) |
| Database | Firestore (Google Cloud) |
| Deployment | Render.com (Docker) |

---

## Prerequisites

- **Node.js** 18+ and npm
- **PHP** 8.2+ and [Composer](https://getcomposer.org/)
- A **Firebase project** with Authentication and Firestore enabled
- A Firebase **service account credentials** JSON file

---

## Firebase Setup

The app uses **two separate Firebase projects** — one for development and one for production. This ensures local testing never touches real user data.

### 1. Create two Firebase projects

In the [Firebase Console](https://console.firebase.google.com/), create:

- `evotracker-dev` — for local development
- `evotracker` (or your chosen name) — for production

For **each** project:
1. Enable **Authentication** → Sign-in methods: Email/Password and Google.
2. Enable **Firestore Database**.
3. Go to **Project Settings → Service Accounts → Generate new private key** and download the JSON.

### 2. Place credentials files

Save the downloaded files at the repo root (both are gitignored):

```
firebase-credentials-dev.json   ← dev project service account key
firebase-credentials.json       ← production project service account key
```

---

## Environment Variables

### Frontend

```bash
# Copy the example and fill in your DEV project's Firebase config
cp frontend/.env.example frontend/.env
```

Find the values in your **dev** Firebase project under **Project Settings → General → Your apps → Web app → Config**.

```env
VITE_API_URL=http://localhost:8080/api

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=evotracker-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=evotracker-dev
VITE_FIREBASE_STORAGE_BUCKET=evotracker-dev.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`frontend/.env.production` contains the production Firebase values and is used automatically by `npm run build`.

### Backend

```bash
cp api/.env.example api/.env
```

Key variables to set (use your **dev** project locally):

```env
APP_KEY=                                          # generated below
FIREBASE_PROJECT_ID=evotracker-dev
FIREBASE_CREDENTIALS=/absolute/path/to/firebase-credentials-dev.json
```

Production values (`evotracker` project + production credentials) are set as environment variables on Render.com — never in this file.

---

## Installation & Running Locally

### 1. Backend (Laravel API)

```bash
cd api
composer install
php artisan key:generate
php artisan serve --port=8080
```

The API will be available at `http://localhost:8080`.

> **Note:** Laravel is configured to use SQLite only for internal cache/session tables. All user data (measurements, profiles) is stored in Firestore.

### 2. Frontend (React + Vite)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Project Structure

```
evotracker/
├── api/                        # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # MeasurementController, ProfileController, ProgressController
│   │   │   └── Middleware/     # VerifyFirebaseToken (JWT auth)
│   │   └── Services/
│   │       └── FirestoreService.php   # Firestore REST API wrapper
│   ├── routes/
│   │   └── api.php             # All API routes
│   └── Dockerfile              # Docker config for Render deployment
│
├── frontend/                   # React frontend
│   └── src/
│       ├── hooks/              # useAuth, useMeasurements
│       ├── pages/              # Login, Signup, Dashboard, Measurements, Progress
│       └── services/
│           ├── api.js          # Axios instance (auto-attaches Firebase JWT)
│           └── firebase.js     # Firebase initialisation
│
└── firebase-credentials.json   # Service account key (not committed)
```

---

## API Routes

All routes require a valid Firebase JWT (`Authorization: Bearer <token>`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/measurements` | List all measurements |
| `POST` | `/api/measurements` | Add a measurement |
| `GET` | `/api/measurements/{body_part}` | Measurements for a specific body part |
| `DELETE` | `/api/measurements/{id}` | Delete a measurement |
| `GET` | `/api/profile` | Get user profile |
| `PUT` | `/api/profile` | Update user profile |
| `GET` | `/api/progress/estimate` | Get trend-based estimates |

---

## Deployment

The backend is configured for deployment on **Render.com** via `api/render.yaml`.

- Builds from `api/Dockerfile` (PHP 8.2 CLI)
- Exposes port `8080`
- Requires the following environment variables set in the Render dashboard:
  - `APP_KEY`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CREDENTIALS` (path to the secret file)
- The Firebase credentials JSON is injected as a secret file at `/etc/secrets/firebase-credentials.json`

For the frontend, deploy the `frontend/` directory to any static host (Vercel, Netlify, etc.) after setting the `VITE_*` environment variables.
