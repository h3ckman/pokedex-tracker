# Authentication & Role-Based Access Control

This document describes how authentication and authorization work in the application. It covers the data model, request flow, role hierarchy, code layout, and how to extend the system safely.

## Overview

The application uses a **custom email/password auth system** with **DB-backed sessions** referenced by a **signed JWT cookie**. There is no external identity provider. Authorization is **role-based** with four hierarchical roles.

| Component         | Choice                                 | Why                                                  |
| ----------------- | -------------------------------------- | ---------------------------------------------------- |
| Strategy          | Email + password                       | Single-tenant enterprise app; no SSO requirement yet |
| Password hashing  | bcrypt, cost 12                        | Standard, sufficient for the threat model            |
| Session transport | Signed JWT in HTTP-only cookie         | Edge-verifiable in `proxy.ts` without DB calls       |
| Session storage   | Prisma `Session` table                 | Server-side revocation, expiry, audit trail          |
| Route protection  | `proxy.ts` (Next 16) + per-page guards | Edge does signature check; pages do DB-backed checks |

## Roles

Roles form a strict hierarchy — higher ranks include all lower-rank capabilities.

| Role           | Rank | Can do                                                                   |
| -------------- | ---- | ------------------------------------------------------------------------ |
| `VIEWER`       | 0    | Read everything                                                          |
| `TECHNICIAN`   | 1    | + Create work orders                                                     |
| `SITE_MANAGER` | 2    | + Adjust setpoints, force defrost, override controller, create locations |
| `ADMIN`        | 3    | + `/settings`, manage users, view audit log                              |

