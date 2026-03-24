# Alumni Connect Fullstack Concepts Note

This note explains the major things used in the project in simple language:

- what it is
- why it is used
- what it does in this project

Use this when you need to explain the system clearly in viva, review, demo, or interview-style questions.

## 1. Big Picture

`Alumni Connect` is a fullstack web application.

That means it has:

- a `frontend`
- a `backend`
- a `database`

The frontend is what users see and interact with.
The backend is the API and business logic.
The database stores the system data.

## 2. Frontend Basics

### React

What it is:
A JavaScript library for building user interfaces using components.

Why it is used:
The app has many pages, repeated UI blocks, role-based screens, forms, dashboards, and reusable pieces.

What it does here:

- renders pages like login, dashboard, events, announcements, profile
- breaks UI into components like sidebar, topbar, notes panels, dialogs
- updates the screen when state changes

### TypeScript

What it is:
JavaScript with types.

Why it is used:
It catches mistakes earlier, especially in a medium-sized frontend with many props, API responses, and page states.

What it does here:

- gives typed page/component code
- helps when working with API data
- makes refactoring safer

### Vite

What it is:
A frontend build tool and dev server.

Why it is used:
It is fast and simple for React projects.

What it does here:

- runs the frontend in development
- builds the frontend for production
- handles bundling and hot reload

### React Router

What it is:
Routing for React single-page applications.

Why it is used:
The app has many screens and needs URL-based navigation.

What it does here:

- maps routes like `/dashboard`, `/directory`, `/announcements`
- protects routes for logged-in users
- redirects users to correct profile/dashboard pages

### Axios

What it is:
An HTTP client for sending requests to the backend.

Why it is used:
It is cleaner than raw fetch for many app API calls and supports interceptors.

What it does here:

- sends API requests with cookies
- now automatically attaches CSRF tokens on unsafe requests
- is used in `frontend/src/api/client.ts` and `frontend/src/lib/api.ts`

### Fetch

What it is:
The built-in browser API for HTTP requests.

Why it is used:
Some older pages/components in the project use raw fetch directly.

What it does here:

- loads profile data
- loads notes
- updates mentorship state
- uploads files

Important:
The project now has a global CSRF-aware fetch shim, so these raw requests still get CSRF protection.

### Context API

What it is:
React’s way to share state across many components without prop drilling.

Why it is used:
Authentication state is needed in many parts of the app.

What it does here:

- stores the current logged-in user
- lets the sidebar, protected routes, and pages know the user role

### Tailwind CSS

What it is:
A utility-first CSS framework.

Why it is used:
It makes it fast to build consistent UI.

What it does here:

- styles dashboards, tables, forms, cards, layout, badges, etc.

### Lucide React

What it is:
An icon library for React.

Why it is used:
Icons improve navigation and readability.

What it does here:

- sidebar icons
- topbar icons
- page action icons

### Recharts

What it is:
A chart library for React.

Why it is used:
The app has analytics/dashboard data that needs visual presentation.

What it does here:

- charts in analytics and dashboards

## 3. Backend Basics

### Node.js

What it is:
JavaScript runtime for the server.

Why it is used:
It allows the backend to be written in JavaScript and fits well with Express.

What it does here:

- runs the API server
- runs Prisma commands
- powers route/controller execution

### Express

What it is:
A web framework for Node.js.

Why it is used:
This project needs a straightforward API server with routes, middleware, and controllers.

What it does here:

- defines routes
- runs middleware
- handles requests and responses

### PostgreSQL

What it is:
A relational database.

Why it is used:
The system has strongly related entities like users, profiles, invites, mentorship, events, settings, notes, and audit logs.

What it does here:

- stores all persistent app data
- enforces relational integrity

### Prisma

What it is:
An ORM and schema management tool.

Why it is used:
It makes relational database work safer and easier in code.

What it does here:

- defines the database schema in `schema.prisma`
- generates the Prisma client
- handles migrations
- lets controllers query/update the database with code like `prisma.user.findUnique(...)`

### Prisma Migration

What it is:
A recorded database schema change.

Why it is used:
Database changes must be versioned and reproducible.

What it does here:

