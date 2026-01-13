# User Feedback (Data Discrepancy Reports)

## What was added

- New table `user_feedback` with full RLS (users can only see/manage their own submissions).
- tRPC router `feedback.submit` (protected) to collect reports.
- DB helper `submitUserFeedback` for reuse in services.

## tRPC Usage

```ts
// client example
const submit = trpc.feedback.submit.useMutation();
submit.mutate({
  category: "data_discrepancy",
  message: "MP vote count looks off for bill #123",
  metadata: { billId: 123, expected: 42, actual: 41 },
});
```

## Payload

- `category` (string, default `data_discrepancy`)
- `message` (5-2000 chars)
- `metadata` (optional JSON object for context)

## Storage

Table: `user_feedback`

- `user_id` (string)
- `category` (string)
- `message` (text)
- `metadata` (jsonb)
- `created_at` (timestamp)

## Security

- RLS enforced with `app.current_user_id`.
- Policies: select/insert/update/delete are scoped to the authenticated user.

## Next steps (optional)

- Add admin review UI for feedback triage.
- Add notifications/alerts when new feedback arrives.
- Integrate into UI (e.g., “Report data issue” button on MP/Bill pages).
