# AGENTS.md

## Project

Courier Logistics Application (Stage 2)

This is the logistics hub application responsible for managing package movement through regions, bags, and trucks.

## Tech Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma
- React
- React Query
- TailwindCSS

---

## Architecture

### Controllers

Controllers only:

- Validate input
- Call services
- Return API responses

Do not place business logic in controllers.

### Services

Services contain:

- Business rules
- Prisma queries
- Status transitions

### Prisma

All database access must happen through Prisma.

---

## API Response Contract

All APIs return:

```ts
type ApiResponse<T> = {
  error: {
    code: string;
    message: string;
  } | null;

  message: string;
  data: T | null;
};
```

---

## Error Handling

Never return raw Prisma errors.

Never return stack traces.

Use:

```ts
throw new AppError(404, "PACKAGE_NOT_FOUND", "Package not found.");
```

---

## Business Rules

Package flow:

TO_BE_PICKED_UP
→ PICKED_UP
→ ADDED_TO_BAG
→ EN_ROUTE
→ ARRIVED
→ SCHEDULED_FOR_DELIVERY
→ OUT_FOR_DELIVERY

Package belongs to one Bag.

Bag belongs to one Truck.

Assigning a package to a bag should update package status to ADDED_TO_BAG.

Assigning a bag to a truck should update package status to EN_ROUTE.

---

## Database Rules

Prefer relations over manual joins in application code.

Always paginate list endpoints.

Default:

- page = 1
- limit = 10

Always order by:

createdAt DESC

---

## Assignment Scope

Stage 2 only.

Do not implement:

- ETL jobs
- Synchronization jobs
- Delay reasoning engines
- Route optimization
- Multi-hop routing

Those belong to later stages.

---

## Folder Ownership

src/controllers

- HTTP layer only

src/services

- Business logic

src/routes

- Route registration

src/lib

- Shared utilities

src/prisma

- Prisma client

---

## Environment Variables

All secrets must be stored in .env.

Never hardcode:

- passwords
- tokens
- API keys
- database credentials