- tracks schema history in `backend/prisma/migrations`
- updates Neon/Postgres safely

### Prisma Client

What it is:
The generated JS client Prisma gives you after `prisma generate`.

Why it is used:
Controllers need a real runtime client to query tables.

What it does here:

- powers `prisma.user`, `prisma.event`, `prisma.auditLog`, etc.

## 4. Backend Architecture Concepts

### Route

What it is:
An endpoint path plus HTTP method.

Example:
`GET /users`, `POST /auth/login`

What it does here:

- decides which controller handles a request

### Controller

What it is:
The function that handles request logic for a route.

Why it is used:
Keeps route files small and business logic separated.

What it does here:

- reads request data
- runs business logic
- talks to Prisma
- returns JSON

### Middleware

What it is:
Code that runs before or between route handling.

Why it is used:
Cross-cutting logic like auth, validation, rate limiting, logging, CSRF, and error handling should not be duplicated in every controller.

What it does here:

- authentication
- role checking
- Zod validation
- rate limiting
- CSRF protection
- request logging
- centralized errors

### Service

What it is:
A shared logic layer used by controllers.

Why it is used:
When logic should be reused across controllers, a service keeps things clean.

What it does here:

- `auditLog.service.js` records audit entries from different controllers

## 5. Authentication And Security

### JWT

What it is:
A signed token that represents user identity.

Why it is used:
The backend needs a secure way to remember who is logged in.

What it does here:

- backend signs a token after login/claim
- token stores basic user identity
- backend verifies it on protected requests

### Cookie-Based Auth

What it is:
The JWT is stored in a cookie instead of localStorage.

Why it is used:
`httpOnly` cookies are generally safer than exposing auth tokens to frontend JavaScript.

What it does here:

- auth cookie is set on login/claim
- browser sends it automatically
- backend reads it in auth middleware

### `cookie-parser`

What it is:
Express middleware for reading cookies from incoming requests.

Why it is used:
The backend needs access to the auth cookie and CSRF cookie.

What it does here:

- makes `req.cookies` available

### CORS

What it is:
Cross-Origin Resource Sharing.

Why it is used:
Frontend and backend run on different origins in development, so the backend must explicitly allow the frontend to call it.

What it does here:

- allows approved frontend origins
- allows credentials
- blocks unknown origins

### CSRF Protection

What it is:
Protection against Cross-Site Request Forgery.

Why it is needed:
This app uses cookie-based auth. Without CSRF protection, another site could try to make the browser send authenticated state-changing requests.

What it does here:

- backend issues a CSRF token
- frontend sends it in `x-csrf-token` for unsafe requests
- backend compares header token with cookie token
- mismatches are rejected

### Helmet

What it is:
Express middleware that sets security-related HTTP headers.

Why it is used:
It improves baseline browser security.

What it does here:

- adds protective headers
- reduces some common web attack risks

### Rate Limiting

What it is:
Restricting how often a client can call certain endpoints.

Why it is used:
Sensitive routes like login, claim, bootstrap, invite creation, and import should not be spammed.

What it does here:

- limits repeated requests in a time window
- helps reduce brute force and abuse

### RBAC

What it is:
Role-Based Access Control.

Why it is used:
Admins, faculty, students, and alumni should not all have the same powers.

What it does here:

- backend checks roles before allowing actions
- frontend shows role-aware UI

### Zod

What it is:
A schema validation library.

Why it is used:
The backend should reject invalid request bodies, params, and query strings before controller logic runs.

What it does here:

- validates incoming API data
- parses numbers/booleans safely
- returns structured validation errors

### Centralized Error Handling

What it is:
One backend error pipeline instead of many random `try/catch` response shapes.

Why it is used:
Consistency and maintainability.

What it does here:

- maps known errors
- standardizes API error responses
- handles Prisma errors and JSON parse errors cleanly

## 6. Logging And Monitoring

### Pino

What it is:
A structured logging library.

Why it is used:
Structured logs are easier to filter, search, and analyze than plain console strings.

What it does here:

- logs startup
- logs request-level errors
- logs structured metadata

### `pino-http`

What it is:
HTTP logging middleware for Express.

Why it is used:
Each request should have consistent logging metadata.

What it does here:

