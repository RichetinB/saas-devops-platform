# SaaS DevOps Platform

A production-ready SaaS task management platform built with a monorepo architecture.

## 📋 Project Description

A full-stack TypeScript SaaS platform featuring:
- **JWT Authentication** (register / login)
- **User Management** 
- **CRUD Task System** (create, read, update, delete tasks)
- **PostgreSQL** database via Prisma ORM
- **Clean layered architecture** (Controller → Service → Repository → Database)
- **Full Docker support** (one-command startup)
- **CI/CD ready** (GitHub Actions)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10 + TypeScript (strict) |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Auth | JWT + bcrypt |
| Infrastructure | Docker + Docker Compose |
| Package Manager | npm workspaces |
| Testing | Jest + Supertest |

---

## 🗂️ Monorepo Structure

```
/apps
  /api        → NestJS backend (port 3001)
  /web        → Next.js frontend (port 3000)
/packages
  /shared     → Shared TypeScript types
/infra
  docker-compose.yml
.github/
  workflows/
    ci.yml
```

---

## ⚡ Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or use Docker)
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Build shared package

```bash
npm run build --workspace=packages/shared
```

### 3. Configure environment variables

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/api/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saas_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
```

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Database setup

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run locally

**Backend:**
```bash
cd apps/api
npm run start:dev
```

**Frontend:**
```bash
cd apps/web
npm run dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

---

## 🐳 Docker Setup

### Start everything with one command

```bash
docker compose -f infra/docker-compose.yml up --build
```

### Stop all services

```bash
docker compose -f infra/docker-compose.yml down
```

### Stop and remove volumes (clean state)

```bash
docker compose -f infra/docker-compose.yml down -v
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `web` | 3000 | Next.js frontend |
| `api` | 3001 | NestJS backend |
| `postgres` | 5432 | PostgreSQL database |
| `redis` | 6379 | Redis (future use) |

---

## 🔑 Environment Variables

### API (`apps/api/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `PORT` | API server port | `3001` |

### Web (`apps/web/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001` |

---

## 🗄️ Prisma Commands

```bash
# Run inside apps/api

# Create and apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (drops all data)
npx prisma migrate reset
```

---

## 📦 Scripts

### Root workspace

```bash
# Install all dependencies
npm install

# Build everything
npm run build

# Run all tests
npm run test

# Lint all workspaces
npm run lint
```

### Local development

```bash
# Run backend in watch mode
cd apps/api && npm run start:dev

# Run frontend
cd apps/web && npm run dev
```

### Docker

```bash
# Build and start all services
docker compose -f infra/docker-compose.yml up --build

# Stop all services
docker compose -f infra/docker-compose.yml down
```

### Database

```bash
npx prisma migrate dev
npx prisma generate
```

### Testing

```bash
# Unit tests
cd apps/api && npm test

# Unit tests with coverage
cd apps/api && npm run test:cov

# E2E tests
cd apps/api && npm run test:e2e
```

---

## 🔌 API Endpoints

### Auth
| Method | Path | Description | Auth Required |
|--------|------|-------------|:---:|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login | ❌ |

### Tasks
| Method | Path | Description | Auth Required |
|--------|------|-------------|:---:|
| GET | `/tasks` | Get all user tasks | ✅ |
| GET | `/tasks/:id` | Get single task | ✅ |
| POST | `/tasks` | Create task | ✅ |
| PUT | `/tasks/:id` | Update task | ✅ |
| DELETE | `/tasks/:id` | Delete task | ✅ |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check → `{ "status": "ok" }` |

---

## 🏗️ Architecture

The backend follows a strict layered architecture:

```
HTTP Request
    ↓
Controller  (HTTP layer — no business logic)
    ↓
Service     (Business logic only)
    ↓
Repository  (Database access via Prisma only)
    ↓
PostgreSQL
```

No direct database access is permitted outside of repositories.

---

## 🔐 Authentication Flow

1. User registers with email + password
2. Password is hashed with bcrypt (10 salt rounds)
3. JWT token is returned (expires in 7 days)
4. Protected routes require `Authorization: Bearer <token>` header
5. JWT strategy validates the token and injects the user into the request

---

## 🧪 Testing

```bash
# Run unit tests (AuthService)
cd apps/api && npm test

# Run with coverage
cd apps/api && npm run test:cov
```

Unit tests cover:
- `AuthService.register()` — success & duplicate email
- `AuthService.login()` — success & invalid credentials

---

## 🚀 CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:

1. **lint-and-test** — Install deps → Build shared → Lint → Generate Prisma → Unit tests
2. **build** — Full build (API + Web)
3. **docker** — Docker image build verification

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `apps/api/prisma/schema.prisma` | Database schema |
| `apps/api/src/app.module.ts` | Root NestJS module |
| `apps/api/src/modules/auth/` | JWT auth module |
| `apps/api/src/modules/tasks/` | Tasks CRUD module |
| `apps/api/src/modules/users/` | Users module |
| `apps/api/src/modules/health/` | Health check |
| `apps/api/src/modules/prisma/` | Global Prisma service |
| `apps/web/src/app/` | Next.js App Router pages |
| `apps/web/src/lib/api.ts` | API client helpers |
| `packages/shared/src/` | Shared TypeScript types |
| `infra/docker-compose.yml` | Docker Compose config |
| `.github/workflows/ci.yml` | CI/CD pipeline |