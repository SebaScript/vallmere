# Multi-stage build for backend NestJS application
FROM node:20-alpine AS base

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies and tools
RUN apk add --no-cache \
    dumb-init \
    curl \
    netcat-openbsd \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nestjs -u 1001

# Development stage
FROM base AS development

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci --only=development

# Copy source code
COPY . .

# Generate Prisma client if using Prisma (uncomment if needed)
# RUN npx prisma generate

EXPOSE 3000

USER nestjs

CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code and configuration
COPY . .

# Build the application
RUN npm run build && \
    npm prune --production

# Production stage
FROM base AS production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create logs directory
RUN mkdir -p /usr/src/app/logs && \
    chown -R nestjs:nodejs /usr/src/app/logs

# Copy built application and production dependencies
COPY --from=build --chown=nestjs:nodejs /usr/src/app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /usr/src/app/package*.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
