# Railway production seed checklist

Follow these steps in order. Steps 1–3 are done in the **Railway Dashboard**; step 4 is a local `curl` check.

---

## 1. Trigger seeding

1. Open [Railway Dashboard](https://railway.app/dashboard) → your project → **skaidrus-seimas-demo** service.
2. Go to **Settings** → **Deploy**.
3. Find **Custom Start Command**.
4. Set it to:
   ```bash
   pnpm run db:push && pnpm run seed:real
   ```
5. Save and **trigger a deploy** (or push a commit so Railway redeploys).
6. The service will run migrations, seed MPs/bills/activities, then **exit**. The deployment may show as “crashed” — that’s expected for this one-off seed run.

---

## 2. Monitor logs

1. In the same service, open **Deployments** → select the latest deployment → **View Logs**.
2. Wait until you see:
   ```
   ╔════════════════════════════════════════════════════════════╗
   ║                    ✅ SEEDING COMPLETE                     ║
   ╚════════════════════════════════════════════════════════════╝
   ```
   and MP/bill counts.
3. Only then continue to step 3.

---

## 3. Restore application

1. Go back to **Settings** → **Deploy** → **Custom Start Command**.
2. Either **clear** the field (to use `npm start` from `package.json`) **or** set it to:
   ```bash
   node dist/index.js
   ```
3. Save and **trigger a new deploy**.
4. Wait for the deployment to succeed. The app will now run normally with the seeded data.

---

## 4. Final verification

Run locally:

```bash
curl -s "https://skaidrus-seimas-demo-production.up.railway.app/api/trpc/mps.list?batch=1&input=%7B%220%22%3A%7B%22isActive%22%3Atrue%7D%7D" | jq '.[0].result.data | length'
```

- **Expected:** `141` (or similar), i.e. number of MPs.
- **If you see an error or `null`:** Check Railway logs for DB/seeding errors and ensure step 3 was applied (app running again).

Quick sanity check (no `jq`):

```bash
curl -s "https://skaidrus-seimas-demo-production.up.railway.app/api/trpc/mps.list?batch=1&input=%7B%220%22%3A%7B%22isActive%22%3Atrue%7D%7D" | head -c 500
```

You should see JSON with `"result":{"data":[...]}` and MP objects, not `"error"` or `[]`.

---

## Summary

| Step | Action | Where |
|------|--------|--------|
| 1 | Set Custom Start → `pnpm run db:push && pnpm run seed:real` | Railway Dashboard |
| 2 | Wait for logs: `SEEDING COMPLETE` | Railway Deployments → Logs |
| 3 | Clear Custom Start or set → `node dist/index.js` | Railway Dashboard |
| 4 | Run `curl` above | Your terminal |
