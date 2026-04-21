# Beacon Glades Disc Golf

## Run Locally

1. Install dependencies: `bun install`
2. Create `.env.local` with the env vars listed below.
3. Run the app: `bun run dev`

## Admin auth

`/admin/*` is gated by [Auth.js v5](https://authjs.dev) with Google OAuth. Allowed
admins are hardcoded in `lib/admin-allowlist.ts` (JWT session, no DB). Add your
Google email to `ADMIN_EMAILS` and deploy to grant access.

### Required env vars (auth)

| Name | Description |
| --- | --- |
| `AUTH_SECRET` | Random 32+ byte secret. Generate with `openssl rand -base64 32`. |
| `AUTH_GOOGLE_ID` | Google OAuth 2.0 client ID. |
| `AUTH_GOOGLE_SECRET` | Google OAuth 2.0 client secret. |

On Vercel: set all three in Project Settings → Environment Variables. `AUTH_URL`
is auto-detected in v5, so no need to set it.

Google OAuth redirect URIs to authorize in Google Cloud Console:

- Dev: `http://localhost:3000/api/auth/callback/google`
- Prod: `https://<your-domain>/api/auth/callback/google`

## Lost and Found

Admin page: `/admin/lost-and-found`. Each entry is stored as a JSON file in
Vercel Blob (`items/<slug>.json`), keyed by an 8-character nanoid slug. A
settings document lives at `settings.json`.

Flow:

1. Admin creates an entry with the owner's name, phone, and a disc description.
2. If the phone normalizes to a continental-US `+1` number, the app texts the
   owner using the configurable template (see `/admin/settings`), substituting
   `{name}` and `{link}`. Non-continental-US or missing phone numbers are
   auto-marked **Donated** with no SMS sent.
3. The owner can open the link and pick **Saving**, **Donated**, or **Returned**
   and leave a note. Admin sees replies in the item detail sheet.
4. Inbound SMS replies hit `/api/twilio/inbound` — messages are appended to the
   matching item and it flashes an unread indicator in the admin table.
5. A daily Vercel Cron (`0 6 * * *`) runs `/api/cron/expire`, flipping any
   `active` item whose `expiresAt` has passed to `expired`.

### Required env vars (lost and found)

| Name | Description |
| --- | --- |
| `BLOB_READ_WRITE_TOKEN` | Auto-populated once the Vercel Blob store is linked. |
| `TWILIO_ACCOUNT_SID` | Twilio account SID. |
| `TWILIO_AUTH_TOKEN` | Twilio auth token (also used for inbound signature validation). |
| `TWILIO_FROM_NUMBER` | Sending phone number in E.164 (e.g. `+15555551234`). |
| `NEXT_PUBLIC_APP_URL` | Base URL used to build the `{link}` in outbound SMS (e.g. `https://beaconglades.com`). |
| `CRON_SECRET` | Bearer token that gates `/api/cron/expire`. Vercel sets this in its cron `Authorization` header automatically. |

### One-time setup

1. **Create the Blob store**
   - In the Vercel dashboard, create a Blob store and link it to the project,
     then run `vercel env pull` locally to grab `BLOB_READ_WRITE_TOKEN`.
2. **Set up Twilio**
   - Buy a phone number that supports SMS.
   - Set its **Messaging → "A message comes in"** webhook to
     `https://<your-domain>/api/twilio/inbound` (HTTP POST).
   - Copy the Account SID, Auth Token, and the phone number (in E.164) into
     Vercel env vars.
3. **Cron**
   - `vercel.json` already declares the daily cron. Set `CRON_SECRET` in env
     vars; Vercel will send it as `Authorization: Bearer …` automatically.
