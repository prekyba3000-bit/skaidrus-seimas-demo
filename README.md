# 🏛️ Skaidrus Seimas

**Transparent Lithuanian Parliament Monitoring Platform**

[![CI/CD](https://github.com/your-org/skaidrus-seimas-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/skaidrus-seimas-demo/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **skaidrus** (Lithuanian): _transparent, clear, honest_

A real-time transparency platform that aggregates, analyzes, and visualizes data from the Lithuanian Parliament (Seimas). Built with modern TypeScript, featuring AI-powered bill summarization, MP accountability scoring, and interactive voting pattern analysis.

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [API Reference](#-api-reference)
- [Data Sources](#-data-sources)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗️ Architecture

```mermaid
flowchart TB
    subgraph External["🌐 External Data Sources"]
        SEIMAS["🏛️ Seimas Open Data API\n(XML/JSON)"]
        OPENSANCTIONS["📋 OpenSanctions\n(Cross-reference)"]
    end

    subgraph Ingestion["⚙️ Data Ingestion Layer"]
        SYNC_MPS["sync:mps\n(MPs & Assistants)"]
        SYNC_VOTES["sync:votes\n(Voting Records)"]
        SYNC_BILLS["sync:bills\n(Legislation)"]
        SYNC_COMMITTEES["sync:committees\n(Committees)"]
        CALC_SCORES["calc:scores\n(Accountability)"]
    end

    subgraph Validation["🛡️ Validation Layer"]
        ZOD["Zod Schemas\n(Fail-Fast)"]
    end

    subgraph Storage["💾 Data Storage"]
        POSTGRES[("PostgreSQL 16\n(Drizzle ORM)")]
        REDIS[("Redis 7\n(Cache + Rate Limit)")]
    end

    subgraph Backend["🖥️ Backend API"]
        TRPC["tRPC Server\n(Type-Safe API)"]
        PINO["Pino Logger\n(Structured Logs)"]
        SENTRY["Sentry\n(Error Tracking)"]
    end

    subgraph AI["🤖 AI Services"]
        GEMINI["Google Gemini\n(Bill Summaries)"]
        QUIZ["Quiz Generator\n(Educational)"]
    end

    subgraph Frontend["🎨 Frontend"]
        VITE["Vite + React 19"]
        DASHBOARD["Dashboard\n(Real-time Stats)"]
        COMPARE["MP Comparison\n(Voting Alignment)"]
        PROFILE["MP Profiles\n(Accountability Scores)"]
    end

    subgraph Clients["👥 End Users"]
        BROWSER["Web Browser"]
        MOBILE["Mobile (PWA)"]
    end

    %% Data Flow
    SEIMAS --> SYNC_MPS
    SEIMAS --> SYNC_VOTES
    SEIMAS --> SYNC_BILLS
    SEIMAS --> SYNC_COMMITTEES
    OPENSANCTIONS --> SYNC_MPS

    SYNC_MPS --> ZOD
    SYNC_VOTES --> ZOD
    SYNC_BILLS --> ZOD
    SYNC_COMMITTEES --> ZOD

    ZOD --> POSTGRES
    CALC_SCORES --> POSTGRES

    POSTGRES --> TRPC
    REDIS --> TRPC
    TRPC --> PINO
    TRPC --> SENTRY

    TRPC --> GEMINI
    GEMINI --> QUIZ

    TRPC --> VITE
    VITE --> DASHBOARD
    VITE --> COMPARE
    VITE --> PROFILE

    DASHBOARD --> BROWSER
    COMPARE --> BROWSER
    PROFILE --> MOBILE

    %% Styling
    classDef external fill:#e1f5fe,stroke:#01579b
    classDef ingestion fill:#fff3e0,stroke:#e65100
    classDef storage fill:#e8f5e9,stroke:#2e7d32
    classDef backend fill:#f3e5f5,stroke:#7b1fa2
    classDef ai fill:#fce4ec,stroke:#c2185b
    classDef frontend fill:#e3f2fd,stroke:#1565c0

    class SEIMAS,OPENSANCTIONS external
    class SYNC_MPS,SYNC_VOTES,SYNC_BILLS,SYNC_COMMITTEES,CALC_SCORES ingestion
    class POSTGRES,REDIS storage
    class TRPC,PINO,SENTRY backend
    class GEMINI,QUIZ ai
    class VITE,DASHBOARD,COMPARE,PROFILE frontend
```

---

## ✨ Features

### 📊 Data & Analytics

- **141 MPs** tracked with real-time voting records
- **538 MP Assistants** with contact information
- **Accountability Scores** calculated from attendance, loyalty, and legislative activity
- **Voting Pattern Analysis** with party alignment metrics

### 🤖 AI-Powered

- **Bill Summarization** using Google Gemini
- **Educational Quizzes** auto-generated from legislation
- **Voting Agreement Calculator** for MP comparisons

### 🛡️ Production-Grade

- **Redis Caching** with stale-while-revalidate
- **Rate Limiting** (tiered for read/write operations)
- **Structured Logging** (Pino with PII redaction)
- **Error Tracking** (Sentry integration)
- **Zod Validation** (fail-fast on API changes)

### 🔒 Security

- **Type-Safe API** with tRPC
- **Environment Isolation** (no secrets in code)
- **Automated Backups** (7-day rotation)
- **Docker Containerization** (non-root user)

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development)
- PostgreSQL 16+
- Redis 7+

### One-Command Production Setup

```bash
# Clone the repository
git clone https://github.com/your-org/skaidrus-seimas-demo.git
cd skaidrus-seimas-demo

# Copy environment template
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose exec app npm run db:push

# Sync initial data from Seimas API
docker-compose exec app npm run sync:mps
docker-compose exec app npm run sync:votes
docker-compose exec app npm run sync:bills
docker-compose exec app npm run calc:scores

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

The application will be available at `http://localhost:3000`.

### Local Development

```bash
# Install dependencies
pnpm install

# Start PostgreSQL and Redis (if not using Docker)
# Or use: docker-compose up postgres redis -d

# Run development server
npm run dev

# Run tests
npm run test

# Type check
npm run check
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable            | Required | Description                                      |
| ------------------- | -------- | ------------------------------------------------ |
| `DATABASE_URL`      | ✅       | PostgreSQL connection string                     |
| `REDIS_URL`         | ✅       | Redis connection string                          |
| `PORT`              | ❌       | Server port (default: 3000)                      |
| `NODE_ENV`          | ❌       | Environment: `development`, `production`, `test` |
| `LOG_LEVEL`         | ❌       | Logging level: `debug`, `info`, `warn`, `error`  |
| `GEMINI_API_KEY`    | ❌       | Google Gemini API key (for AI features)          |
| `SENTRY_DSN`        | ❌       | Sentry error tracking DSN                        |
| `POSTGRES_USER`     | ✅       | Database username (Docker)                       |
| `POSTGRES_PASSWORD` | ✅       | Database password (Docker)                       |
| `POSTGRES_DB`       | ✅       | Database name (Docker)                           |

### Example `.env.example`

```env
# Database
DATABASE_URL=postgres://seimas:password@localhost:5432/seimas
POSTGRES_USER=seimas
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=seimas

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# AI (Optional)
GEMINI_API_KEY=your-gemini-api-key

# Error Tracking (Optional)
SENTRY_DSN=https://your-sentry-dsn
```

---

## 🛠️ Development

### Available Scripts

| Command                   | Description                     |
| ------------------------- | ------------------------------- |
| `npm run dev`             | Start development server        |
| `npm run build`           | Build for production            |
| `npm run start`           | Start production server         |
| `npm run check`           | TypeScript type checking        |
| `npm run test`            | Run test suite                  |
| `npm run format`          | Format code with Prettier       |
| `npm run db:push`         | Push schema changes to database |
| `npm run sync:mps`        | Sync MPs from Seimas API        |
| `npm run sync:votes`      | Sync voting records             |
| `npm run sync:bills`      | Sync legislation                |
| `npm run sync:committees` | Sync committee membership       |
| `npm run calc:scores`     | Calculate accountability scores |

### Project Structure

```
skaidrus-seimas-demo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   └── lib/            # Utilities & tRPC client
├── server/                 # Node.js backend
│   ├── _core/              # Express server setup
│   ├── services/           # Cache, rate limiter, Sentry
│   ├── schemas/            # Zod validation schemas
│   └── utils/              # Logger, errors, validation
├── drizzle/                # Database schema & migrations
├── scripts/                # Data sync & maintenance scripts
├── shared/                 # Shared types & constants
└── docs/                   # Documentation
```

---

## 📡 API Reference

The API is built with [tRPC](https://trpc.io/) for end-to-end type safety.

### Endpoints

| Procedure         | Description                     |
| ----------------- | ------------------------------- |
| `mps.list`        | List all MPs (with filters)     |
| `mps.byId`        | Get MP by ID with stats         |
| `mps.compare`     | Compare two MPs' voting records |
| `bills.list`      | List bills (paginated)          |
| `bills.byId`      | Get bill details with summary   |
| `committees.list` | List all committees             |
| `quiz.questions`  | Get quiz questions for a bill   |
| `dashboard.pulse` | Get real-time activity data     |

### Rate Limits

| Endpoint Type     | Limit   | Window |
| ----------------- | ------- | ------ |
| Read (MPs, Bills) | 100 req | 60 sec |
| Search            | 30 req  | 60 sec |
| Expensive Queries | 20 req  | 60 sec |
| Auth (Login)      | 5 req   | 60 sec |

---

## 📚 Data Sources

| Source                                                           | Type            | Update Frequency |
| ---------------------------------------------------------------- | --------------- | ---------------- |
| [Seimas Open Data](https://www.lrs.lt/sip/portal.show?p_r=35391) | Official        | Real-time        |
| [OpenSanctions](https://www.opensanctions.org/)                  | Cross-reference | Weekly           |

### Data Freshness

Run the monitoring script to check data freshness:

```bash
npm run monitor:freshness
```

---

## 🔒 Security

### Dependency Audit

```bash
# Check for vulnerabilities
npm audit

# Auto-fix (safe fixes only)
npm audit fix

# Check for secrets in git history
git log --all --full-history -- "*.env" ".env*"
```

### Secret Scrubbing (if needed)

If `.env` or secrets were accidentally committed:

```bash
# Install BFG Repo-Cleaner
brew install bfg

# Remove .env files from history
bfg --delete-files .env

# Remove API keys from history (replace YOUR_KEY with pattern)
bfg --replace-text patterns.txt

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ Coordinate with team!)
git push --force
```

### Security Checklist

- ✅ No secrets in code (environment variables only)
- ✅ PII redaction in logs (Pino configuration)
- ✅ Rate limiting on all endpoints
- ✅ Input validation (Zod schemas)
- ✅ Non-root Docker user
- ✅ Dependency audit in CI

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Lithuanian Parliament (Seimas)](https://www.lrs.lt/) for open data APIs
- [OpenSanctions](https://www.opensanctions.org/) for sanctions data
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database access
- [tRPC](https://trpc.io/) for end-to-end type safety

---

<div align="center">

**[Report Bug](https://github.com/your-org/skaidrus-seimas-demo/issues) · [Request Feature](https://github.com/your-org/skaidrus-seimas-demo/issues) · [Documentation](https://docs.example.com)**

Made with ❤️ for transparency in democracy

</div>
