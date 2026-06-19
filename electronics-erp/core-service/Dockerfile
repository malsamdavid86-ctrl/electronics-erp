# ====================================================================
# STAGE 1: COMPILATION ENGINE
# ====================================================================
FROM node:18-alpine AS build-engine
WORKDIR /usr/src/app

# Pull manifests to compile internal native extensions securely
COPY package*.json ./

# Execute clean production installation parameters
RUN npm ci --only=production

# ====================================================================
# STAGE 2: LEAN COMPLIANCE RUNTIME
# ====================================================================
FROM node:18-alpine AS runtime-container
WORKDIR /usr/src/app

# Enforce secure node optimization variables
ENV NODE_ENV=production
ENV PORT=5000

# Establish a limited permission system account to prevent root elevation vulnerabilities
RUN addgroup -S microservices && adduser -S coreuser -G microservices

# Extract dependencies cleanly from compilation engines
COPY --from=build-engine /usr/src/app/node_modules ./node_modules
COPY . .

# Pass node ownership down to standard operational staff account
RUN chown -R coreuser:microservices /usr/src/app

USER coreuser

# Expose internal microservice cluster port
EXPOSE 5000

# Execute server initialization matrix
CMD ["node", "server.js"]
