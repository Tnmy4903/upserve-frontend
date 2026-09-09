# Upserve frontend release checklist

Run from `frontend/`:

```bash
npm ci
npm run verify
```

`verify` runs the typecheck, source formatting check, dependency-free quality tests, and production build. Set `VITE_API_BASE_URL` to the deployed FastAPI origin before the production build; never place credentials, tokens, or provider keys in frontend environment variables.

## Smoke test before release

- Login works for Super Admin, Sub Admin, and Client; each role sees only its intended navigation.
- Lead conversion, optional requirement creation, quotation send/revision/rejection/acceptance, project delivery, invoice generation, and payment confirmation complete with the expected success or failure state.
- Client can create a requirement with no attachment or one supported attachment; Super Admin can open the requirement from its detail/lead context, download the attachment, approve it, or request changes.
- Unsupported/executable requirement files and files over 10 MB are rejected with an actionable message; replacing an attachment does not leave the previous file accessible.
- Quotation emails include the detailed PDF attachment; authorized clients can download the latest quotation PDF from the dashboard, and Admin can create a new quotation after client rejection.
- Empty, long-text, invalid-input, partial-data, and API-failure states are readable on mobile and desktop.
- Direct refreshes work on `/app`, detail routes, and public article/portfolio routes through SPA history fallback.
- Public contact/blog/portfolio forms and file/PDF downloads are verified in the deployed environment.
- Email provider domain/sender configuration is verified in the backend; no test-mode recipient restriction remains.

## Rollback plan

Keep the previous frontend artifact and deployment identifier until the smoke test is complete. If a P0/P1 issue appears, restore the previous artifact, record the failing route and API response, then redeploy the fix through `npm run verify`. Do not roll back by changing database data.

## Operator notes

- The frontend is not an authorization boundary; the backend remains authoritative.
- A rendering failure is contained by the app-level error boundary and offers retry/dashboard recovery.
- API failures are shown as actionable page-level feedback; refresh and retry after checking the backend health and configured API origin.