The rank table lives at [lib/auth/can.ts:3](../lib/auth/can.ts#L3). The pure check function `can(userRole, requiredRole)` returns `true` iff the user's rank ≥ the required rank.

## Data model

Three tables in [prisma/schema.prisma](../prisma/schema.prisma):

```prisma
model User {
  id           String     @id @default(cuid())
  email        String     @unique
  name         String
  passwordHash String
  role         Role       @default(VIEWER)
  active       Boolean    @default(true)
  // ...
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  // ...
}

model AuditLog {
  id        Int      @id @default(autoincrement())
  action    String   // "LOGIN" | "LOGOUT" | "ROLE_CHANGE" | ...
  detail    String?  // JSON string
  userId    String
  createdAt DateTime @default(now())
}
```

Notes:

- `User.active = false` immediately invalidates the user; `getSession()` returns null for inactive users even if their session row hasn't been deleted.
- Sessions cascade on user delete. Deactivating a user via [lib/actions/users.ts](../lib/actions/users.ts) also wipes their sessions.
- `AuditLog.detail` is a free-form JSON string. Schema is action-specific; see [Audit events](#audit-events) below.

## Session lifecycle

### Creation

1. User submits credentials to `loginAction` ([lib/actions/auth.ts](../lib/actions/auth.ts)).
2. Action validates with Zod, looks up user by email, verifies password with bcrypt.
3. `createSession(userId)` ([lib/auth/session.ts](../lib/auth/session.ts)):
   - Inserts a `Session` row with `expiresAt = now + 7 days`.
   - Signs a JWT carrying `{ sid: session.id }` with `AUTH_SECRET` (HS256).
   - Sets the `session` cookie: `HttpOnly`, `Secure` in production, `SameSite=lax`, expires with the session.
4. `logAudit(userId, "LOGIN")` records the event.
5. Action `redirect(...)` to the `next` query param (sanitized to start with `/`) or `/`.

### Verification

There are two distinct verification paths:

**Edge (proxy.ts)** — fast, runs on every request:

- Reads the `session` cookie.
- Verifies JWT signature with `jose.jwtVerify`.
- Cannot hit the database. Only knows: "the cookie is signed by us and not expired by JWT exp."
- A valid signature here does **not** prove the session row still exists.

**Server components & actions (`getSession()`)** — DB-backed:

- Verifies signature, then loads the `Session` row (joined with `User`).
- Returns `null` if: no cookie, bad signature, missing session row, expired row, or `user.active = false`.
- This is the source of truth.

This split is intentional: the edge enforces a coarse gate without DB load, and the application layer enforces the fine-grained truth. The two can disagree (e.g., a session was revoked but the cookie still exists) — see [Stale-cookie handling](#stale-cookie-handling).

### Logout

`logoutAction` ([lib/actions/auth.ts](../lib/actions/auth.ts)) calls `deleteSession()`, which removes the DB row **and** clears the cookie. Then `logAudit("LOGOUT")` and redirect to `/login`.

### Expiry

Sessions are valid for 7 days (`SESSION_DAYS` in [lib/auth/session.ts](../lib/auth/session.ts)). Both the JWT `exp` claim and the DB `expiresAt` column enforce this. There is no sliding expiry — a session lasts exactly 7 days from creation.

## Request flow

```
┌─────────────┐
│  GET /foo   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  proxy.ts                   │
│  - reads `session` cookie   │
│  - jose.jwtVerify(...)      │   no/invalid JWT and path is private
│                             ├──────────────────────────────────────► 307 /login?next=/foo
│  valid JWT or public path   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  app/(core)/layout.tsx          │   getSession() returns null
│  - getSession() (DB-backed)     ├─────────────────────────────────► redirect /login
│  - passes user to AppSidebar    │   (e.g., session row deleted)
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  page.tsx                       │   role too low
│  - requireRole("ADMIN") etc.    ├─────────────────────────────────► redirect /
│  - render gated UI              │
└─────────────────────────────────┘
```

## Code layout

| Path                                                                                                                               | Purpose                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [proxy.ts](../proxy.ts)                                                                                                            | Edge: JWT signature check + redirect to `/login` for private paths |
| [lib/auth/session.ts](../lib/auth/session.ts)                                                                                      | `createSession`, `getSession`, `deleteSession`, JWT sign/verify    |
| [lib/auth/password.ts](../lib/auth/password.ts)                                                                                    | bcrypt wrappers                                                    |
| [lib/auth/can.ts](../lib/auth/can.ts)                                                                                              | `can()`, `authorize()`, `requireAuth()`, `requireRole()`           |
| [lib/auth/audit.ts](../lib/auth/audit.ts)                                                                                          | `logAudit(userId, action, detail?)`                                |
| [lib/actions/auth.ts](../lib/actions/auth.ts)                                                                                      | `loginAction`, `logoutAction` server actions                       |
| [lib/actions/users.ts](../lib/actions/users.ts)                                                                                    | `inviteUser`, `changeUserRole`, `deactivateUser` (admin-only)      |
| [app/login/page.tsx](../app/login/page.tsx)                                                                                        | Public login page                                                  |
| [app/(core)/layout.tsx](../app/%28core%29/layout.tsx)                                                                              | Wraps every authed page with sidebar + session check               |
| [app/(core)/settings/users/page.tsx](../app/%28core%29/settings/users/page.tsx)                                                    | Admin user management                                              |
| [app/(core)/settings/audit/page.tsx](../app/%28core%29/settings/audit/page.tsx)                                                    | Admin audit log viewer                                             |
| [app/login/\_components/login-form.tsx](../app/login/_components/login-form.tsx)                                                   | Login form (`useActionState`)                                      |
| [app/(core)/\_components/user-menu.tsx](<../app/(core)/_components/user-menu.tsx>)                                                 | Sidebar footer dropdown — name/role/logout                         |
| [app/(core)/settings/users/\_components/invite-user-dialog.tsx](<../app/(core)/settings/users/_components/invite-user-dialog.tsx>) | Admin-only invite dialog                                           |
| [app/(core)/settings/users/\_components/users-table.tsx](<../app/(core)/settings/users/_components/users-table.tsx>)               | Admin user management table                                        |
| [prisma/seed-auth.ts](../prisma/seed-auth.ts)                                                                                      | Idempotent seed for default admin + viewer accounts                |

## Route layout

```
app/
├── layout.tsx                ← root: <html>, <body>, fonts, Toaster
├── login/
│   └── page.tsx              ← public; renders LoginForm
└── (core)/                   ← route group; layout requires a session
    ├── layout.tsx            ← getSession() or redirect; renders sidebar shell
    ├── page.tsx              ← / dashboard
    ├── locations/[id]/page.tsx
    ├── reports/page.tsx
    ├── help/page.tsx
    └── settings/
        ├── page.tsx          ← requireRole("ADMIN")
        ├── users/page.tsx    ← requireRole("ADMIN")
        └── audit/page.tsx    ← requireRole("ADMIN")
```

The `(core)` route group lets every page inside it share one session check + sidebar without putting `/login` behind that check.

## How to gate things

### A server component (page or layout)

```tsx
import { requireRole } from "@/lib/auth/can";

export default async function SettingsPage() {
  await requireRole("ADMIN"); // redirects if not admin
  return <div>Admin stuff</div>;
}
```

For conditional rendering rather than blocking:

```tsx
import { can, requireAuth } from "@/lib/auth/can";

export default async function LocationPage() {
  const session = await requireAuth();
  const canManage = can(session.user.role, "SITE_MANAGER");
  return (
    <>
      <ReadOnlyStuff />
      {canManage && <ForceDefrostButton />}
    </>
  );
}
```

### A server action

Always start the action with `authorize` so the `{ data, error }` shape is preserved:

```ts
"use server";
import { authorize } from "@/lib/auth/can";

export async function doSomething(): Promise<ActionResult<...>> {
  const guard = await authorize("SITE_MANAGER");
  if (!guard.data) return { data: null, error: guard.error };

  // guard.data.userId, guard.data.role available here
  await logAudit(guard.data.userId, "SOMETHING_HAPPENED", { ... });
  // ...
}
```

> **Why `if (!guard.data)`** instead of `if (guard.error)`? TypeScript narrows the discriminated union on `data: T | null` more reliably than on `error: string | null` (because `if (error)` is a truthy check — empty string would falsely pass).

### A client component

`can()` is a pure function safe in either environment. Pass `userRole` as a prop from the server component:

```tsx
"use client";
import { can } from "@/lib/auth/can";

export function MyButtons({ userRole }: { userRole: Role }) {
  return can(userRole, "ADMIN") ? <DangerButton /> : null;
}
```

Never trust the client-side check alone — pair it with a server-side `authorize()` call in the action it triggers.

## Audit events

The audit log captures security-sensitive actions. Current actions:

| Action             | Where logged                           | `detail` shape                  |
| ------------------ | -------------------------------------- | ------------------------------- |
| `LOGIN`            | `loginAction` after success            | (none)                          |
| `LOGOUT`           | `logoutAction` before clearing session | (none)                          |
| `USER_INVITED`     | `inviteUser` after create              | `{ targetUserId, email, role }` |
| `ROLE_CHANGE`      | `changeUserRole` after update          | `{ targetUserId, role }`        |
| `USER_DEACTIVATED` | `deactivateUser` after update          | `{ targetUserId }`              |

Add new actions by calling `logAudit(actorUserId, "ACTION_NAME", detail)` from the action that performs the change. Keep `action` strings stable so the admin viewer at `/settings/audit` stays meaningful.

## Default seeded users

Run `npx tsx prisma/seed-auth.ts` after migrations. It is idempotent (skips users that already exist).

| Email                | Role   | Password       |
| -------------------- | ------ | -------------- |
| `admin@example.com`  | ADMIN  | `ChangeMe123!` |
| `viewer@example.com` | VIEWER | `ChangeMe123!` |

**Rotate these passwords before any non-development deployment.**

## Environment

```bash
DATABASE_URL=postgresql://...
AUTH_SECRET=<at least 32 random chars>   # used to sign session JWTs
```

Generate a secret with:

```bash
node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'
```

**Rotating `AUTH_SECRET` invalidates every active session immediately** (existing JWTs no longer verify). This is a fast emergency-revoke lever.

## Stale-cookie handling

A "stale cookie" is one with a valid signature pointing at a session row that no longer exists (revoked, expired, wiped during dev, etc.). Without care, this can cause a redirect loop:

1. `GET /` → proxy sees valid signature → lets through
2. `(core)/layout.tsx` → `getSession()` returns `null` → redirect to `/login`
3. If proxy also redirects authed users away from `/login` → back to step 1.

We avoid the loop by **not** redirecting authed users away from `/login` in the proxy. The `/login` page itself calls `getSession()` (DB-backed); a real session redirects to `/`, a stale one falls through and renders the form. Submitting the form calls `createSession()` which overwrites the stale cookie with a fresh one.

Server components cannot mutate cookies, so we don't try to delete the stale cookie from the page render. Successful login (or explicit logout) is the only place we write/clear `session`.

## Security properties

- Passwords are bcrypt-hashed with cost 12; never logged or returned.
- Session IDs are CUIDs and never appear in URLs.
- The `session` cookie is HTTP-only (no JS access), `SameSite=lax` (CSRF-resistant for cross-site requests), and `Secure` in production.
- Server actions run a fresh `authorize()` on every call; the client never holds authority.
- Deactivating a user takes effect immediately for new requests (next `getSession()` call returns null).
- Setting `User.active = false` is preferred over deleting users — preserves audit log integrity.

## Known gaps / out of scope

These are intentional follow-ups, not bugs:

- **Password reset / forgot-password** flow.
- **OAuth / SSO** (Google, Microsoft, Okta).
- **Per-location ACLs** — currently any `SITE_MANAGER` can act on any location. Future work: scope manager permissions to specific TreeNode subtrees.
- **Login rate limiting** — no protection against credential-stuffing today; rely on infrastructure (WAF, fail2ban) for now.
- **Email delivery for invites** — `inviteUser` requires the admin to share the temporary password out-of-band.
- **Sliding session expiry** — sessions hard-expire after 7 days; no refresh.
- **Multi-tenancy** — single-tenant only; organization name is hardcoded in the sidebar.

## Tests

Auth-related tests live next to source per project convention:

- [lib/auth/can.test.ts](../lib/auth/can.test.ts) — role hierarchy matrix (pure)
- [lib/auth/password.test.ts](../lib/auth/password.test.ts) — bcrypt round-trip + salting
- [lib/actions/users.test.ts](../lib/actions/users.test.ts) — admin-only enforcement on `changeUserRole` / `deactivateUser`, self-deactivation block

Run with `npm test`.
