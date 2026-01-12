# 🏛️ Skaidrus Seimas

**Lithuanian MP Tracker** — A real-time transparency platform for monitoring parliamentary accountability

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Security: Hardened](https://img.shields.io/badge/Security-Hardened-green.svg)](./DEPLOY.md)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success.svg)](./DEPLOY.md)

> **skaidrus** (Lithuanian): _transparent, clear, honest_

**Status:** ✅ Production Ready | **Security:** 🔒 Hardened | **Performance:** ⚡ Optimized

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22+
- **PostgreSQL** 16+
- **Redis** 7+ (optional, for caching)
- **pnpm** (recommended) or npm

### Installation

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## ⚡ Tech Stack

| Layer        | Technology                                            |
| ------------ | ----------------------------------------------------- |
| **Frontend** | React 19 (Vite), Tailwind CSS (Glassmorphism), Wouter |
| **Backend**  | tRPC, Express, Drizzle ORM                            |
| **Database** | PostgreSQL 16                                         |
| **Cache**    | Redis 7                                               |
| **AI**       | Google Gemini (Bill Summaries)                        |
| **Styling**  | Glassmorphism Dark Theme, Framer Motion               |

---

## ✨ Features

### 🔍 **Global Search with Autocomplete**

- Real-time search across MPs and legislation with instant results
- Typeahead suggestions (top 5 MPs + top 5 Bills)
- Fast text search using database indexes
- Keyboard navigation support

### 📊 **'Pulsas' Analytics Dashboard**

- Interactive Recharts visualizations
- Voting trends over time (stacked bar charts)
- Session heatmaps showing parliamentary activity
- Real-time data with Redis caching (1-hour TTL)
- Responsive design for mobile devices

### ⚖️ **MP Comparison Tool**

- Side-by-side comparison of voting records
- Agreement score calculation
- Key disagreements highlighting
- Shareable comparison URLs (`/compare?ids=mp1,mp2`)
- One-click "Compare" button from MP profiles

### 👤 **User Watchlist & Personalization**

- Follow specific MPs to track their activity
- Personalized dashboard with "Mano sekami" (My Watchlist) widget
- One-click follow/unfollow with optimistic UI updates
- Real-time cache invalidation for instant feedback
- Settings page with database persistence

### 🤖 **AI-Powered Bill Summaries**

- Automatic bill summarization using Google Gemini
- Idempotent processing (only new bills)
- Retry logic with exponential backoff
- Cost-optimized (no duplicate API calls)

### 📈 **Real-time Activity Feed**

- Live stream of parliamentary activities
- Cursor-based pagination for infinite scroll
- Synthetic feed fallback when activities table is empty
- Glassmorphism UI with smooth animations

### 🎯 **Accountability Scores**

Calculated from:

- Voting attendance
- Party loyalty
- Legislative activity (bills proposed/passed)
- Real-time updates with database triggers

### 🔒 **Production Security**

- Helmet security headers (CSP, HSTS, XSS protection)
- CORS configuration (whitelist-based)
- Rate limiting (global + strict for sensitive endpoints)
- Request ID tracing for error correlation
- Graceful shutdown handling

### 📊 **Observability**

- Structured logging with Pino
- Sentry integration (backend + frontend)
- Health check endpoints (`/health`, `/health/ready`)
- Request correlation IDs
- Error boundaries with user-friendly UI

### ⚡ **Performance Optimizations**

- Database indexes (composite + GIN for text search)
- Redis caching with stale-while-revalidate
- Cursor-based pagination
- Connection pooling
- Code splitting ready (warnings addressed in debt doc)

---

## 🛠️ Development

### Available Scripts

| Command               | Description                     |
| --------------------- | ------------------------------- |
| `npm run dev`         | Start development server        |
| `npm run build`       | Build for production            |
| `npm run start`       | Start production server          |
| `npm run check`       | Type check without building     |
| `npm run test`        | Run unit/integration tests      |
| `npm run e2e`         | Run E2E tests (Playwright)     |
| `npm run db:push`     | Push schema changes to database |
| `npm run sync:mps`    | Sync MPs from Seimas API        |
| `npm run sync:votes`  | Sync voting records             |
| `npm run sync:bills`  | Sync legislation                |
| `npm run calc:scores` | Calculate accountability scores |
| `npm run generate:summaries` | Generate AI bill summaries |

### Project Structure

```
skaidrus-seimas-demo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages (Dashboard, MPProfile, etc.)
│   │   └── lib/            # tRPC client setup
├── server/                 # Node.js backend
│   ├── routers/            # tRPC route handlers
│   ├── routers.ts          # Main router configuration
│   └── db.ts               # Database queries
├── drizzle/
│   └── schema.ts           # Database schema
└── scripts/                # Data sync scripts
```

---

## 🔐 Environment Variables

See [DEPLOY.md](./DEPLOY.md) for complete environment variable documentation.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `CLIENT_URL` - Allowed CORS origins (comma-separated)
- `NODE_ENV` - `production` or `development`

**Recommended:**
- `REDIS_URL` - Redis connection string (for caching and rate limiting)
- `SENTRY_DSN` / `VITE_SENTRY_DSN` - Error tracking
- `GEMINI_API_KEY` - AI bill summaries

**Quick Start:**
```bash
cp .env.example .env
# Edit .env with your values
```

---

## 📡 API Endpoints (tRPC)

### MPs

- `mps.list` — List all MPs with filters (supports pagination)
- `mps.byId` — Get MP details with stats, assistants, trips
- `mps.stats` — Get MP accountability statistics

### Bills

- `bills.list` — List legislation (supports cursor pagination)
- `bills.byId` — Get bill details with AI summary

### Activities

- `activities.list` — Get recent parliamentary activity (offset-based)
- `activities.getFeed` — Get activity feed with cursor pagination

### Dashboard

- `dashboard.getRecentActivity` — Get dashboard feed (infinite query)

### User (Personalization)

- `user.getWatchlist` — Get followed MPs with full profiles
- `user.isFollowingMp` — Check if following an MP
- `user.toggleFollowMp` — Follow/unfollow an MP (optimistic updates)
- `user.getSettings` — Get user settings
- `user.updateSettings` — Update user settings (email notifications, beta features, compact mode)

### Pulse Analytics

- `pulse.getParliamentPulse` — Get voting trends and session statistics (cached)

### Search

- `search.global` — Global search across MPs, Bills, Committees
- `search.getSuggestions` — Autocomplete suggestions (top 5 each)

### Stats

- `stats.getLastUpdated` — Get last sync timestamps for data freshness

### Health Checks

- `GET /health` — Light health check (liveness probe)
- `GET /health/ready` — Deep health check (readiness probe - checks DB + Redis)

---

## 🐛 Troubleshooting

### Database Sync Issues

If you encounter **500 Internal Server Errors** after schema changes:

**Step 1: Verify Database Connection**
```bash
# Check DATABASE_URL is set
echo $DATABASE_URL
```

**Step 2: Push Schema Changes**
```bash
npm run db:push
```

**Step 3: Restart Development Server** ⚠️ **CRITICAL**
```bash
# Stop server (Ctrl+C), then:
npm run dev
```

**Step 4: Check Server Logs**
Look for these in your terminal:
- ✅ `Database connection established`
- ✅ `Server listening on port XXXX`
- ❌ `DrizzleQueryError` or `relation does not exist` → See Common Errors below

**Step 5: Verify Endpoints**
Test these tRPC endpoints:
- `user.getWatchlist?input={"userId":"1"}`
- `user.isFollowingMp?input={"userId":"1","mpId":1}`

> 💡 **Note**: The `db:push` command may show migration errors if tables already exist. This is normal if your schema is already in sync. The key is **restarting the server** to clear ORM caches.

### Common Errors

| Error                           | Solution                                |
| ------------------------------- | --------------------------------------- |
| `relation "..." does not exist` | Run `npm run db:push` then restart server |
| `column "..." does not exist`   | Schema mismatch — verify schema.ts matches DB |
| `Cannot connect to database`    | Check `DATABASE_URL` in `.env`          |
| `500 Internal Server Error`      | **Restart dev server** (clears ORM cache) |
| `DrizzleQueryError`              | Check query syntax in `server/services/database.ts`    |

For detailed troubleshooting, see [FIX_500_ERRORS.md](./FIX_500_ERRORS.md).

---

## 📊 Database Schema

Key tables:

- `mps` — Parliament members with stats
- `bills` — Legislation with AI summaries
- `votes` — Individual voting records
- `session_votes` — Session-level vote aggregations
- `session_mp_votes` — Individual MP votes in sessions
- `activities` — Activity feed events
- `user_follows` — User watchlist (`userId`, `mpId`, `billId`, `topic`)
- `users` — User accounts with settings (JSONB)
- `mp_stats` — Calculated accountability metrics
- `bill_summaries` — AI-generated bill summaries
- `system_status` — Sync job status tracking

**Indexes:**
- Composite indexes on common filter patterns
- GIN indexes for full-text search (see `scripts/add-gin-indexes.sql`)

Run migrations:

```bash
npm run db:push
```

**Note:** After migrations, run `scripts/add-gin-indexes.sql` for optimal text search performance.

---

## 🚀 Deployment

See [DEPLOY.md](./DEPLOY.md) for comprehensive deployment instructions.

**Quick Deploy:**
```bash
# Build
npm run build

# Start production server
npm run start

# Or use Docker
docker build -t skaidrus-seimas .
docker run -p 3000:3000 --env-file .env skaidrus-seimas
```

**Production Features:**
- ✅ Security headers (Helmet)
- ✅ Rate limiting
- ✅ Health checks
- ✅ Graceful shutdown
- ✅ Error tracking (Sentry)
- ✅ Structured logging

---

## 🎨 Design Philosophy

**Glassmorphism Dark Theme** with:

- Frosted glass blur effects
- Cyan-to-blue gradients
- Smooth Framer Motion animations
- Responsive grid layouts
- Mobile-first design
- Loading skeletons
- Empty states

---

## 📚 Documentation

- **[DEPLOY.md](./DEPLOY.md)** - Complete deployment guide
- **[REMAINING_DEBT.md](./REMAINING_DEBT.md)** - Technical debt and future improvements
- **[PHASE8_DATA_INTEGRITY_SUMMARY.md](./PHASE8_DATA_INTEGRITY_SUMMARY.md)** - Data sync hardening
- **[PHASE9_PRODUCTION_HARDENING_SUMMARY.md](./PHASE9_PRODUCTION_HARDENING_SUMMARY.md)** - Security & production setup

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Lithuanian Parliament (Seimas)](https://www.lrs.lt/) for open data APIs
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database access
- [tRPC](https://trpc.io/) for end-to-end type safety
- [Recharts](https://recharts.org/) for data visualization
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

<div align="center">

Made with ❤️ for transparency in democracy

**Status:** ✅ Production Ready | **Security:** 🔒 Hardened | **Performance:** ⚡ Optimized

</div>
