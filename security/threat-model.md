# Threat Model (Draft)

## Scope

- Backend: Express/tRPC, PostgreSQL (RLS), Redis, BullMQ workers.
- Frontend: React SPA (Vite), authentication flows, watchlist/personalization.
- Infrastructure: Dockerized deployment, HTTPS termination, rate limiting.

## Assets

- User identities (openId), watchlists, activity reads, bill/MP data.
- API keys (bill summaries), Redis cache contents, job queues.

## Trust Boundaries

- Client ↔ API gateway (tRPC/REST).
- API ↔ PostgreSQL (RLS-enforced).
- API ↔ Redis (rate limit + cache).
- Workers ↔ External Seimas APIs / AI services.

## Key Risks (to analyze)

- Bypass of RLS/authorization.
- Injection (SQL, template), XSS/CSRF.
- Rate-limit evasion / DoS.
- Data freshness poisoning (sync jobs).
- Supply chain (dependencies, CI artifacts).

## Controls (current/target)

- RLS + `SET LOCAL app.current_user_id`.
- Zod validation + tRPC type safety.
- Helmet/CSP/HSTS; rate limiting.
- CI tests (unit/integration/E2E) + planned accessibility/security audits.
- Logging/observability (Pino, Sentry).

## Next Steps

- Enumerate attack paths per asset.
- Map mitigations to ISO/IEC 27001 controls.
- Add abuse cases for notifications/bill following.
- Link automated security checks in CI.
