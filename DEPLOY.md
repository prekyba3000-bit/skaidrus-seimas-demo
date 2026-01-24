# 🚀 Deployment Guide

**Skaidrus Seimas** - Production Deployment Instructions

This guide provides step-by-step instructions for deploying the Skaidrus Seimas application to production.

---

## 📋 Prerequisites

### Required Software

- **Node.js** 22+ (LTS recommended)
- **PostgreSQL** 16+ (with `pg_trgm` extension for full-text search)
- **Redis** 7+ (for caching and rate limiting)
- **pnpm** 10+ (or npm 10+)
- **Docker** (optional, for containerized deployment)

### System Requirements

- **CPU:** 2+ cores recommended
- **RAM:** 2GB minimum, 4GB+ recommended
- **Disk:** 10GB+ for database and logs
- **Network:** HTTPS certificate (Let's Encrypt recommended)

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

### Required Variables

```bash
# Database (REQUIRED)
DATABASE_URL=postgresql://user:password@host:5432/seimas

# Server (REQUIRED)
NODE_ENV=production
PORT=3000

# CORS (REQUIRED for production)
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com
```

### Optional but Recommended

```bash
# Redis (Recommended - enables caching and rate limiting)
REDIS_URL=redis://localhost:6379

# Security & Rate Limiting
RATE_LIMIT_MAX=100                    # Global rate limit: requests per minute
RATE_LIMIT_WINDOW_MS=60000            # Rate limit window in milliseconds
STRICT_RATE_LIMIT_MAX=5               # Strict limit for sensitive endpoints
STRICT_RATE_LIMIT_WINDOW_MS=60000     # Strict limit window

# Observability (Recommended)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx        # Backend error tracking
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx   # Frontend error tracking
LOG_LEVEL=info                                          # debug, info, warn, error

# AI Features (Optional - for bill summaries)
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_API_KEY=your-google-api-key  # Alternative to GEMINI_API_KEY

# OAuth (If using authentication)
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
OAUTH_REDIRECT_URI=https://yourdomain.com/api/oauth/callback
```

### Complete `.env` Template

```bash
# ============================================
# Database Configuration
# ============================================
DATABASE_URL=postgresql://seimas:password@localhost:5432/seimas
DB_POOL_MAX=20

# ============================================
# Server Configuration
# ============================================
NODE_ENV=production
PORT=3000

# ============================================
# CORS Configuration
# ============================================
CLIENT_URL=https://yourdomain.com

# ============================================
# Redis Configuration
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
STRICT_RATE_LIMIT_MAX=5
STRICT_RATE_LIMIT_WINDOW_MS=60000

# ============================================
# Observability (Sentry)
# ============================================
SENTRY_DSN=
VITE_SENTRY_DSN=
LOG_LEVEL=info

# ============================================
# AI Features (Google Gemini)
# ============================================
GEMINI_API_KEY=
GOOGLE_API_KEY=

# ============================================
# OAuth (Optional)
# ============================================
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_REDIRECT_URI=https://yourdomain.com/api/oauth/callback
```

---

## 🏗️ Build Process

### 1. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install --frozen-lockfile

# Or using npm
npm ci
```

### 2. Build Application

```bash
npm run build
```

This will:

- Build the React frontend (Vite) → `dist/` directory
- Bundle the Express server (esbuild) → `dist/index.js`

**Expected Output:**

```
✓ built in 8.42s
  dist/index.js  102.0kb
```

### 3. Verify Build

```bash
tsx scripts/verify-build.ts
```

This script:

- Checks that build artifacts exist
- Attempts to start the built server
- Verifies database connectivity
- Tests health check endpoints

---

## 🗄️ Database Setup

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE seimas;

# Create user (optional, if not using postgres user)
CREATE USER seimas WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE seimas TO seimas;

# Enable required extensions
\c seimas
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For full-text search (GIN indexes)
```

### 2. Run Migrations

```bash
npm run db:push
```

This will:

- Generate migration files from `drizzle/schema.ts`
- Apply migrations to the database
- Create all tables, indexes, and constraints

**Verify:**

```bash
psql -U seimas -d seimas -c "\dt"
# Should show: mps, bills, votes, session_votes, users, etc.
```

### 3. Add GIN Indexes (Optional but Recommended)

For faster text search on `mps.name` and `bills.title`:

```bash
psql -U seimas -d seimas -f scripts/add-gin-indexes.sql
```

### 4. Seed Initial Data (Optional)

```bash
# Sync MPs from Seimas API
npm run sync:mps

# Sync bills
npm run sync:bills

# Sync votes
npm run sync:votes

# Calculate accountability scores
npm run calc:scores
```

---

## 🚂 Railway: One-Off Production Seed

The production Postgres URL uses `postgres.railway.internal`, which is only reachable from inside Railway. Use the **Custom Start Command** to run the seeder on Railway, then revert.

### 1. Trigger production seed

1. **Railway Dashboard** → your project → **skaidrus-seimas-demo** service.
2. **Settings** → **Deploy** → **Custom Start Command**.
3. Set (overrides `npm start`):
   ```bash
   pnpm run db:push && pnpm run seed:real
   ```
4. **Deploy** (or trigger a redeploy). The service will run migrations, seed MPs/bills/activities, then exit. Logs should show `SEEDING COMPLETE` and MP/bill counts.
5. **Revert Custom Start Command** to:
   ```bash
   node dist/index.js
   ```
   Or use the default start (migrations + app):
   ```bash
   npm run db:push && npm run check:indexes && NODE_ENV=production node dist/index.js
   ```
6. **Redeploy** so the app runs again. Seeded data persists in the DB.

### 2. Verify

```bash
curl -s "https://skaidrus-seimas-demo-production.up.railway.app/api/trpc/mps.list?batch=1&input=%7B%220%22%3A%7B%22isActive%22%3Atrue%7D%7D" | jq '.[0].result.data | length'
# Expect: 141 (or similar) instead of empty.
```

### 3. CSP & fonts

`server/_core/index.ts` already sets:

- **style-src** and **style-src-elem**: `'self'`, `'unsafe-inline'`, `https://fonts.googleapis.com`
- **font-src**: `'self'`, `data:`, `https://fonts.googleapis.com`, `https://fonts.gstatic.com`
- **crossOriginEmbedderPolicy**: `false`

Public Sans and Tailwind should load. If fonts are blocked, confirm those directives and that the deployed build includes the latest `index.ts`.

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t skaidrus-seimas:latest .
```

### Run with Docker Compose

```bash
# Using production compose file (if exists)
docker-compose -f docker-compose.prod.yml up -d

# Or manually
docker run -d \
  --name skaidrus-seimas \
  -p 3000:3000 \
  --env-file .env \
  --network skaidrus-network \
  skaidrus-seimas:latest
```

### Docker Compose Example

```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health/ready"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: seimas
      POSTGRES_USER: seimas
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U seimas"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

---

## 🚀 Production Deployment

### Option 1: Direct Node.js Deployment

#### 1. Build Application

```bash
npm run build
```

#### 2. Start Server

```bash
NODE_ENV=production node dist/index.js
```

#### 3. Use Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name skaidrus-seimas

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**PM2 Ecosystem File (`ecosystem.config.js`):**

```javascript
module.exports = {
  apps: [
    {
      name: "skaidrus-seimas",
      script: "dist/index.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1G",
    },
  ],
};
```

### Option 2: Docker Deployment

#### 1. Build Image

```bash
docker build -t skaidrus-seimas:latest .
```

#### 2. Run Container

```bash
docker run -d \
  --name skaidrus-seimas \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  skaidrus-seimas:latest
```

### Option 3: Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests (if available).

---

## 🔍 Health Checks

### Light Health Check (Liveness)

```bash
curl http://localhost:3000/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-11T21:00:00.000Z"
}
```

### Deep Health Check (Readiness)

```bash
curl http://localhost:3000/health/ready
```

**Response (Healthy):**

```json
{
  "status": "ready",
  "checks": {
    "database": {
      "status": "healthy",
      "latencyMs": 2
    },
    "redis": {
      "status": "healthy",
      "latencyMs": 1
    }
  },
  "timestamp": "2026-01-11T21:00:00.000Z"
}
```

**Response (Unhealthy):**

```json
{
  "status": "not ready",
  "checks": {
    "database": {
      "status": "unhealthy",
      "error": "Connection timeout"
    }
  },
  "timestamp": "2026-01-11T21:00:00.000Z"
}
```

**Status Code:** 503

---

## 🔄 Reverse Proxy (Nginx)

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint (bypass rate limiting)
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

---

## 📊 Monitoring & Logging

### Log Files

- **Application Logs:** Structured JSON logs via Pino
- **PM2 Logs:** `./logs/pm2-*.log` (if using PM2)
- **Docker Logs:** `docker logs skaidrus-seimas`

### Key Metrics to Monitor

1. **Health Check Failures**
   - Monitor `/health/ready` endpoint
   - Alert if status code != 200

2. **Rate Limit Hits**
   - Monitor 429 responses
   - Track `X-RateLimit-Remaining` headers

3. **Database Connection Pool**
   - Monitor connection pool usage
   - Alert if pool exhausted

4. **Redis Availability**
   - Monitor Redis ping latency
   - Alert if Redis unavailable

5. **Error Rates**
   - Monitor Sentry error counts
   - Track tRPC error rates by endpoint

### Sentry Integration

If `SENTRY_DSN` is configured:

- Backend errors automatically sent to Sentry
- Frontend errors captured via Error Boundary
- Request IDs included for correlation

---

## 🔄 Data Sync Jobs

### Automated Sync (Recommended)

Set up cron jobs or systemd timers:

```bash
# Sync MPs (daily at 2 AM)
0 2 * * * cd /path/to/app && npm run sync:mps

# Sync Bills (daily at 3 AM)
0 3 * * * cd /path/to/app && npm run sync:bills

# Sync Votes (every 6 hours)
0 */6 * * * cd /path/to/app && npm run sync:votes

# Generate Bill Summaries (daily at 4 AM)
0 4 * * * cd /path/to/app && npm run generate:summaries

# Calculate Accountability Scores (daily at 5 AM)
0 5 * * * cd /path/to/app && npm run calc:scores
```

### Manual Sync

```bash
# Sync all data
npm run sync:mps
npm run sync:bills
npm run sync:votes
npm run sync:committees

# Generate AI summaries
npm run generate:summaries

# Calculate scores
npm run calc:scores
```

---

## 🛡️ Security Checklist

- [ ] **Environment Variables:** All secrets in `.env`, not committed to git
- [ ] **CORS:** `CLIENT_URL` set to production domain only
- [ ] **Rate Limiting:** Configured and tested
- [ ] **HTTPS:** SSL certificate installed and enforced
- [ ] **Security Headers:** Helmet configured (verify with securityheaders.com)
- [ ] **Database:** Strong password, not exposed to public internet
- [ ] **Redis:** Password protected (if exposed)
- [ ] **Sentry:** DSN configured for error tracking
- [ ] **Health Checks:** `/health/ready` monitored by orchestrator
- [ ] **Logs:** Sensitive data redacted (PII, API keys)

---

## 🐛 Troubleshooting

### Server Won't Start

1. **Check Environment Variables:**

   ```bash
   echo $DATABASE_URL
   echo $CLIENT_URL
   ```

2. **Check Database Connection:**

   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **Check Redis Connection:**

   ```bash
   redis-cli -u $REDIS_URL ping
   ```

4. **Check Port Availability:**
   ```bash
   lsof -i :3000
   ```

### Health Check Failing

1. **Database Unhealthy:**
   - Check `DATABASE_URL` is correct
   - Verify PostgreSQL is running
   - Check connection pool limits

2. **Redis Unhealthy:**
   - Check `REDIS_URL` is correct
   - Verify Redis is running
   - Check Redis memory limits

### Rate Limiting Issues

1. **Too Many 429 Errors:**
   - Increase `RATE_LIMIT_MAX` in `.env`
   - Check if behind reverse proxy (set `trust proxy`)

2. **Health Checks Rate Limited:**
   - Verify health checks are excluded (check `skip` function)

### Build Failures

1. **TypeScript Errors:**

   ```bash
   npm run check  # Type check without building
   ```

2. **Missing Dependencies:**

   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Build Artifacts Missing:**
   ```bash
   rm -rf dist
   npm run build
   ```

---

## 📝 Post-Deployment

### 1. Verify Deployment

```bash
# Check server is running
curl http://localhost:3000/health

# Check readiness
curl http://localhost:3000/health/ready

# Check API endpoint
curl http://localhost:3000/api/trpc/mps.list
```

### 2. Monitor Logs

```bash
# PM2
pm2 logs skaidrus-seimas

# Docker
docker logs -f skaidrus-seimas

# Systemd
journalctl -u skaidrus-seimas -f
```

### 3. Test Critical Endpoints

- [ ] `/health` - Returns 200
- [ ] `/health/ready` - Returns 200 with healthy checks
- [ ] `/api/trpc/mps.list` - Returns MP list
- [ ] `/api/trpc/stats.getLastUpdated` - Returns timestamps

### 4. Setup Monitoring

- Configure alerts for health check failures
- Setup Sentry alerts for error spikes
- Monitor rate limit hit rates
- Track database connection pool usage

---

## 🔄 Updates & Rollbacks

### Rolling Update

1. **Build new version:**

   ```bash
   npm run build
   ```

2. **Restart server:**

   ```bash
   # PM2
   pm2 restart skaidrus-seimas

   # Docker
   docker-compose restart api

   # Systemd
   systemctl restart skaidrus-seimas
   ```

3. **Verify:**
   ```bash
   curl http://localhost:3000/health/ready
   ```

### Rollback

1. **Revert to previous build:**

   ```bash
   git checkout <previous-commit>
   npm run build
   pm2 restart skaidrus-seimas
   ```

2. **Or use Docker image tag:**
   ```bash
   docker-compose up -d --no-deps api:previous-tag
   ```

---

## 📚 Additional Resources

- **API Documentation:** `/docs` (if available)
- **OpenAPI Spec:** `/docs/openapi.yaml`
- **Database Schema:** `drizzle/schema.ts`
- **Environment Variables:** `.env.example`

---

## 🆘 Support

For deployment issues:

1. Check logs: `pm2 logs` or `docker logs`
2. Verify health checks: `curl /health/ready`
3. Check environment variables: `env | grep -E "DATABASE|REDIS|CLIENT"`
4. Review this guide's troubleshooting section

---

**Status:** ✅ Production Ready
**Last Updated:** 2026-01-11
