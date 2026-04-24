<div align="center">
  <h1>🌱 SmartSeason</h1>
  <p><strong>A full-stack agricultural field management system for coordinators and field agents.</strong></p>
</div>

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Local Setup](#local-setup)
5. [Environment Variables](#environment-variables)
6. [Running the Project](#running-the-project)
7. [First Admin User](#first-admin-user)
8. [Seeding the Database](#seeding-the-database)
9. [API Reference](#api-reference)
10. [Design Decisions](#design-decisions)
11. [Assumptions](#assumptions)

---

## Overview

SmartSeason is an agricultural tracking platform that helps coordinators manage fields and monitor agent activity. Admins register fields, assign agents, and view system-wide metrics. Agents log field updates and track the lifecycle of their assigned sectors.

### Features

- **Role-Based Access Control** — Two roles: `admin` and `agent`. Admins have full CRUD access. Agents can only view and update their assigned fields.
- **Field Lifecycle Tracking** — Fields progress through four stages: `Planted → Growing → Ready → Harvested`.
- **Computed Field Status** — Status (`active`, `at-risk`, `completed`) is derived at query time from planting date and last update date — never stored in the database.
- **Agent Dashboards** — Each agent sees only their assigned fields and their own update history.
- **Admin Overview** — System-wide stats including field counts by status and stage, and a recent activity feed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL via Supabase |
| Authentication | Clerk |
| HTTP Client | Axios |

---

## Project Structure

```
smartseason/
├── backend/
│   └── api/
│       ├── lib/
│       │   ├── db.js              # PostgreSQL connection pool
│       │   └── fieldStatus.js     # Status computation logic
│       ├── middleware/
│       │   └── auth.js            # requireAuth and requireAdmin middleware
│       ├── routes/
│       │   ├── auth.js            # /api/auth — sync, me, elevate
│       │   ├── fields.js          # /api/fields — CRUD
│       │   ├── updates.js         # /api/fields/:id/updates
│       │   ├── users.js           # /api/users/agents
│       │   └── dashboard.js       # /api/dashboard/admin and /agent
│       └── index.js               # Express app entry point
├── frontend/
│   └── src/
│       ├── lib/api.ts             # Axios instance with auth interceptor
│       ├── pages/                 # All page components
│       └── App.tsx                # Routes and auth sync
├── schema.sql                     # Database schema
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js v18 or higher
- A [Clerk](https://clerk.com) account
- A [Supabase](https://supabase.com) project

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd smartseason
```

---

### 2. Set up Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application.
2. Select **Email** and **Password** as sign-in methods (or any you prefer).
3. From your Clerk dashboard, copy:
   - **Publishable Key** — starts with `pk_test_...`
   - **Secret Key** — starts with `sk_test_...`

---

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once ready, go to **Project Settings → Database → Connection string** and copy the **URI**.
   - Use the `Transaction` mode URI on port `6543` if you are using the connection pooler.
   - Use the direct URI on port `5432` for a direct connection.
3. Open the **SQL Editor** in your Supabase dashboard, paste the full contents of `schema.sql` from the root of this project, and run it to create all required tables.

---

## Environment Variables

Create a `.env` file inside `backend/` — use `backend/.env.example` as a reference:

```env
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=postgresql://user:password@host:port/postgres
FRONTEND_URL=http://localhost:5173
ADMIN_PASSWORD=your_chosen_admin_password
```

Create a `.env` file inside `frontend/` — use `frontend/.env.example` as a reference:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
VITE_ADMIN_PASSWORD=your_chosen_admin_password
```

> `ADMIN_PASSWORD` and `VITE_ADMIN_PASSWORD` must be identical. This shared secret is used to elevate a signed-in user to the `admin` role via the Admin Gate screen.

---

## Running the Project

Install dependencies and start both servers in separate terminals.

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev
```

```bash
# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Health check | http://localhost:3000/api/health |

---

## First Admin User

Every new sign-up is assigned the `agent` role by default. To create an admin:

1. Sign up at `http://localhost:5173`.
2. Navigate to `http://localhost:5173/admin-gate`.
3. Enter the `ADMIN_PASSWORD` you set in your `.env` files.
4. Your account is elevated to `admin` and you are redirected to the Admin Dashboard.

This only needs to be done once per user you want to make an admin.

---

## Seeding the Database

After creating at least one admin and one agent user, you can populate the database with sample data:

```bash
cd backend
node seed.js
```

This creates 6 sample fields with update history using your existing users. It clears any existing fields first but does not touch the users table.

---

## API Reference

All endpoints require a `Bearer` token in the `Authorization` header unless stated otherwise.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/sync` | Any signed-in user | Upserts the user record into the database on login |
| GET | `/api/auth/me` | Any signed-in user | Returns the current user's database record |
| POST | `/api/auth/elevate` | Any signed-in user | Elevates role to `admin` if the correct password is provided |

### Fields

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/fields` | Auth | Admins get all fields. Agents get only their assigned fields |
| POST | `/api/fields` | Admin | Create a new field |
| GET | `/api/fields/:id` | Auth | Get a single field. Agents can only access their own |
| PUT | `/api/fields/:id` | Admin | Update field details |
| DELETE | `/api/fields/:id` | Admin | Delete a field and all its updates |
| PATCH | `/api/fields/:id/assign` | Admin | Reassign or unassign the agent for a field |

### Field Updates

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/fields/:id/updates` | Auth | Get the update history for a field |
| POST | `/api/fields/:id/updates` | Auth | Submit a new update and advance the field stage |

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/agents` | Admin | List all users with the `agent` role |

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/dashboard/admin` | Admin | System-wide stats and recent activity |
| GET | `/api/dashboard/agent` | Auth | Stats and recent activity scoped to the current agent |

---

## Design Decisions

### Computed field status, not stored

Field status (`active`, `at-risk`, `completed`) is calculated on every read inside `api/lib/fieldStatus.js` rather than being persisted as a column. This avoids the need for scheduled jobs or triggers to keep the status column in sync as time passes. The trade-off is a small amount of computation per field per request, which is acceptable at this scale.

### Clerk handles identity, PostgreSQL handles authorization

Clerk is used purely for authentication — verifying who the user is via JWT. All authorization logic (role checks, field ownership) lives in the Express middleware and route handlers against the local `users` table. This keeps the backend in control of permissions and avoids coupling business logic to a third-party service.

### User sync on every login

When a user signs in, the frontend calls `POST /api/auth/sync` to upsert their record into the `users` table. This ensures the local database always has an up-to-date record for every Clerk user without requiring a webhook setup, which simplifies local development.

### Admin elevation via shared password

Rather than a Clerk-based role or an invite system, admin access is granted by entering a shared password on the Admin Gate screen. This was chosen for simplicity in a local development context. The password is stored only in environment variables and never committed to the repository.

### Agents can only see their assigned fields

The `GET /api/fields` and `GET /api/fields/:id` endpoints enforce field-level access control. An agent requesting a field they are not assigned to receives a `403`. This is enforced on the backend, not just hidden in the UI.

### Posting an update also advances the field stage

When an agent submits a field update via `POST /api/fields/:id/updates`, the backend simultaneously updates `fields.current_stage` to match the submitted stage. This keeps the field's stage in sync with the latest agent report without requiring a separate edit step.

---

## Assumptions

- **One agent per field.** The schema supports a single `assigned_agent_id` per field. Multiple agents per field was considered out of scope.
- **All users start as agents.** There is no sign-up flow that creates admins directly. Admin access is always granted post-registration via the Admin Gate.
- **Stage progression is not enforced.** An agent can submit any stage value regardless of the current stage. For example, a field can go from `planted` directly to `harvested`. Enforcing a strict linear progression was considered unnecessary for the current use case.
- **Field status thresholds are fixed.** The at-risk thresholds (90 days since planting, 14 days without update, 21 days without update while growing) are hardcoded in `fieldStatus.js`. Making them configurable per field or crop type was out of scope.
- **No pagination.** All field and update lists are returned in full. This is acceptable for the expected data volume in a local or small-team deployment.
- **Supabase is used as a managed PostgreSQL host.** The database connection requires SSL for remote Supabase connections. The `db.js` connection pool disables SSL automatically when `DATABASE_URL` contains `localhost`, so local PostgreSQL instances work without any configuration change.
