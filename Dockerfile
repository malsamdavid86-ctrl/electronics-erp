Here is the production-ready `Dockerfile` for your `public-frontend/` directory.

This file is configured as a multi-stage compilation matrix leveraging Next.js **Output Standalone** tracing. It trims down your node modules, bakes in environmental endpoints at build time, and outputs a container image that runs on a secure, non-root user account.

### `public-frontend/Dockerfile`

```dockerfile
# ====================================================================
# STAGE 1: COMPILATION & BUILD ENGINE
# ====================================================================
FROM node:18-alpine AS builder
WORKDIR /app

# Ensure we check lock files for predictable corporate builds
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Build-time public runtime network configuration arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Instructs Next.js to trace and trim unused system modules
RUN echo "module.exports = { output: 'standalone' };" > next.config.js
RUN npm run build

# ====================================================================
# STAGE 2: LEAN RUNTIME NODE
# ====================================================================
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Establish a limited permission platform account
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Pull static resources and public metadata layers
COPY --from=builder /app/public ./public

# Pull Next.js standalone infrastructure mappings
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Fire up the lightweight standalone Node web server instance
CMD ["node", "server.js"]

```
