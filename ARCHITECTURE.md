# Pharmacy Management SaaS - Architecture Blueprint

## 1. Multi-Tenancy Strategy
We adopt a **Logical Isolation** strategy using a single MongoDB database.
- **Tenant Identification**:
  - **Subdomain/Custom Domain**: Extracted via Middleware (`tenant.app.com` -> `tenant`).
  - **Header**: `x-tenant-id` for API calls.
  - **Session**: User's active tenant in session.
- **Data Isolation**:
  - Every Mongoose Schema has `tenantId: Index`.
  - Queries are scoped automatically using a helper/middleware wrapper or explicit `find({ tenantId })`.
  - **Middleware** (`middleware.ts`) validates the tenant exists before reaching the app.

## 2. Tech Stack Setup
- **Framework**: Next.js 14/15 (App Router).
- **Database**: MongoDB (Mongoose).
- **Auth**: Custom JWT-based session (stored in HTTP-only cookies).
- **Styling**: Tailwind CSS (Utility-first).

## 3. Folder Structure
```
/app
  /(auth)         # Public auth routes (Login, Signup) - No sidebar
  /(dashboard)    # Protected SaaS routes - Sidebar + Navbar
  /api            # Route Handlers (REST API)
/components
  /ui             # Reusable atomic elements (Button, Card)
  /dashboard      # complex dashboard widgets
/lib
  /db             # Mongoose connection & models initialization
  /auth           # Session management options
  /tenant         # Tenant context helpers
/models           # Mongoose Schemas (Tenant, User, Product...)
/middlewares      # Custom middleware logic (split from root middleware.ts)
```

## 4. Key Workflows
- **Onboarding**: Signup -> Create Tenant -> Create Admin User -> Assign Trial Plan.
- **Subscription**: Middleware checks `Tenant.subscriptionStatus` and `Tenant.planExpiry`.
- **RBAC**: middleware or wrapper checks `User.role` (Admin, Pharmacist) for specific Actions.
