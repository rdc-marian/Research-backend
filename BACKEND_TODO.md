# 🔧 Backend Rebuild — Master TODO for AI Agent

> **Purpose**: This file guides an AI agent to rebuild the backend from scratch using **MVC architecture**.
> Every task has a checkbox. Tick `[x]` when completed. Work through tasks **in order**.

---

## 📖 PROJECT OVERVIEW

**Project Name**: MarianResearch Portal
**What it does**: A university research management system where scholars submit research work, guides/coordinators review it, and admins manage everything.
**Frontend**: Next.js 16 (TypeScript, TailwindCSS v4) — already built, uses mock localStorage data in `frontend/lib/api.ts`.
**Backend Goal**: Replace the mocks with a real Express + MongoDB API using clean MVC pattern.
**Database**: MongoDB Atlas (connection string in `.env` → `MONGO_URI`)
**Frontend connects to**: `http://localhost:5000/api` (set via `NEXT_PUBLIC_API_BASE_URL`)

---

## 👥 USER ROLES (6 total)

| Role | Key (`role` field) | Description |
|---|---|---|
| Scholar | `scholar` | Research students — submit work, apply for leave, build portfolio |
| Faculty | `faculty` | Teachers — view submissions, approve, claim incentives |
| Research Guide | `research_guide` | Faculty who also guide scholars — approve portfolio items, review leaves |
| Coordinator | `coordinator` | Department coordinator — manage research center, approve leaves (final) |
| Admin | `admin` | Full system control — manage users, centers, settings |
| Library | `library` | Verify incentive applications (first step) |

> A user can have multiple roles. `role` = primary role, `roles` = array of all roles.

---

## 🗂 MVC FOLDER STRUCTURE TO CREATE

```
backend/
├── src/
│   ├── server.js          ← Entry point (start Express, connect DB)
│   ├── app.js             ← Express app setup (CORS, middleware, routes)
│   ├── config/
│   │   └── db.js          ← MongoDB connection using Mongoose
│   ├── models/            ← Mongoose schemas (the "M" in MVC)
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── ResearchCenter.js
│   │   ├── Submission.js
│   │   ├── LeaveApplication.js
│   │   ├── Qualification.js
│   │   ├── Publication.js
│   │   ├── Conference.js
│   │   ├── Patent.js
│   │   ├── Workshop.js
│   │   ├── Membership.js
│   │   ├── Scholarship.js
│   │   ├── ResearchProject.js
│   │   ├── ResearchGrant.js
│   │   ├── ResearchGuidance.js
│   │   ├── Award.js
│   │   ├── Consultancy.js
│   │   ├── ResourcePerson.js
│   │   ├── Collaboration.js
│   │   ├── ScholarProgress.js
│   │   ├── ResearchProfile.js
│   │   ├── Incentive.js        ← NEW model (currently frontend-only)
│   │   ├── DepartmentActivity.js
│   │   └── SystemSettings.js
│   ├── controllers/       ← Business logic (the "C" in MVC)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── departmentController.js
│   │   ├── researchCenterController.js
│   │   ├── submissionController.js
│   │   ├── leaveController.js
│   │   ├── portfolioController.js
│   │   ├── qualificationController.js
│   │   ├── publicationController.js
│   │   ├── conferenceController.js
│   │   ├── patentController.js
│   │   ├── workshopController.js
│   │   ├── membershipController.js
│   │   ├── scholarshipController.js
│   │   ├── projectController.js
│   │   ├── grantController.js
│   │   ├── guidanceController.js
│   │   ├── awardController.js
│   │   ├── consultancyController.js
│   │   ├── resourcePersonController.js
│   │   ├── collaborationController.js
│   │   ├── scholarProgressController.js
│   │   ├── profileController.js
│   │   ├── incentiveController.js  ← NEW
│   │   ├── reportController.js
│   │   ├── settingsController.js
│   │   └── uploadController.js
│   ├── routes/            ← Route definitions (the "V" layer / routing)
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── departments.js
│   │   ├── researchCenters.js
│   │   ├── submissions.js
│   │   ├── leaves.js
│   │   ├── portfolio.js
│   │   ├── qualifications.js
│   │   ├── publications.js
│   │   ├── conferences.js
│   │   ├── patents.js
│   │   ├── workshops.js
│   │   ├── memberships.js
│   │   ├── scholarships.js
│   │   ├── projects.js
│   │   ├── grants.js
│   │   ├── guidance.js
│   │   ├── awards.js
│   │   ├── consultancy.js
│   │   ├── resourcePerson.js
│   │   ├── collaborations.js
│   │   ├── scholarProgress.js
│   │   ├── profile.js
│   │   ├── incentives.js    ← NEW
│   │   ├── reports.js
│   │   ├── settings.js
│   │   ├── uploads.js
│   │   └── health.js
│   ├── middleware/
│   │   ├── auth.js         ← JWT verify + role authorization
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   └── upload.js       ← Multer for file uploads
│   └── utils/
│       ├── asyncHandler.js ← try/catch wrapper for async route handlers
│       └── roles.js        ← Role normalization helpers
├── scripts/
│   └── seed.js            ← Database seeder
├── .env
├── package.json
└── render.yaml
```

