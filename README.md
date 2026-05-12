# Invoice Service

## Repository Structure

- `apps/web` — Vue 3 frontend
- `apps/api` — Fastify + Prisma backend
- `packages/shared` — Shared TypeScript types and schemas

---

# How to Run

## Run the Entire Stack via Docker

To start the database (PostgreSQL) and the production server (which statically serves the frontend), run:

```bash
docker compose up -d
```

Then open:

- Frontend/API: http://localhost:3000

---

## Local Development

### 1. Install dependencies from the workspace root

```bash
pnpm install
```

### 2. Ensure PostgreSQL is running

Make sure a local or Dockerized PostgreSQL instance is available.

### 3. Run the development servers

```bash
pnpm dev
```

Then open:

- Frontend: http://localhost:5173
- API: http://localhost:3000

---

# What I'd Do Differently With Another 3 Hours

- **Comprehensive Test Coverage**  
  I would implement a proper test suite (using Jest or Vitest) focused on the business logic, especially:
  - Minor-unit money math
  - Rounding edge cases (e.g. `taxRateBps = 1825`)
  - Strict invoice state transition validation/rejections

- **Display Formatting Unification**  
  Currently, the API strictly handles integer minor units, while the frontend converts them into decimals for display.  
  I would build a robust shared utility inside `packages/shared` to guarantee consistent minor-unit ↔ decimal formatting across the entire app and eliminate potential floating-point display inconsistencies.

---

# Tradeoffs Made and Why

- **Database Locking for Monotonic Numbers**  
  To satisfy the strict "no gaps" sequencing requirement, I implemented a dedicated transaction that:
  1. Locks the counter row for the current month
  2. Increments the sequence
  3. Assigns the generated invoice number

  Invoice numbers are generated using the time of creation year/month combined with the sequence counter (e.g. `2026-05-0001`).

  The tradeoff is reduced write concurrency, since concurrent invoice creations must wait for the lock to release. However, guaranteeing sequence integrity was prioritized over maximum write throughput for this feature.

- **Manual Voiding**  
  Invoices currently need to be manually transitioned to `void`.

  I considered:
  - A cron/background worker
  - Automatically mutating state during `GET` requests

  I rejected both approaches because:
  - Mutating state during reads is an anti-pattern
  - A dedicated worker felt like over-engineering for the 4-hour time constraint

---

# One Thing in the Spec I'd Push Back On

## Enforcing Gapless Numbering at Draft Creation

Generating strict sequential invoice numbers at the moment a draft is created introduces unnecessary database contention and increases the risk of gaps if drafts are abandoned or deleted.

Instead, I would propose:

- Using a UUID as the internal database identifier
- Generating the user-facing sequential invoice number only when the invoice transitions from `draft` → `issued`

This approach:
- Removes the serialization bottleneck during draft creation
- Prevents gaps caused by abandoned drafts
- Keeps strict sequence guarantees only where they matter

---

# Notes

AI tools were used to assist with:
- Writing this README
- Generating frontend HTML
- Structuring the PDF generation layout
