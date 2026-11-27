# SBMS Administrator Console

React/Vite console for authorized ServiceBook Management System (SBMS) administrators. It provides the platform overview, provider verification, user access, work-post moderation, issues, reports, activity logs, and platform settings/fees. The console uses the API configured by `src/api/axiosInstance.js` and does not include legacy workflows or local mock data. All protected routes require an admin OTP login.

## Admin API contract

The API is expected under `/api/v1`. List endpoints may return a JSON array directly or wrap it as `{ "data": [...] }` (the console also accepts `items`/`results` wrappers). Settings return an `items` collection; reports return aggregate counts in an object. Error responses include a useful `message`.

| Method | Path | Expected payload / behavior |
| --- | --- | --- |
| `GET` | `/admin/providers/verification` | List provider verification records. Records should include an `id` (or `_id`), provider identity, service category, verification status, and submitted date. |
| `PATCH` | `/admin/providers/verification` | `{ "id": "<record id>", "status": "VERIFIED" }` or `{ "id": "<record id>", "status": "REJECTED" }`. The update should persist the verification decision. |
| `GET` | `/admin/users` | List users with an identifier, name, phone, `role`, account status, and created date. |
| `PATCH` | `/admin/users/:id` | `{ "role": "client" \| "individual_provider" \| "company_staff" \| "broker" \| "support_agent" \| "admin" }` or `{ "status": "ACTIVE" \| "PENDING" \| "SUSPENDED" \| "TERMINATED" }` (single-field updates). |
| `GET` | `/admin/work-posts/moderation` | List work posts awaiting moderation, with an identifier, title, provider, category, description, status, and submission date. |
| `PATCH` | `/admin/work-posts/moderation` | `{ "id": "<record id>", "status": "PUBLISHED" }` or `{ "id": "<record id>", "status": "REJECTED" }`. Verified-job posts also require current client consent. |
| `GET` | `/admin/issues` | List issue/incident records with an identifier, title, reporter, type, priority, status, and reported date. |
| `PATCH` | `/admin/issues` | `{ "id": "<record id>", "status": "IN_PROGRESS" }`, `{ "id": "<record id>", "status": "RESOLVED" }`, or `{ "id": "<record id>", "status": "CLOSED" }`. |
| `GET` | `/admin/reports` | Return aggregate platform report counts. |
| `GET` | `/admin/activity-logs` | Return sensitive activity events to administrators only. |
| `GET` | `/admin/settings` | Return the current settings object, including platform policies and fee values. Nested objects are supported. |
| `PATCH` | `/admin/settings` | Accept the complete settings object returned by `GET`, including edits, and persist it. |

## Demo records

The API automatically uses its shared JSON fixture when PostgreSQL is
unavailable or its users table is empty. The admin login screen lists the demo
administrator account and OTP `123456`. Demo verification, moderation, issue,
user, and settings updates are simulated in API memory, are visible to the
other connected SBMS clients, and reset when the API restarts. A persistent
notice is shown while the console is receiving demo responses.

These are the methods and decision values the admin UI sends. If the API uses different field names, status enums, or response envelopes, update the centralized request layer in `src/api/services/adminService.js` and the response adapters in `src/pages/AdminConsole.jsx`.

## Development

```sh
npm install
npm run dev
npm run lint
npm run build
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` when the API is not available at the same origin under `/api/v1`. OTP issuance and verification are served by `/auth/send-otp` and `/auth/verify-otp`; the console only stores a session when the verified account has the `admin` role.
