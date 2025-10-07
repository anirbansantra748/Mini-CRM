# Mini CRM (Projects) — Option B Stack

A tiny Projects CRM with auth, roles, CRUD, filters, audit log, optimistic UI, shared Zod schemas, and CSV export.

Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Express.js (Node.js, TypeScript)
- Database: MongoDB (Mongoose)
- Auth: JWT
- Shared: Zod schemas used by client and server

Folder structure
- shared/ (Zod schemas)
- server/ (Express API)
- client/ (React app)

Env Vars
- Server: DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGIN
- Client: VITE_API_URL

Credentials (seeded)
- Admin: admin@demo.com / Admin@123
- Member: member@demo.com / Member@123

Local setup
1) Backend
   - cd server
   - Copy .env.example to .env and set: DATABASE_URL, JWT_SECRET
   - Install deps: npm install
   - Seed demo data: npm run seed
   - Start API: npm run dev
   - Health: GET http://localhost:4000/api/health

2) Frontend
   - cd ../client
   - Copy .env.example to .env (ensure VITE_API_URL matches server)
   - Install deps: npm install
   - Start dev server: npm run dev
   - Open http://localhost:5173

Deployment
- Backend (Render)
  - Create new Web Service from server/ repo path
  - Build Command: npm install && npm run build
  - Start Command: node dist/index.js
  - Env vars: DATABASE_URL, JWT_SECRET, PORT (optional), CORS_ORIGIN (set to frontend URL)
  - Run seed once: npm run seed (via shell or separate Job)

- Frontend (Netlify or Vercel)
  - Build Command: npm run build
  - Publish Directory: dist
  - Env var: VITE_API_URL = <your API URL>

API Contract
- POST /api/auth/signup {email, password, role?}
- POST /api/auth/login {email, password} -> {token, user}
- GET /api/projects ?q=&status=&page=1&size=10
- POST /api/projects {title, client, budget, status}
- PATCH /api/projects/:id {title?, client?, budget?, status?}
- DELETE /api/projects/:id
- GET /api/audit?projectId= (admin only)

Notes & Trade-offs
- Simple role middleware; member cannot delete; can edit only owned projects.
- Optimistic UI for create/update (React Query).
- Shared Zod schemas (client+server) for validation and type safety.
- CSV export on client for filtered results.
- Owner shown as ownerId for MVP; could join user email in future.

What to improve next
- Add tests (Vitest/Jest) around auth and project policy checks.
- Enhance UX with skeletons/toasts and error boundaries.
- Public API integration for random client names.
- Server-side CSV export + download token.
- Better owner display via aggregation or additional user cache.
