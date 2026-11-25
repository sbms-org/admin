# SBMS Administrator Console

React/Vite console for authorized ServiceBook Management System (SBMS) administrators. The console uses the API configured by `src/api/axiosInstance.js`; it does not supply local or mock queue, report, or settings data. All protected routes require an admin OTP login.

## Admin API contract

The API is expected under the existing `/api/v1` base path. List endpoints may return a JSON array directly or wrap it as `{ "data": [...] }` (the console also accepts `items`/`results` wrappers). Settings return an object (optionally under `data` or `settings`) and reports return a list of report objects. Error responses should include a useful `message`.

| Method | Path | Expected payload / behavior |
| --- | --- | --- |
| `GET` | `/admin/providers/verification` | List provider verification records. Records should include an `id` (or `_id`), provider identity, service category, verification status, and submitted date. |
| `PATCH` | `/admin/providers/verification` | `{ "id": "<record id>", "status": "VERIFIED" }` or `{ "id": "<record id>", "status": "REJECTED" }`. The update should persist the verification decision. |
| `GET` | `/admin/users` | List users with an identifier, name, phone, `role`, account status, and created date. |
| `PATCH` | `/admin/users/:id` | `{ "role": "client" \| "provider" \| "admin" }` or `{ "status": "active" \| "suspended" \| "disabled" \| "pending" }` (single-field updates). |
| `GET` | `/admin/work-posts/moderation` | List work posts awaiting moderation, with an identifier, title, provider, category, description, status, and submission date. |
| `PATCH` | `/admin/work-posts/moderation` | `{ "id": "<record id>", "status": "APPROVED" }` or `{ "id": "<record id>", "status": "REJECTED" }`. |
| `GET` | `/admin/issues` | List issue/incident records with an identifier, title, reporter, type, priority, status, and reported date. |
| `PATCH` | `/admin/issues` | `{ "id": "<record id>", "status": "IN_PROGRESS" }`, `{ "id": "<record id>", "status": "RESOLVED" }`, or `{ "id": "<record id>", "status": "DISMISSED" }`. |
| `GET` | `/admin/reports` | Return live platform report objects as a list; each object's scalar fields are displayed without synthesized data. |
| `GET` | `/admin/activity-logs` | Return sensitive activity events to administrators only. |
| `GET` | `/admin/settings` | Return the current settings object, including platform policies and fee values. Nested objects are supported. |
| `PATCH` | `/admin/settings` | Accept the complete settings object returned by `GET`, including edits, and persist it. |

These are the methods and decision values the admin UI sends. If the API uses different field names, status enums, or response envelopes, update the centralized request layer in `src/api/services/adminService.js` and the response adapters in `src/pages/AdminConsole.jsx`.

## Development

```sh
npm install
npm run dev
npm run lint
npm run build
```

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` for the deployment. OTP issuance and verification are served by `/auth/send-otp` and `/auth/verify-otp`; the console only stores a session when the verified account has the `admin` role.
