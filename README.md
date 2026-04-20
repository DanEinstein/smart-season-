<div align="center">
  <h1>🌱 SmartSeason</h1>
  <p><strong>A full-stack agricultural field management system tailored for coordinators and field agents.</strong></p>
</div>

<br />

## 🚀 Overview

SmartSeason is an agricultural tracking platform designed to optimize field management. Administrators (Coordinators) can register fields, assign agents, and monitor field status globally. Field Agents are provided a streamlined dashboard to report lifecycle stages and add qualitative data logs for their assigned sectors.

### Features
- 🔐 **Role-Based Access Control:** Secure authentication via Clerk. Differentiated dashboards for Admins and Agents.
- 🌾 **Field Assignment:** Full CRUD for agricultural sectors including crop types and assignment tracking.
- 📈 **Dynamic Status Lifecycle:** Automatically flags fields as **`Active`**, **`At Risk`**, or **`Completed`** based on plant cycles and reporting delays.
- 📊 **Responsive Dashboards:** Real-time metrics, yield summaries, and comprehensive activity monitors tracking agents across regions.

## 🛠️ Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Clerk

## 📦 Running Locally

### 1. Backend Setup
Navigate to the `backend` directory, install dependencies, and start the development server.
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
Navigate to the `frontend` directory, install dependencies, and launch Vite.
```bash
cd frontend
npm install
npm run dev
```

### 3. Database Configuration
Ensure `.env` files are configured inside both `frontend/` and `backend/` directories.

**`backend/.env`**
```env
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=postgresql://user:password@host:port/postgres
FRONTEND_URL=http://localhost:5173
```

**`frontend/.env`**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
VITE_ADMIN_PASSWORD=your_admin_gate_password
```

### 4. Database Seeding (Optional)
Once you have created a user via Clerk login on the frontend, you can populate the database with mock field setups:
```bash
cd backend
node seed.js
```

## ☁️ Deployment (Vercel)

This repository is structured as a monorepo containing both the React frontend and the Express backend. It includes a custom `vercel.json`.

1. Import the project into your Vercel Dashboard.
2. The `vercel.json` provides standard serverless routing, bundling the frontend under `frontend/dist` using Vite and exposing the backend functions logically via `/api`.
3. Set the identical environment variables on the Vercel project settings dashboard.

## ⚙️ Core Logic Reference

### Stage Progression
`Planted` → `Growing` → `Ready` → `Harvested`

### Computed Field Status
SmartSeason flags conditions seamlessly based on timestamp variations:
| Status | Trigger Condition |
|--------|------------------|
| `completed`| Current stage equals `harvested`. |
| `at-risk` | Planted > 90 days ago *AND* no agent update filed in the last 14 days. |
| `at-risk` | Stage is `growing` *AND* no agent update filed in the last 21 days. |
| `active` | All other monitored cases. |
