# Meeting Room Style Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the current separated frontend to closely match the original project UI while preserving the real API-driven behavior.

**Architecture:** Reuse the original page-level Tailwind structure and visual hierarchy, then adapt the JSX bindings to the current frontend's authenticated API state, backend field names, and admin-only statistics payload. Keep business logic in place and limit changes to presentation structure and light interaction wiring.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, lucide-react, motion, echarts-for-react

---

### Task 1: Restore Shared Shell

**Files:**
- Modify: `frontend/src/components/Layout.tsx`
- Modify: `frontend/src/components/Login.tsx`
- Modify: `frontend/src/index.css`

- [ ] Reapply the original sidebar, topbar, and login card visual language while keeping current auth props, busy state, error messages, and demo account shortcuts.
- [ ] Keep the global font/background identical to the original Tailwind setup.

### Task 2: Restore User-Facing Pages

**Files:**
- Modify: `frontend/src/pages/SearchRooms.tsx`
- Modify: `frontend/src/pages/Booking.tsx`
- Modify: `frontend/src/pages/MyBookings.tsx`

- [ ] Reuse the original search card layout, room cards, booking form spacing, and booking-list presentation.
- [ ] Preserve current data bindings such as `room.id`, `booking.bookingDate`, `approvalComment`, and cancel actions.

### Task 3: Restore Admin Pages

**Files:**
- Modify: `frontend/src/pages/admin/RoomManagement.tsx`
- Modify: `frontend/src/pages/admin/BookingManagement.tsx`
- Modify: `frontend/src/pages/admin/Statistics.tsx`

- [ ] Reapply the original table, card, and chart framing for admin pages.
- [ ] Keep the current create/update/delete room workflow and current statistics payload, even where the original mock version had less functionality.

### Task 4: Verify Presentation Build

**Files:**
- Verify: `frontend/package.json`

- [ ] Run `npm run build` in `frontend` to verify the restored JSX and imports compile cleanly.
- [ ] Review the diff for accidental behavior regressions outside the intended style restoration scope.
