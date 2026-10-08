# Palm92 Verified Request regional prototype

This is a separate MCP service prototype for a region-specific deployment. It has not been deployed or connected to Muse. The existing public Palm92 service remains the live endpoint.

## Behavior

The four tools record a caller's claim, retrieve the caller's request, save an assessment, and record an approval or rejection with exact scope. They do not independently verify identity, check evidence, transfer data, or carry out an external action. The word “verified” is a product name, not a claim about these operations.

The service validates a Supabase user bearer token at `/auth/v1/user` and sends that same token to PostgREST. Row level security limits reads and writes to the token owner. The publishable key is not a secret; do not use a service role key. `GET /health` verifies process availability only. The database must be provisioned before `/mcp` can operate.

## Setup required before deployment

1. Select an authorized Supabase organization and create a **new project whose primary region is Frankfurt (`eu-central-1`)**. Record the actual project region and account operator. Apply `schema.sql` in that project. Project creation may have billing consequences and is not part of this branch.
2. Configure Supabase Auth OAuth 2.1 server, its consent screen, client registration, redirect validation, and a test user. Review the resulting authorization server metadata with a real client. This repository does not provide those pieces. No Muse compatibility claim is made until end-to-end tests pass.
3. Create a Render web service from the repository root `render.yaml`, using its Frankfurt region. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` from the new project. Use a new service URL, then run an authenticated MCP smoke test and confirm the database region from the provider console.
4. Determine whether auth, logs, backups, support access, and every other processor meet the questionnaire's data location wording. A Frankfurt primary database alone does not establish that all data is stored or accessed in Germany or the EU.

`npm test` checks the auth challenge, token validation, and caller-scoped database requests. It does not test a real Supabase project or OAuth flow.

## Security limits

Authenticated users can call the underlying PostgREST API directly with their token and publishable key. The schema enforces ownership but does not make the history tamper proof or distinguish a human approval from an agent call. Do not use this prototype for binding decisions or represent its record as third-party verification. Production use needs a trusted approval flow, audit controls, rate limits, data retention policy, and end-to-end security review.
