# Alumni Connect

Alumni Connect is a role-based platform for managing long-term student and alumni relationships in an academic institution.  
It centralizes profile records, invite/claim onboarding, mentorship requests, announcements, events, and administrative operations that were previously scattered across spreadsheets.

## Why This Project Exists

This system was built from a real faculty request to solve fragmented data and inconsistent follow-up workflows.  
The goal is to provide:

- clean, structured profile management for students and alumni
- reliable administrative controls for faculty and admins
- active participation from alumni and students through claimable profiles
- practical engagement features (mentorship, announcements, events)

## Core Roles

- `admin` - full platform governance, user management, sensitive operations
- `faculty` - operational management of records, outreach, mentorship workflows
- `student` - profile ownership, mentorship requests, event participation
- `alumni` - profile ownership, mentorship contributions, event participation

## Key Features

- Profile lifecycle management (claimed and unclaimed records)
- CSV bulk import for student and alumni profiles
- Invite + claim account workflow
- Mentorship request workflow with status transitions
- Events and announcements
- Private notes for staff workflows
- Role-based access control (RBAC)
- Audit logging for high-impact operations
- Media upload support (profile photos and resumes)

## Tech Stack

### Frontend

- React + TypeScript + Vite
- React Router
- Tailwind CSS
- Axios

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL (Neon)
- Zod validation
- JWT auth + cookie sessions
- Multer uploads
- Cloudinary integration (optional/production-friendly)

## Repository Structure

- `backend/` - Express API, Prisma schema, business logic
- `frontend/` - React app
- `EXPO_PITCH_GUIDE.md` - presentation support notes

## Local Development Setup

### 1) Install dependencies

From project root:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Configure backend environment

Create `backend/.env` with at least:

- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `BOOTSTRAP_SECRET`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `COOKIE_SECURE`
- `COOKIE_SAME_SITE`
- `TRUST_PROXY`

Optional media settings:

- `UPLOADS_DIR` (filesystem fallback)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 3) Configure frontend environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 4) Run services

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Scripts

### Backend

- `npm run dev` - start API in watch mode
- `npm run start` - start API
- `npm test` - run tests (Vitest)

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - lint frontend

## Deployment Notes

- Backend and frontend are deployed independently.
- Ensure `VITE_API_URL` points to backend in frontend production env.
- Ensure backend `FRONTEND_URL` and `CORS_ORIGINS` match deployed frontend origin.
- If using Cloudinary, all three Cloudinary env vars must be set together.

## Current Product Direction

- Mentorship is one module of a broader institutional system.
- Institution-facing value includes:
  - cleaner operational workflows
  - better alumni continuity
  - stronger event/engagement coordination
  - improved curriculum and program insights from alumni outcomes

## License

Academic project / internal use unless otherwise specified.