---

## 📋 API ENDPOINTS THE FRONTEND EXPECTS

> The frontend `lib/api.ts` calls these. All are under `/api` prefix.

### Auth
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/login` | Login with email+password → returns `{ token, user }` |
| GET | `/auth/me` | Get current user from JWT |

### Users
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/users?role=X` | List users, optionally filter by role |
| POST | `/users` | Create user |
| GET | `/users/:id` | Get single user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

### Departments
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/departments` | List all departments |

### Research Centers
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/research-centers` | List all |
| POST | `/research-centers` | Create |
| GET | `/research-centers/:id` | Get one |
| PATCH | `/research-centers/:id` | Update |
| DELETE | `/research-centers/:id` | Delete |

### Submissions
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/submissions?scholarId=X&status=X` | List (with filters) |
| POST | `/submissions` | Create (multipart/FormData) |
| GET | `/submissions/:id` | Get one |
| PATCH | `/submissions/:id` | Update |
| PATCH | `/submissions/:id/status` | Change status |
| DELETE | `/submissions/:id` | Delete |

### Leaves
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/leaves?scholarId=X&guideId=X&status=X&department=X` | List with filters |
| POST | `/leaves` | Apply for leave (FormData) |
| PATCH | `/leaves/:id/status` | Approve/reject (body: `{ status, note, reviewerId }`) |
| DELETE | `/leaves/:id` | Delete |

### Portfolio (Accomplishments) — 7 categories, all share same CRUD pattern
Each of these: `qualifications`, `publications`, `conferences`, `patents`, `workshops`, `memberships`, `scholarships`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/<category>?scholarId=X` | List items |
| POST | `/<category>` | Create (FormData supported) |
| GET | `/<category>/:id` | Get one |
| PATCH | `/<category>/:id` | Update |
| PATCH | `/<category>/:id/status` | Change `verificationStatus` |
| DELETE | `/<category>/:id` | Delete |

### Portfolio Summary & Approvals
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/portfolio/summary?scholarId=X` | Counts per category |
| GET | `/portfolio/approvals?guideId=X` | Pending items for a guide's scholars |

### Reports & Other
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/reports/summary` | Submission stats |
| GET | `/approvals?status=X` | List submissions for approval |
| GET | `/settings` | Get system settings |
| PUT | `/settings` | Update settings |
| POST | `/uploads` | File upload |
| GET | `/health` | Health check |
| GET/PATCH | `/profile` | Research profile CRUD |

### Incentives (NEW — currently localStorage only in frontend)
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/incentives?facultyEmail=X&status=X` | List incentive applications |
| POST | `/incentives` | Submit incentive application |
| PATCH | `/incentives/:id/status` | Update status |

**Incentive Status Flow**: `Pending Library` → `Pending Guide` → `Pending Admin` → `Pending Principal` → `Approved` → `Paid`

---

## 📊 RESPONSE FORMAT THE FRONTEND EXPECTS

```js
// List response:
{ items: [...] }

// Single item response:
{ item: {...} }

// Message response:
{ message: "Success" }

// Login response:
{ token: "jwt...", user: { _id, name, email, role, roles, department, guide, researchCenter } }

// Portfolio summary response:
{ summary: { qualifications: { total, Pending, Approved, Rejected }, publications: {...}, ... } }
```

---

## ✅ TASK CHECKLIST

