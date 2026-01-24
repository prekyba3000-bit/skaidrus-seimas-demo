# Railway production seed checklist

Two ways to run the seed: **Pre-deploy** (recommended) or **Custom Start one-off**.

---

## Option A: Pre-deploy Command (recommended)

Seed runs **before** each deploy; the app then starts normally. No revert needed.

1. **Settings** → **Deploy** → **Pre-deploy Command**:
   ```bash
   pnpm run db:push && pnpm run seed:real
   ```
2. **Custom Start Command**: keep `node dist/index.js` (from `railway.json`). Do not override.
3. **Deploy**. Logs will show migrations, then seeding, then `✅ SEEDING COMPLETE`, then the app starting.
4. **Verify** with the [curl commands](#final-verification) below.

---

## Option B: Custom Start one-off (then revert)

Use only if you want to seed **once** and never on future deploys.

1. **Pre-deploy Command**: clear it (or leave empty).
2. **Custom Start Command**: set to `pnpm run db:push && pnpm run seed:real` (overrides `railway.json`).
3. **Deploy**. The service will seed then **exit** (deployment may show as crashed).
4. **Logs**: wait for `✅ SEEDING COMPLETE`.
5. **Revert**: set **Custom Start Command** back to `node dist/index.js` (or clear so `railway.json` applies).
6. **Deploy** again so the app runs.

---

## Start command and `railway.json`

**Custom Start Command** is read from `railway.json` → `deploy.startCommand` (`node dist/index.js`).  
If you override it in the Dashboard, the override wins. Clearing the override restores `railway.json`.

---

## Final verification

After a successful deploy (Option A or B):

```bash
# MP count (expect 141 or similar)
curl -s "https://skaidrus-seimas-demo-production.up.railway.app/api/trpc/mps.list?batch=1&input=%7B%220%22%3A%7B%22isActive%22%3Atrue%7D%7D" | jq '.[0].result.data.json | length'
```

Quick check (no `jq`):

```bash
curl -s "https://skaidrus-seimas-demo-production.up.railway.app/api/trpc/mps.list?batch=1&input=%7B%220%22%3A%7B%22isActive%22%3Atrue%7D%7D" | head -c 500
```

You should see `"result":{"data":{"json":[...]}}` with MP objects, not `"error"` or `"json":[]`.

---

## Summary

| Approach | Pre-deploy | Custom Start | Revert? |
|----------|------------|--------------|---------|
| **A (recommended)** | `pnpm run db:push && pnpm run seed:real` | `node dist/index.js` (railway.json) | No |
| **B (one-off)** | Clear | `pnpm run db:push && pnpm run seed:real` → then `node dist/index.js` | Yes |
