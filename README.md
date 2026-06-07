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

Before running the app you need a Firebase project configured.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project (or use an existing one).
2. Enable **Authentication** → Sign-in methods: Email/Password and Google.
3. Enable **Firestore Database** in production or test mode.
4. Go to **Project Settings → Service Accounts → Generate new private key** and download the JSON file.
5. Place the downloaded JSON file at the repo root and name it `firebase-credentials.json`.

---

## Environment Variables

### Frontend (`frontend/.env`)

Create `frontend/.env` (copy from `frontend/.env.example` if present):

```env
VITE_API_URL=http://localhost:8080/api

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Find these values in your Firebase project under **Project Settings → General → Your apps**.

### Backend (`api/.env`)

Copy the example and fill in your values:

```bash
cp api/.env.example api/.env
```

Key variables to set:

```env
APP_KEY=                          # generated below
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CREDENTIALS=/absolute/path/to/firebase-credentials.json
```

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
