FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Set PLAYWRIGHT_BROWSERS_PATH to install browsers in node_modules/.cache/playwright
# This ensures browsers are included when we copy node_modules to the runner stage
ENV PLAYWRIGHT_BROWSERS_PATH=/app/node_modules/.cache/playwright

# Install dependencies (frozen-lockfile for consistency)
# The postinstall script will install Chromium to node_modules/.cache/playwright
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build client and server
# This script runs vite build and esbuild
RUN pnpm run build

# Remove development dependencies to slim down the image
RUN pnpm prune --prod

# --- Runner Stage ---
FROM node:20-slim AS runner
# pnpm is intentionally excluded from the runner stage to minimize image size.
# Using CMD ["node", "dist/index.js"] executes the production build directly.
# This avoids failures that would occur with CMD ["pnpm", "start"] because:
# - pnpm start runs "check:indexes" which requires tsx (a dev dependency)
# - Dev dependencies are removed during "pnpm prune --prod" in the builder stage
# - The production build (dist/index.js) uses --packages=external, so node_modules is required
#   but the bundled code itself doesn't need pnpm to execute

WORKDIR /app

# Install Playwright system dependencies in runner stage
# These are required for Playwright to work in the production container
# The browser binaries are copied from builder's node_modules/.cache/playwright
# SECURITY NOTE: For production, consider pinning package versions using:
# apt-get install -y --no-install-recommends <package>=<version>
# Check available versions with: apt-cache madison <package>
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Copy necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/package.json ./package.json
# Copy node_modules (required because esbuild uses --packages=external)
# This includes Playwright and its browser binaries in node_modules/.cache/playwright
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle ./drizzle

# Create a non-root user for security
# Note: chown must happen before USER directive to avoid permission issues
RUN groupadd -r appuser && useradd -r -g appuser -u 1001 appuser && \
    chown -R appuser:appuser /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
# Set PLAYWRIGHT_BROWSERS_PATH to match the location where browsers were installed
ENV PLAYWRIGHT_BROWSERS_PATH=/app/node_modules/.cache/playwright

# Switch to non-root user
USER appuser

# Expose server port
EXPOSE 3000

# Execute production build directly without pnpm
# dist/index.js uses --packages=external, so it requires node_modules at runtime
# but doesn't need pnpm to execute - node can run it directly
CMD ["node", "dist/index.js"]
