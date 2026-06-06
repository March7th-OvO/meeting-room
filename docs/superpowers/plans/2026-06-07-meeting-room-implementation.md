# Meeting Room Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working React + FastAPI + SQLite meeting-room system with JWT auth, room management, booking workflows, admin approval/statistics, and a frontend fully switched off mock data.

**Architecture:** Split the current single Vite app into a `frontend/` app and a `backend/` FastAPI service in the same repository. Put durable business logic in the backend service/service layer, keep the frontend focused on UI and API state, and keep the database portable through SQLAlchemy, Alembic, and a `DATABASE_URL`-driven configuration.

**Tech Stack:** React 19, Vite, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy 2.x, Alembic, Pydantic, python-jose, passlib, pytest

---

## File Structure

- `frontend/`: existing Vite app moved here and adapted to call backend APIs
- `backend/app/main.py`: FastAPI application entrypoint
- `backend/app/api/`: auth, rooms, bookings, admin, statistics routers
- `backend/app/core/`: settings, security, dependencies, exception helpers
- `backend/app/db/`: engine, session, base
- `backend/app/models/`: ORM models
- `backend/app/repositories/`: persistence helpers
- `backend/app/schemas/`: request/response models
- `backend/app/services/`: booking, auth, room, statistics business logic
- `backend/alembic/`: Alembic migration environment and initial migration
- `backend/tests/`: API and service regression tests

## Task 1: Split Repository Layout

**Files:**
- Create: `frontend/`
- Move: `assets`, `src`, `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `.env.example`
- Modify: `.gitignore`, `README.md`

- [ ] Move the existing Vite application into `frontend/` and keep the repository root available for backend code.
- [ ] Update ignore/documentation files so frontend build artifacts and backend Python artifacts are both covered.
- [ ] Run `npm install` in `frontend/` and `npm run build` to verify the moved frontend still builds before API integration.

## Task 2: Create Backend Skeleton and Database Core

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/main.py`
- Create: `backend/app/core/config.py`
- Create: `backend/app/db/base.py`
- Create: `backend/app/db/session.py`
- Create: `backend/app/models/*.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/versions/0001_initial.py`
- Test: `backend/tests/test_health_and_seed.py`

- [ ] Write a failing backend smoke test that expects the app to start and expose seeded loginable data.
- [ ] Create the FastAPI app, settings, SQLAlchemy engine/session, ORM models, and Alembic initial migration.
- [ ] Add a startup/bootstrap path that creates tables for local dev and seeds the initial users/rooms data set.
- [ ] Run the backend smoke test and fix issues until it passes.

## Task 3: Implement Authentication and Authorization

**Files:**
- Create: `backend/app/core/security.py`
- Create: `backend/app/core/deps.py`
- Create: `backend/app/schemas/auth.py`
- Create: `backend/app/repositories/users.py`
- Create: `backend/app/services/auth.py`
- Create: `backend/app/api/auth.py`
- Test: `backend/tests/test_auth.py`

- [ ] Write failing tests for login success, login failure, `/auth/me`, and admin dependency protection.
- [ ] Implement password hashing, JWT creation/parsing, current-user resolution, and admin-only dependency checks.
- [ ] Seed deterministic demo accounts with real password hashes.
- [ ] Run `pytest backend/tests/test_auth.py -v` and keep iterating until all tests pass.

## Task 4: Implement Rooms, Bookings, Approval, and Statistics APIs

**Files:**
- Create: `backend/app/schemas/rooms.py`
- Create: `backend/app/schemas/bookings.py`
- Create: `backend/app/schemas/statistics.py`
- Create: `backend/app/repositories/rooms.py`
- Create: `backend/app/repositories/bookings.py`
- Create: `backend/app/services/rooms.py`
- Create: `backend/app/services/bookings.py`
- Create: `backend/app/services/statistics.py`
- Create: `backend/app/api/rooms.py`
- Create: `backend/app/api/bookings.py`
- Create: `backend/app/api/admin.py`
- Test: `backend/tests/test_rooms.py`
- Test: `backend/tests/test_bookings.py`
- Test: `backend/tests/test_statistics.py`

- [ ] Write failing tests for room listing, room CRUD, booking creation, conflict rejection, cancel flow, admin approval flow, and statistics payloads.
- [ ] Implement repository and service logic with pending/approved conflict blocking and maintenance-room rejection.
- [ ] Implement all public/admin routers and register them in the FastAPI app.
- [ ] Run the backend test suite and refactor only after everything is green.

## Task 5: Wire the Frontend to Real APIs

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/lib/auth.ts`
- Create: `frontend/src/hooks/*.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Login.tsx`
- Modify: `frontend/src/components/Layout.tsx`
- Modify: `frontend/src/pages/*.tsx`
- Modify: `frontend/src/pages/admin/*.tsx`
- Modify: `frontend/src/types.ts`
- Delete/Retire: `frontend/src/data.ts`

- [ ] Replace mock-driven app state with authenticated API calls and token persistence.
- [ ] Update login to accept username/password and use seeded demo credentials.
- [ ] Implement room create/update/delete UI, booking cancel actions, admin approval actions, and statistics fetching against the backend.
- [ ] Run `npm run build` in `frontend/` and resolve all type/build errors.

## Task 6: Final Integration, Config, and Verification

**Files:**
- Create: `backend/.env.example`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-06-07-meeting-room-separation-design.md` if implementation decisions need sync

- [ ] Add backend/frontend run instructions, env examples, and MySQL switch notes to the README.
- [ ] Run the full backend test suite and frontend production build as the final verification gate.
- [ ] Start the backend locally once and confirm the seeded accounts, room list, and core routes respond as expected.
- [ ] Commit the implementation in logical chunks after verification.

## Self-Review

- Spec coverage: repository split, FastAPI backend, SQLite portability, JWT auth, user/admin roles, booking approval rules, statistics, frontend API migration, and MySQL switch notes are all covered by Tasks 1-6.
- Placeholder scan: no TODO/TBD placeholders remain in the task list.
- Type consistency: router and service names are kept aligned around `auth`, `rooms`, `bookings`, `admin`, and `statistics`.
