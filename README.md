# dRoots0 Inventory

- **Team:** Diego Ferney Pulgarín Jiménez · Bryan Giraldo Quintero
- **Repository:** https://github.com/202602-Ingeniria-Web-Udea/dRoots0-online-store
- **Deployment:** https://droots0-online-store.vercel.app
- **Course:** Web Engineering

## Test accounts

| Role  | Email               | Password     |
|-------|---------------------|--------------|
| ADMIN | `admin@example.com` | `Admin1234!` |
| USER  | `user@example.com`  | `User1234!`  |

Inventory management dashboard for an online store: authenticated access, inventory masters, stock movements, current and historical balances, and role-based user management.

## Overview

dRoots0 Inventory is a Next.js application backed by Supabase PostgreSQL and Prisma. It provides two roles, `ADMIN` and `USER`, with server-enforced access to masters, transactions, charts, and user management.

The dashboard tracks each inventory master from its initial balance through an append-only movement history. Current and daily balances are derived from that history, and the Transactions page visualizes the daily evolution with a chart.

## Features

- Public landing page and credentials sign-in.
- HTTP-only session authentication with bcrypt password hashes.
- Role-based access for `ADMIN` and `USER`.
- Inventory masters with unique names, initial balances, and creators.
- Incoming and outgoing movements attributed to the responsible user.
- Current balances derived from the initial balance and movement history.
- Daily balance chart for the selected master.
- ADMIN-only master creation and role management.
- Server-side validation and authorization.
- Responsive dashboard shell with loading, empty, error, and success states.

## Stack

| Layer            | Technology                                                    |
|------------------|---------------------------------------------------------------|
| Framework        | Next.js 16.3.4 (App Router, Turbopack)                        |
| UI               | React 19, TypeScript, Tailwind CSS 4, Base UI components      |
| Database         | PostgreSQL on Supabase                                        |
| ORM              | Prisma 7 with `@prisma/adapter-pg`                            |
| Authentication   | Auth.js (NextAuth v5 beta), Credentials provider, JWT session |
| Password hashing | `bcryptjs`                                                    |
| Validation       | Zod                                                           |
| Forms            | React Hook Form + Zod resolver                                |
| Charts           | Recharts                                                      |
| Notifications    | Sonner                                                        |
| Tests            | Vitest                                                        |
| Package manager  | pnpm 11.5.3                                                   |

## Architecture

- `app/(auth)` contains the public authentication page.
- `app/(main)` contains the authenticated shell and protected routes:
  - `/home` — dashboard
  - `/masters` — inventory masters
  - `/transactions` — movement history and daily balance chart
  - `/users` — ADMIN-only user management
- Server Components read authenticated data through Prisma.
- Server Actions handle login, master creation, movement creation, and role updates.
- `lib/auth/session.ts` resolves the authenticated user and role from the database.
- `proxy.ts` provides optimistic route pre-filtering; authoritative checks run on the server.
- `prisma/schema.prisma` defines the database model.
- `docs/inventory.md` documents the inventory domain in detail.

## Quick start

```bash
git clone https://github.com/202602-Ingeniria-Web-Udea/dRoots0-online-store.git
cd dRoots0-online-store
pnpm install
cp .env.example .env
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm run seed
pnpm dev
```

The application runs at `http://localhost:3000`.

## Configuration

| Variable       | Required | Description                                                                                     |
|----------------|----------|-------------------------------------------------------------------------------------------------|
| `DATABASE_URL` | Yes      | Supabase PostgreSQL connection string. Session-pooler URL on port `5432` with `?schema=public`. |
| `AUTH_SECRET`  | Yes      | Auth.js session secret. Generated with `openssl rand -base64 32`.                               |
| `AUTH_URL`     | Yes      | Public application URL. `http://localhost:3000` locally; the deployment URL in production.      |

Optional seed overrides:

| Variable              | Default             |
|-----------------------|---------------------|
| `SEED_ADMIN_EMAIL`    | `admin@example.com` |
| `SEED_ADMIN_PASSWORD` | `Admin1234!`        |
| `SEED_USER_EMAIL`     | `user@example.com`  |
| `SEED_USER_PASSWORD`  | `User1234!`         |

`.env` is excluded from Git. `.env.example` contains placeholders only. Server secrets are never exposed to the browser.

## Database

The application uses Supabase PostgreSQL with the `public` schema. Prisma reads `DATABASE_URL` through `prisma7.config.ts`, and the runtime client is configured in `lib/prisma.ts`.

Existing migrations:

- `20260910115247_inicial`
- `20260915115109_modelo_tienda`
- `20261022152727_add_inventory_models`

Migration commands:

```bash
# development schema changes
pnpm exec prisma migrate dev --name <descriptive_name>

# apply pending migrations
pnpm exec prisma migrate deploy
```

The course’s initial `migracion-inicial` migration is already present and is not rerun. `prisma migrate reset` is not used against databases containing data.

## Authentication and roles

Authentication uses the Auth.js Credentials provider. Passwords are stored as bcrypt hashes. Sessions use an HTTP-only JWT cookie containing only the user ID; the role and account state are reloaded from Prisma on each request.

