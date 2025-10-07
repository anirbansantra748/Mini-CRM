# Mini CRM (Projects) — Option B (React + Express + MongoDB)

Live demo
- Frontend: https://mini-crm-1-85lu.onrender.com
- API: https://mini-crm-av8t.onrender.com
- API Health: https://mini-crm-av8t.onrender.com/api/health → `{ "ok": true }`

Credentials (if seeded locally) – you can also sign up live
- Admin: admin@demo.com / Admin@123
- Member: member@demo.com / Member@123

Important for the live demo
- The API must allow the frontend origin via CORS. Set on the API (Render Web Service) → Environment:
  - `CORS_ORIGIN = https://mini-crm-1-85lu.onrender.com`
- The frontend must point to the API via `VITE_API_URL`. Set on the Static Site (Render) → Environment:
  - `VITE_API_URL = https://mini-crm-av8t.onrender.com`
- After changing env vars, redeploy both services (clear build cache for the static site) to apply.

Stack
- Frontend: React + Vite + Tailwind CSS (shadcn-like components), React Query
- Backend: Express.js (Node.js, TypeScript)
- Database: MongoDB (Mongoose) — Atlas in production
- Auth: JWT (bcrypt password hashing)
- Validation: Zod (client shared; server mirrors schema)

Folder structure
- `shared/` (Zod schemas)
- `server/` (Express API)
- `client/` (React app)

Core features
- Auth & roles: JWT login; Admin vs Member
  - Admin: full CRUD + view audit
  - Member: can create and edit own or assigned projects; cannot delete; status-only update when assigned but not owner
- Projects CRUD
  - Fields: id, title, client, budget, status (LEAD | IN_PROGRESS | ON_HOLD | DONE), ownerId, members[], createdAt, updatedAt
  - Create/Edit modals, delete (admin only), detail page
  - Server + client validation
- List UX
  - Search title/client, status filter, pagination, updatedAt desc
  - Status badges w/ relative time; owner email visible
  - CSV export of filtered list
- Audit Log (admin only)
  - Records create/update/delete with JSON diff and timestamp
  - UI shows action badge, user email/role, project title, and compact diff (array deltas show +added/−removed)

API contract
- `POST /api/auth/signup` `{ email, password, role? }`
- `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `GET  /api/projects` `?q=&status=&page=1&size=10`
- `POST /api/projects` `{ title, client, budget, status }`
- `PATCH /api/projects/:id` `{ title?, client?, budget?, status? }`
- `PATCH /api/projects/:id/members` `{ memberIds: string[] }` (admin only)
- `DELETE /api/projects/:id` (admin only)
- `GET /api/audit?projectId=` (admin only)
- `GET /api/health`

Environment variables
- Server (Render Web Service)
  - `DATABASE_URL` = mongodb Atlas URI WITH DB name (e.g., `/mini-crm`)
  - `JWT_SECRET` = strong random string
  - `CORS_ORIGIN` = frontend origin (e.g., `https://mini-crm-1-85lu.onrender.com`)
  - `PORT` optional (Render injects one; server handles it)
- Client (Render Static Site)
  - `VITE_API_URL` = API base URL (e.g., `https://mini-crm-av8t.onrender.com`)

Local setup
1) Backend
   ```bash
   cd server
   cp .env.example .env
   # Set DATABASE_URL (local Mongo or Atlas), JWT_SECRET, CORS_ORIGIN=http://localhost:5173
   npm install
   npm run seed   # optional, seeds Admin/Member + sample projects
   npm run dev
   # Health: http://localhost:4000/api/health
   ```

2) Frontend
   ```bash
   cd ../client
   cp .env.example .env   # set VITE_API_URL=http://localhost:4000
   npm install
   npm run dev
   # Open http://localhost:5173
   ```

Deployment (Render)
- API (Web Service)
  - Root: `server/`
  - Build: `npm install && npm run build`
  - Start: `node dist/index.js`
  - Env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`
  - (Optional) seed once: If shell is available: `npm run seed`

- Frontend (Static Site)
  - Root: `client/`
  - Build: `npm install && npm run build`
  - Publish directory: `dist`
  - Env: `VITE_API_URL = https://mini-crm-av8t.onrender.com`

Trade-offs & notes
- CORS is single-origin by default; you can set multiple origins in `CORS_ORIGIN` (comma-separated) with a tiny code tweak if you want to allow both local and prod simultaneously.
- Server mirrors Zod logic for stability in production while client imports the shared schema for UI validation.
- Optimistic UI provided for project create/update.

What to improve next
- Tests for auth and role policy
- Searchable multi-select in Members picker
- Mini charts on Dashboard; server-side CSV export
- Dedicated Users service with display name support

---

## Submission checklist (per brief)
- Live App URL (Frontend): https://mini-crm-1-85lu.onrender.com
- Admin credentials + Member credentials: use signup live to create first Admin; or seed locally with provided script
- GitHub repo: https://github.com/anirbansantra748/Mini-CRM
- Short note (trade-offs): see “Trade-offs & notes”
- How to run tests: N/A (tests not included in this iteration)
