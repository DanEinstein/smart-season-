<div align="center">
  <h1>🌱 SmartSeason</h1>
  <p><strong>A full-stack agricultural field management system for coordinators and field agents.</strong></p>
</div>

## Overview

SmartSeason is an agricultural tracking platform designed to optimize field management. Administrators (Coordinators) can register fields, assign agents, and monitor field status. Field Agents have a dedicated dashboard to report lifecycle stages and log qualitative data for their assigned sectors.

### Features
- 🔐 **Role-Based Access Control** — Secure authentication via Clerk with differentiated dashboards for Admins and Agents.
- 🌾 **Field Assignment** — Full CRUD for agricultural sectors including crop types and agent assignment.
- 📈 **Dynamic Status Lifecycle** — Automatically flags fields as `Active`, `At Risk`, or `Completed` based on plant cycles and reporting delays.
- 📊 **Responsive Dashboards** — Real-time metrics, yield summaries, and activity monitors.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Clerk

---

## Local Setup

### Prerequisites

- Node.js v18+
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
2. From your Clerk dashboard, copy:
   - **Publishable Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)

---

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once the project is ready, go to **Project Settings → Database → Connection string** and copy the **URI** (use the `Transaction` mode URI on port `6543` if using a pooler, or the direct URI on port `5432`).
3. Open the **SQL Editor** in your Supabase dashboard, paste the contents of `schema.sql` from the root of this project, and run it to create the required tables.

---

### 4. Configure environment variables

Create a `.env` file inside the `backend/` directory:

```env
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=postgresql://user:password@host:port/postgres
FRONTEND_URL=http://localhost:5173
ADMIN_PASSWORD=your_chosen_admin_password
```

Create a `.env` file inside the `frontend/` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
VITE_ADMIN_PASSWORD=your_chosen_admin_password
```

> `ADMIN_PASSWORD` and `VITE_ADMIN_PASSWORD` must be the same value. This password is used to elevate a user's role to admin through the Admin Gate screen.

---

### 5. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a separate terminal)
cd frontend
npm install
```

---

### 6. Run the project

Start the backend and frontend in separate terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
```

```bash
# Terminal 2 — Frontend
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

---

### 7. Create your first admin user

1. Open `http://localhost:5173` and sign up via the Clerk login screen.
2. Once logged in, navigate to `http://localhost:5173/admin-gate`.
3. Enter the `ADMIN_PASSWORD` you set in your `.env` files. This elevates your account to the `admin` role in the database.
4. You will be redirected to the Admin Dashboard.

---

### 8. Seed the database (optional)

After creating at least one user, you can populate the database with sample fields:

```bash
cd backend
node seed.js
```

This inserts mock fields and field updates using your existing users. It will not create new users.

---

## Core Logic Reference

### Stage Progression

`Planted` → `Growing` → `Ready` → `Harvested`

### Computed Field Status

| Status | Trigger Condition |
|--------|------------------|
| `completed` | Current stage equals `harvested`. |
| `at-risk` | Planted > 90 days ago AND no agent update in the last 14 days. |
| `at-risk` | Stage is `growing` AND no agent update in the last 21 days. |
| `active` | All other cases. |
