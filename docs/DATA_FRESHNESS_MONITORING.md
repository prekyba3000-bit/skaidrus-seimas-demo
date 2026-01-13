# Data Freshness Monitoring

## What this does

- Checks max `updatedAt` timestamps for MPs, bills, votes, stats, and committees.
- Exits with non-zero code when any dataset is stale (thresholds below).
- Optionally sends a webhook alert when data is stale.

## Thresholds

- MPs / Bills: 24h
- Votes: 72h
- Stats: 7d
- Committees: 30d

## How to run locally

```bash
pnpm tsx scripts/monitor-data-freshness.ts
```

## Alerts

Set `ALERT_WEBHOOK_URL` to post a JSON payload when stale data is detected (Slack-compatible).

Example payload:

```json
{
  "text": "🚨 Data freshness alert",
  "status": {
    "mps": { "status": "STALE", "age": "30h", ... }
  },
  "timestamp": "2026-01-12T10:00:00Z"
}
```

## Suggested automation

- **Cron/Task Scheduler**: Run hourly with env `ALERT_WEBHOOK_URL`.
- **CI (GitHub Actions)**: Add a scheduled workflow:

```yaml
name: monitor-data-freshness
on:
  schedule:
    - cron: "0 * * * *" # hourly
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsx scripts/monitor-data-freshness.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ALERT_WEBHOOK_URL: ${{ secrets.ALERT_WEBHOOK_URL }}
```