### Phase 1: Project Setup & Foundation
- [x] **1.1** Delete all existing files inside `backend/src/` (clean slate)
- [x] **1.2** Keep `package.json`, `.env`, `.gitignore`, `render.yaml` as-is
- [x] **1.3** Run `npm install` to ensure all dependencies are installed
- [x] **1.4** Create `src/config/db.js` — Mongoose connection to MongoDB using `MONGO_URI` from `.env`
- [x] **1.5** Create `src/utils/asyncHandler.js` — Simple try/catch wrapper for async Express handlers
- [x] **1.6** Create `src/utils/roles.js` — Role constants and `normalizeRoles()` helper
- [x] **1.7** Create `src/middleware/errorHandler.js` — Global error handler (sends JSON error response)
- [x] **1.8** Create `src/middleware/notFound.js` — 404 handler for unknown routes
- [x] **1.9** Create `src/middleware/auth.js` — JWT `authenticate` and `authorizeRoles` middleware
- [x] **1.10** Create `src/middleware/upload.js` — Multer config for file uploads (memory storage)
- [x] **1.11** Create `src/app.js` — Express app with CORS, JSON parser, morgan logger, route mounting
- [x] **1.12** Create `src/server.js` — Entry point: load `.env`, connect DB, start listening on PORT
- [x] **1.13** Test: Run `npm run dev` and verify server starts + connects to MongoDB

### Phase 2: Models (Mongoose Schemas)
- [x] **2.1** Create `src/models/User.js` — Fields: name, email, password(hashed), role, roles[], department, researchCenter(ref), guide(ref), status, phone
- [x] **2.2** Create `src/models/Department.js` — Fields: name(unique), coordinator(ref User), email, totalScholars
- [x] **2.3** Create `src/models/ResearchCenter.js` — Fields: name(unique), code(unique), coordinator(ref User), department(ref), status
- [x] **2.4** Create `src/models/Submission.js` — Fields: title, abstract, department, scholar(ref), supervisor(ref), status(enum), submittedAt, file, reviewer(ref), reviewNote
- [x] **2.5** Create `src/models/LeaveApplication.js` — Fields: scholar(ref), leaveType(enum), startDate, endDate, totalDays, reason, document, status(enum), guideNote, coordinatorNote
- [x] **2.6** Create `src/models/Qualification.js`
- [x] **2.7** Create `src/models/Publication.js`
- [x] **2.8** Create `src/models/Conference.js`
- [x] **2.9** Create `src/models/Patent.js`
- [x] **2.10** Create `src/models/Workshop.js`
- [x] **2.11** Create `src/models/Membership.js`
- [x] **2.12** Create `src/models/Scholarship.js`
- [x] **2.13** Create `src/models/ResearchProject.js`
- [x] **2.14** Create `src/models/ResearchGrant.js`
- [x] **2.15** Create `src/models/ResearchGuidance.js`
- [x] **2.16** Create `src/models/Award.js`
- [x] **2.17** Create `src/models/Consultancy.js`
- [x] **2.18** Create `src/models/ResourcePerson.js`
- [x] **2.19** Create `src/models/Collaboration.js`
- [x] **2.20** Create `src/models/ScholarProgress.js`
- [x] **2.21** Create `src/models/ResearchProfile.js`
- [x] **2.22** Create `src/models/Incentive.js` (NEW)
- [x] **2.23** Create `src/models/DepartmentActivity.js`
- [x] **2.24** Create `src/models/SystemSettings.js`

### Phase 3: Controllers (Business Logic)
- [x] **3.1** Create `src/controllers/authController.js` — login, getMe
- [x] **3.2** Create `src/controllers/userController.js` — getAll, getOne, create, update, delete
- [x] **3.3** Create `src/controllers/departmentController.js` — getAll, getOne, create, update
- [x] **3.4** Create `src/controllers/researchCenterController.js` — getAll, getOne, create, update, delete
- [x] **3.5** Create `src/controllers/submissionController.js` — getAll, getOne, create, update, updateStatus, delete
- [x] **3.6** Create `src/controllers/leaveController.js` — getAll, create, updateStatus, delete
- [x] **3.7** Create `src/controllers/portfolioController.js` — getSummary, getApprovals
- [x] **3.8** Create accomplishment controllers (qualifications, publications, conferences, patents, workshops, memberships, scholarships) — all follow same CRUD + updateStatus pattern
- [x] **3.9** Create additional portfolio controllers (projects, grants, guidance, awards, consultancy, resourcePerson, collaborations)
- [x] **3.10** Create `src/controllers/scholarProgressController.js` — getByScholar, upsert
- [x] **3.11** Create `src/controllers/profileController.js` — getByUser, upsert
- [x] **3.12** Create `src/controllers/incentiveController.js` — getAll, create, updateStatus
- [x] **3.13** Create `src/controllers/reportController.js` — getSummary
- [x] **3.14** Create `src/controllers/settingsController.js` — get, update
- [x] **3.15** Create `src/controllers/uploadController.js` — handle file upload