- assigns request IDs
- logs request/response info
- makes `req.log` available

### Request ID

What it is:
A unique ID attached to a request.

Why it is used:
It helps trace one request through logs and audit records.

What it does here:

- request logger creates it
- response returns it in `x-request-id`
- audit logs store it

### Health Endpoint

What it is:
A simple API endpoint that says whether the app is alive.

Why it is used:
Useful for uptime checks and deployment monitoring.

What it does here:

- `/health` returns basic app status

### Readiness Endpoint

What it is:
An endpoint that checks whether the app is actually ready to serve requests.

Why it is used:
A server may be running but not connected to the database.

What it does here:

- `/ready` checks database readiness with Prisma

## 7. Data Handling And File Uploads

### Multer

What it is:
Middleware for handling multipart/form-data uploads.

Why it is used:
CSV import and profile photo upload need file handling.

What it does here:

- processes uploaded CSV files
- processes uploaded profile images

### CSV Import

What it is:
Bulk creation of profiles from CSV files.

Why it is used:
Institutions may already have student/alumni records in spreadsheets.

What it does here:

- parses CSV
- normalizes columns
- creates student/alumni profiles
- returns created/skipped summaries

## 8. Product Hardening Features You Added

### Structured Validation

Now the backend validates most request body/query/params before controller logic runs.

### Rate Limits

Sensitive mutation/auth routes now have request limits.

### Env Validation

The backend now fails fast if required environment variables are missing or invalid.

### Audit Log

What it is:
A persistent record of sensitive actions.

Why it is used:
Admins and institutions need traceability.

What it does here:

- stores who did what
- stores when they did it
- stores request context and metadata
- powers the admin audit log page

### Audit Log Page

What it is:
An admin-only frontend page for viewing audit entries.

Why it is used:
Stored audit records are only useful if admins can review them.

What it does here:

- lists audit entries
- supports search/filter/pagination

## 9. Frontend Architecture Concepts

### Protected Route

What it is:
A route wrapper that blocks unauthenticated access.

What it does here:

- redirects unauthorized users away from protected pages

### Dashboard Layout

What it is:
A shared layout component for the main app shell.

What it does here:

- provides sidebar
- provides topbar
- keeps pages visually consistent

### Sidebar

What it is:
Role-aware app navigation.

What it does here:

- changes navigation based on role
- now includes admin audit log navigation

### Topbar

What it is:
The header bar across the protected app.

What it does here:

- shows workspace title
- shows user info
- handles logout

## 10. Core Product Flows

### Invite + Claim Flow

What it is:
Institution-controlled onboarding.

Why it is used:
This project does not use open public signup.

What it does here:

1. institution creates/imports a profile
2. admin/faculty creates invite
3. recipient claims account with token
4. backend creates user and links profile

### Mentorship Flow

What it is:
A tracked mentorship request lifecycle.

What it does here:

- student requests mentorship
- alumni accepts/declines
- student/alumni complete the mentorship

### Events Flow

What it is:
Managed event creation and registration.

What it does here:

- admin/faculty create events
- students/alumni register
- backend tracks responses

### Announcements Flow

What it is:
Role/program/year-targeted communication.

What it does here:

- admin/faculty create announcements
- students/alumni see relevant announcements

## 11. Why This Is More Than CRUD

This project is more than simple CRUD because it includes:

- role-based access control
- controlled onboarding
- privacy-aware profile access
- live reminders
- analytics
- audit logs
- request logging
- CSRF protection
- rate limiting
- validation and hardening

So it is not just “create, read, update, delete records.”
It is a workflow-based institutional platform.

## 12. Simple Summary You Can Say Out Loud

`Alumni Connect` uses React + TypeScript + Vite on the frontend and Node + Express + Prisma + PostgreSQL on the backend.

The frontend renders the user interface and calls the API.
The backend handles authentication, RBAC, validation, business logic, logging, security, auditability, and database access.

Prisma manages the schema and database queries.
JWT + cookies handle authentication.
Zod validates requests.
Helmet, CORS, CSRF protection, and rate limiting harden the API.
Pino logs requests and errors.
Audit logs store important admin actions for traceability.

That is the full technical story in a strong, understandable form.
