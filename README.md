# Next.js Template

A minimal Next.js 16 starting point with session-based auth, role-based authorization, Prisma, shadcn/ui, and a ready-to-customize sidebar layout.

## Tech Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org/) (App Router)  |
| Language      | TypeScript 6 (strict mode)                      |
| Styling       | Tailwind CSS 4                                  |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) (base-nova) |
| Icons         | [Lucide React](https://lucide.dev/)             |
| Database      | PostgreSQL 17                                   |
| ORM           | [Prisma 7](https://www.prisma.io/)              |
| Auth          | JWT sessions (jose) + bcrypt password hashing   |
| Notifications | [Sonner](https://sonner.emilkoez.dev/)          |
| Testing       | Jest + React Testing Library                    |
| Runtime       | Node.js 22                                      |

## Prerequisites

- **Node.js** >= 22
- **npm** (ships with Node)
- **Docker** and **Docker Compose** (for the local PostgreSQL instance)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the database

A `docker-compose.yml` is provided to run PostgreSQL 17 locally on port **5435**:

```bash
docker compose up -d
```

### 3. Configure environment variables

All `.env*` files are gitignored. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then update the values as needed. The default `DATABASE_URL` matches the credentials in `docker-compose.yml`.

**Important:** Generate a secure `AUTH_SECRET` before deploying to production:

```bash
node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'
```

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

This applies all migrations from `prisma/migrations/` to your local database.

### 5. Generate the Prisma client

```bash
npx prisma generate
```

The generated client is output to `lib/generated/prisma/` (gitignored).

### 6. Seed the database

```bash
npx prisma db seed
```

Creates two sample users (defined in `prisma/seed.ts`):

| Email                | Password       | Role   |
| -------------------- | -------------- | ------ |
| `admin@example.com`  | `ChangeMe123!` | ADMIN  |
| `viewer@example.com` | `ChangeMe123!` | VIEWER |

### 7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser and sign in with one of the seeded users.

## Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Next.js development server |
| `npm run build` | Create a production build            |
| `npm run start` | Start the production server          |
| `npm run lint`  | Run ESLint across the project        |
| `npm test`      | Run the Jest test suite              |

## Project Structure

```
nextjs-template/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles and Tailwind imports
│   ├── (core)/                 # Authenticated app shell
│   │   ├── layout.tsx          # Sidebar + header layout, redirects unauthed users
│   │   ├── page.tsx            # Home page (/)
│   │   ├── loading.tsx
│   │   ├── _components/        # Sidebar, nav, breadcrumbs, team switcher
│   │   ├── help/               # /help
│   │   └── settings/           # /settings, /settings/users, /settings/audit (ADMIN only)
│   └── login/                  # /login
├── components/
│   └── ui/                     # shadcn/ui base components (generic)
├── hooks/                      # Custom React hooks
├── lib/
│   ├── actions/                # Server actions (auth, users)
│   ├── auth/                   # Session, password, role authorization, audit log
│   ├── generated/prisma/       # Generated Prisma client (gitignored)
│   ├── prisma.ts               # Prisma client instantiation
│   └── utils.ts                # General utilities (cn, etc.)
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Migration history
│   └── seed.ts                 # Database seed script
├── public/                     # Static assets
├── .github/workflows/          # CI/CD pipelines
├── components.json             # shadcn/ui configuration
├── docker-compose.yml          # Local PostgreSQL setup
├── Dockerfile                  # Production container build
├── next.config.ts              # Next.js configuration
├── prisma.config.ts            # Prisma configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs          # PostCSS configuration
└── eslint.config.mjs           # ESLint configuration
```

## Authentication & Authorization

Sessions are JWT-signed (via [jose](https://github.com/panva/jose)) and stored in an httpOnly cookie. Passwords are hashed with bcrypt.

- `lib/auth/session.ts` — session creation, verification, cookie handling
- `lib/auth/can.ts` — role hierarchy (`VIEWER` < `TECHNICIAN` < `SITE_MANAGER` < `ADMIN`) and guards:
  - `authorize(role)` for server actions (returns a discriminated union)
  - `requireRole(role)` / `requireAuth()` for server components (redirects)
- `lib/auth/audit.ts` — writes to the `AuditLog` table
- `lib/actions/auth.ts` — `loginAction` / `logoutAction`
- `lib/actions/users.ts` — admin-only invite/role-change/deactivate actions

## Database

### Schema

Three models (see `prisma/schema.prisma`):

- **User** — email, name, password hash, `role`, `active` flag
- **Session** — JWT-backed server-side session rows with expiry
- **AuditLog** — security-sensitive action log (login, role change, etc.)

### Creating a new migration

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name <migration_name>
```

This generates a new migration SQL file in `prisma/migrations/` and applies it to the local database.

### Resetting the database

To drop all data, re-apply migrations, and re-seed:

```bash
npx prisma migrate reset
```

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) with the **base-nova** style and **neutral** base color. Components are configured in `components.json`.

### Adding a new shadcn/ui component

```bash
npx shadcn-ui add <component-name>
```

This generates the component into `components/ui/`. Base UI components in this directory should remain generic and reusable. Custom/business-logic components belong in `components/`.

## Path Aliases

The project uses the `@/` path alias mapped to the project root:

```typescript
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

Configured in `tsconfig.json` under `compilerOptions.paths`.

## Testing

```bash
npm test
```

Jest is configured with `ts-jest` and runs the `*.test.ts` files alongside the source (e.g. `lib/actions/users.test.ts`).

## Linting

ESLint 9 is configured with Next.js core web vitals and TypeScript rules:

```bash
npm run lint
```

## Docker

### Local development database

```bash
docker compose up -d      # Start PostgreSQL
docker compose down       # Stop PostgreSQL
docker compose down -v    # Stop and remove data volume
```

### Production build

The `Dockerfile` uses a multi-stage build targeting the Next.js `standalone` output mode:

```bash
docker build -t my-app .
docker run -p 3000:3000 -e DATABASE_URL="..." -e AUTH_SECRET="..." my-app
```

## CI/CD

Two GitHub Actions workflows run on pushes to the `main` branch:

1. **Build and Push Docker Image** (`docker-publish.yml`) — builds the Docker image and pushes it to GitHub Container Registry (`ghcr.io`)
2. **Deploy to Azure Container Apps** (`deploy.yml`) — triggers after a successful image build and deploys to Azure Container Apps
