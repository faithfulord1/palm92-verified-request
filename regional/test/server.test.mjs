import test from 'node:test';
import assert from 'node:assert/strict';
import { handle } from '../server.mjs';

const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_PUBLISHABLE_KEY: 'public-key' };
const uid = 'e85a9a46-6fc8-4256-9404-52b74ab3bc59';
const request = (method, params) => new Request('https://regional.example/mcp', {
  method: 'POST', headers: { Authorization: 'Bearer caller-token', 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
});

test('requires a bearer token and advertises the protected resource', async () => {
  const response = await handle(new Request('https://regional.example/mcp', { method: 'POST' }), env);
  assert.equal(response.status, 401);
  assert.match(response.headers.get('WWW-Authenticate'), /oauth-protected-resource\/mcp/);
  const metadata = await handle(new Request('https://regional.example/.well-known/oauth-protected-resource/mcp'), env);
  assert.deepEqual(await metadata.json(), { resource: 'https://regional.example/mcp', authorization_servers: ['https://example.supabase.co/auth/v1'] });
});

test('rejects a token the auth provider cannot validate', async () => {
  const response = await handle(request('tools/list'), env, async () => new Response('{}', { status: 401 }));
  assert.equal(response.status, 401);
});

test('writes with caller token and owner, then returns an unverified record', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/auth/v1/user')) return Response.json({ id: uid });
    return Response.json([{ id: '407a523e-2811-40e7-a57c-a7f31869f304', status: 'needs_review', created_at: '2026-10-08T00:00:00Z' }]);
  };
  const response = await handle(request('tools/call', { name: 'create_request', arguments: { claim: 'A claim', source: 'User' } }), env, fetcher);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.match(result.result.content[0].text, /not independently verified/);
  assert.equal(calls[1].options.headers.Authorization, 'Bearer caller-token');
  assert.equal(JSON.parse(calls[1].options.body).owner_id, uid);
});

test('does not write when an owned record is absent', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push(options?.method || 'GET');
    return url.endsWith('/auth/v1/user') ? Response.json({ id: uid }) : Response.json([]);
  };
  const response = await handle(request('tools/call', { name: 'record_decision', arguments: { request_id: uid, decision: 'approved', scope: 'one item' } }), env, fetcher);
  const result = await response.json();
  assert.equal(result.result.isError, true);
  assert.deepEqual(calls, ['GET', 'GET']);
});
