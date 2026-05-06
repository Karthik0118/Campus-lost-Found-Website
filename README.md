# Campus Lost & Found Portal (MERN)

Beginner-friendly **Lost & Found** portal with JWT auth, item posts, filters, match suggestions, and owner contact/message.

## Tech

- **Frontend**: React + React Router + Axios + simple CSS (Vite)
- **Backend**: Node.js + Express
- **DB**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt

## Folder structure

- `backend/` Express REST API
- `frontend/` React app

## Setup (Local)

### 1) Backend

1. Create `backend/.env` (copy from `backend/.env.example`)
2. Start MongoDB (local)
3. Install & run:

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2) Frontend

1. Create `frontend/.env` (copy from `frontend/.env.example`)
2. Install & run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## REST API (Main)

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (Bearer token)
- **Items**
  - `GET /api/items` (filters: `type`, `category`, `dateFrom`, `dateTo`, `q`)
  - `GET /api/items/:id`
  - `GET /api/items/:id/matches`
  - `GET /api/items/mine` (Bearer token)
  - `POST /api/items` (Bearer token)
  - `PUT /api/items/:id` (Bearer token, owner only)
  - `DELETE /api/items/:id` (Bearer token, owner only)
- **Uploads (images)**
  - `POST /api/uploads/image` (Bearer token, form-data `image`, max 2MB)
  - Uploaded files are served from `GET /uploads/<filename>`
- **Messages (simple)**
  - `POST /api/messages` (Bearer token)
  - `GET /api/messages/inbox` (Bearer token)