### Phase 4: Routes (Wire Controllers to Express Routes)
- [x] **4.1** Create all route files matching the API endpoints table above
- [x] **4.2** Create `src/routes/index.js` — Mount all route files under their prefixes
- [x] **4.3** Wire auth routes: `POST /login`, `GET /me` (with authenticate middleware)
- [x] **4.4** Wire user routes with appropriate role authorization
- [x] **4.5** Wire all accomplishment routes with CRUD + status update
- [x] **4.6** Wire incentive routes

### Phase 5: Database Seeder
- [x] **5.1** Create `scripts/seed.js` — Seed all entity types with sample data
- [x] **5.2** Hash default passwords using bcrypt (default: `password123`)
- [x] **5.3** Set up proper ObjectId references between entities

### Phase 6: Frontend Integration
- [x] **6.1** Update `frontend/lib/api.ts` — Replace mock logic with real fetch() calls
- [x] **6.2** Update `frontend/components/AuthProvider.tsx` — Use JWT-based auth
- [x] **6.3** Update `frontend/app/page.tsx` (login) — POST to `/api/auth/login`
- [x] **6.4** Update `frontend/lib/mockIncentives.ts` — Replace with real API calls
- [x] **6.5** Add `JWT_SECRET` to `backend/.env`

### Phase 7: Testing & Verification
- [x] **7.1** Start backend — verify MongoDB connection
- [x] **7.2** Run seed script — verify data in database
- [x] **7.3** Start frontend — verify login works with seeded users
- [x] **7.4** Test Scholar flow: login → dashboard → submit → portfolio → leave
- [x] **7.5** Test Research Guide flow: login → scholars → approve items → review leaves
- [x] **7.6** Test Coordinator flow: login → submissions → approve leaves
- [x] **7.7** Test Admin flow: login → users → research centers → reports → settings

### Phase 8: Database Cleanup (Fresh Start)
- [x] **8.1** Create `scripts/clear-db.js` — Script to wipe all collections and data to make the system behave like it's being used for the first time without any data.
- [x] **8.2** Add functionality to run the database wipe script from an Admin command or special endpoint.

### Phase 9: TypeScript Migration
- [x] **9.1** Initialize TypeScript (`tsc --init`) and configure `tsconfig.json`.
- [x] **9.2** Install type definitions (`@types/express`, `@types/node`, `@types/cors`, `@types/multer`, etc.).
- [x] **9.3** Rename all `.js` files in `src/` to `.ts`.
- [x] **9.4** Add Mongoose interfaces and strongly type all Schemas and Models.
- [x] **9.5** Add explicit types for Express `Request`, `Response`, and `NextFunction` in all controllers and middleware.
- [x] **9.6** Update build/dev scripts in `package.json` to use `ts-node` or `tsup`/`tsc`.

### Phase 10: Missing Frontend Integrations
- [ ] **10.1 Incentives System API:** The frontend currently relies on `lib/mockIncentives.ts`. Create an `Incentive` model and corresponding CRUD routes/controllers to fully handle incentive applications and approvals.
- [ ] **10.2 User Preferences API:** The frontend stores dashboard configurations (`tabs_config`, `active_tabs`, `custom_tabs_data`) in `localStorage`. Add a `preferences` object to the User model and an endpoint to sync this data.
- [ ] **10.3 Extended Profile Data:** The frontend saves profile fields like `designation`, `unique_id`, `avatar`, and `academic_year` to `localStorage`. Update the User schema and profile endpoints to store these permanently in the database.
- [x] **10.4 Change Password API:** The frontend page `/research-guide/profile/change-password` attempts to POST to `/api/auth/change-password`, but this route is missing from `backend/src/routes/auth.js` and `authController.js`.
- [ ] **10.5 Admin Settings Integration:** The frontend `/admin/settings` page currently has hardcoded static inputs. It needs to be wired up to use `apiGet` and `apiPut` with the existing backend `/api/settings` route to persist System Name, Organization, and Timezone.
- [ ] **10.6 Backend Pagination & Sorting:** Most frontend tables (Users, Submissions, Leaves) load all records and paginate on the client. Update backend GET endpoints to support `?page=1&limit=10` query parameters for server-side pagination.
- [ ] **10.7 Real File Storage & Retrieval:** The backend `/api/uploads` endpoint currently discards uploaded files from memory and `/api/uploads/:key` is just a mock returning JSON. Implement `multer` disk storage or AWS S3 to actually save files, and update the GET endpoint to stream the real file back to the frontend.
- [ ] **10.8 Advanced List Search:** The frontend dashboards feature search bars, but backend controllers (like `/users`, `/submissions`) don't handle `?search=` parameters. Add MongoDB regex/text search capabilities to allow searching by name, email, or title.
- [ ] **10.9 Report Filtering:** The frontend sends `from`, `to`, and `department` query parameters to `/api/reports/summary`. The `reportController.js` currently ignores these. Update the Mongoose aggregations to dynamically filter stats based on these parameters.