| Capability              | ADMIN | USER |
|-------------------------|-------|------|
| Transactions            | Yes   | Yes  |
| Masters                 | Yes   | Yes  |
| Create movements        | Yes   | Yes  |
| Create masters          | Yes   | No   |
| Users page              | Yes   | No   |
| Edit user roles         | Yes   | No   |
| View balances and chart | Yes   | Yes  |

Sidebar visibility is a usability feature. Authorization is enforced independently in pages and Server Actions.

## Account provisioning

The evaluation accounts are listed at the top of this document.

Provision or reset them with:

```bash
pnpm run seed
```

The seed is idempotent and updates the password, role, enabled state, and deleted state. Passwords are written as bcrypt hashes.

The accounts are development and evaluation credentials. They are not intended for a public production deployment with real data. Different credentials are configured through the `SEED_*` variables.

## Demo data

The shared database can be populated with fictional online-store history:

```bash
pnpm run seed:demo
```

The script:

- Removes only `B-test-*` inventory masters and their movements.
- Upserts six `Demo -` inventory masters with realistic movements across the last 60 days.
- Upserts fictional categories, suppliers, products, customers, orders, order items, and payments.
- Is idempotent; rerunning it does not duplicate records.
- Does not delete users or change passwords.

The store models are seeded for completeness but are not displayed by the current UI. The inventory masters, movements, balances, and chart are visible in the application.

## Data model and inventory rules

| Model               | Purpose                                                                                                                            |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------|
| `User`              | Account, bcrypt password hash, `ADMIN`/`USER` role, enabled/deleted flags                                                          |
| `Profile`           | Optional profile data, including an avatar image URL                                                                               |
| `InventoryMaster`   | Inventory item with a unique name, `Decimal(14,3)` initial balance, and creator                                                    |
| `InventoryMovement` | Append-only incoming/outgoing movement with quantity, timestamp, master, and responsible user                                      |
| `Enum_Role`         | `ADMIN`, `USER`                                                                                                                    |
| `Enum_MovementType` | `INCOMING`, `OUTGOING`                                                                                                             |
| Store models        | `Customer`, `Product`, `Category`, `Supplier`, `Order`, `OrderItem`, `Payment` — present in the schema, not used by the current UI |

Balance rule:

```text
currentBalance = initialBalance + sum(INCOMING) - sum(OUTGOING)
```

- The initial balance belongs to the master and is not a movement; it is counted once.
- Authoritative calculations use `decimal.js` on `Decimal(14,3)` values.
- Values are converted to numbers only for chart presentation.
- Movement quantities are positive decimals with at most three decimal places.
- Outgoing movements that would produce a negative balance are rejected.
- Movement writes use a Serializable transaction with retries for write conflicts.
- The responsible user is taken from the server session.
- Daily balances are grouped in the `America/Bogota` time zone.

The full inventory documentation is in [docs/inventory.md](docs/inventory.md).

## Testing

```bash
pnpm run test
pnpm run lint
pnpm run typecheck
pnpm run build
```

The Vitest suite contains 11 files and 79 tests covering:

- Decimal-safe current and daily balances.
- Master creation and input validation.
- Movement creation, negative-balance rejection, and serialization retries.
- Session and role resolution.
- Login error handling.
- User role policy and role updates.
- Inventory and transaction queries.

Browser checks cover the dialogs, role restrictions, negative-balance rejection, automatic refresh, and chart rendering.

## Deployment

Vercel is the deployment target; the project uses the pnpm lockfile.

| Vercel variable | Value                                     |
|-----------------|-------------------------------------------|
| `DATABASE_URL`  | Supabase session-pooler connection string |
| `AUTH_SECRET`   | Production-only Auth.js secret            |
| `AUTH_URL`      | Final deployment URL                      |

Deployment sequence:

```bash
pnpm install --frozen-lockfile
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm run build
```

Vercel build command: `pnpm exec prisma generate && pnpm run build`. Database migrations are applied with `prisma migrate deploy`. Production databases are not reset.

## Security notes

- Passwords are bcrypt hashes; plaintext passwords are not stored.
- Sessions are HTTP-only JWTs; roles are read from the database.
- Server-side checks protect pages and Server Actions independently.
- Creator IDs, responsible-user IDs, and role values are never accepted from the client.
- Master creation requires `ADMIN`; role updates require `ADMIN` and cannot target the acting administrator.
- Movement writes are transactional and reject negative balances.
- The legacy prototype user API routes are removed.
- User-facing errors are generic; internal errors remain server-side.
- `.env` is ignored by Git; `.env.example` contains placeholders.
- Supabase passwords and `AUTH_SECRET` are not committed.

## Limitations

- Masters and movement lists are not paginated; the design targets the course dataset size.
- User accounts are provisioned with the seed script; an admin create-user UI is not included.
- The existing store models are present in the schema but unused by the current UI.
- Automated browser end-to-end tests are not included; browser flows are verified manually.
- Seed accounts are test credentials and are not intended for public production data.
