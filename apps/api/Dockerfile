# Development stage
FROM node:20-alpine AS development

RUN apk add --no-cache openssl

WORKDIR /app

# Copy workspace manifests so npm can install the monorepo dependencies.
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm ci

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Generate Prisma client for type-safe imports during watch mode.
RUN cd apps/api && npx prisma generate

CMD ["npm", "run", "dev", "--workspace=apps/api"]

# Build stage
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm ci

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared
RUN npm run build --workspace=packages/shared

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build API
RUN npm run build --workspace=apps/api

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/packages/shared/package*.json ./packages/shared/

RUN npm ci --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

CMD ["node", "apps/api/dist/main"]