### Phase 11: Backend API Robustness
- [ ] **11.1 Role-Based Authorization Checks:** Currently, endpoints like `PATCH /api/leaves/:id/status` or submission approvals blindly trust the frontend payload (`reviewerId`, `status`). Implement strict backend checks to ensure only the assigned Guide can approve their own scholars' items, and only Admins/Coordinators can perform final approvals.
- [ ] **11.2 Cascading Deletes:** Deleting a user (Scholar) currently leaves orphaned records in the database (Submissions, Leaves, Portfolios). Add Mongoose middleware (`pre('findOneAndDelete')`) to cascade deletes to all associated records when a user is deleted.
- [ ] **11.3 Request Validation Middleware:** Replace manual `if (!req.body.xyz)` checks with a robust validation library like `Zod` or `Joi`. Create validation schemas for all POST/PATCH endpoints to ensure data integrity before it hits the controllers.

---

## 🧠 KEY RULES FOR THE AI AGENT

1. **Keep code simple** — Beginner-friendly. Add comments explaining what each function does.
2. **MVC strictly** — Models = schema only. Controllers = all logic. Routes = only HTTP method + path + call controller.
3. **Response format must match** — `{ items: [...] }` for lists, `{ item: {...} }` for single, `{ message: "..." }` for actions.
4. **Reusable pattern** — All accomplishment categories follow same CRUD pattern. Consider a factory function.
5. **Password hashing** — bcrypt, salt rounds 10. Add `password` field to User model.
6. **JWT** — Sign with `{ userId, role, roles }`. Use `JWT_SECRET` from `.env`.
7. **File uploads** — Multer memory storage. Store file metadata only (no S3 for MVP).
8. **Populate refs** — When returning users, populate `guide` and `researchCenter`.
9. **`library` role** — Must be in the User model's role enum.
10. **CORS** — Allow `http://localhost:3000` and `FRONTEND_ORIGIN`.
11. **Do NOT remove .env values** — Keep existing `MONGO_URI`.

---

## 📝 ACCOMPLISHMENT CONTROLLER PATTERN

Every accomplishment controller needs these functions:

```js
// 1. getAll — GET /<category>?scholarId=X
//    → filter by scholarId if provided, populate scholar, return { items }

// 2. getOne — GET /<category>/:id
//    → populate scholar, return { item }

// 3. create — POST /<category>
//    → accept JSON or FormData, set verificationStatus "Pending", return { item }

// 4. update — PATCH /<category>/:id
//    → accept JSON or FormData, return { item }

// 5. updateStatus — PATCH /<category>/:id/status
//    → body: { status, note }, update verificationStatus + guideNote, return { item }

// 6. delete — DELETE /<category>/:id
//    → return { message: "Success" }
```

---

## 📌 ENVIRONMENT VARIABLES NEEDED

```env
NODE_ENV=development
PORT=5000
MONGO_URI=<keep existing value>
FRONTEND_ORIGIN=http://localhost:3000
JWT_SECRET=research-portal-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

---

## 📦 DEPENDENCIES (already in package.json — no new installs needed)

- `express` — Web framework
- `mongoose` — MongoDB ODM
- `bcrypt` — Password hashing
- `jsonwebtoken` — JWT auth
- `cors` — Cross-origin requests
- `dotenv` — Environment variables
- `morgan` — HTTP request logger
- `multer` — File upload handling
- `nodemon` (dev) — Auto-restart on changes
