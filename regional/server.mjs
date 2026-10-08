import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const tools = [
  { name: 'create_request', description: 'Record a user-supplied claim and evidence note. No independent identity verification or external action.', inputSchema: { type: 'object', properties: { claim: { type: 'string' }, source: { type: 'string' }, evidence: { type: 'string' } }, required: ['claim', 'source'] }, annotations: { readOnlyHint: false, destructiveHint: false } },
  { name: 'get_request', description: 'Read one owned request and its decision history.', inputSchema: { type: 'object', properties: { request_id: { type: 'string' } }, required: ['request_id'] }, annotations: { readOnlyHint: true } },
  { name: 'assess_request', description: 'Save a user-supplied assessment. No independent verification occurs.', inputSchema: { type: 'object', properties: { request_id: { type: 'string' }, assessment: { type: 'string' } }, required: ['request_id', 'assessment'] }, annotations: { readOnlyHint: false, destructiveHint: false } },
  { name: 'record_decision', description: 'Sensitive write: record an exact human decision and scope after fresh approval. No external action is executed.', inputSchema: { type: 'object', properties: { request_id: { type: 'string' }, decision: { type: 'string', enum: ['approved', 'rejected'] }, scope: { type: 'string' } }, required: ['request_id', 'decision', 'scope'] }, annotations: { readOnlyHint: false, destructiveHint: false } },
];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const valid = (v, n) => typeof v === 'string' && v.trim().length > 0 && v.length <= n;
const bodyText = value => ({ content: [{ type: 'text', text: JSON.stringify(value) }] });
const rpc = (id, result) => ({ jsonrpc: '2.0', id, result });
const error = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

function config(env) {
  const base = env.SUPABASE_URL?.replace(/\/$/, '');
  const key = env.SUPABASE_PUBLISHABLE_KEY;
  if (!base || !/^https:\/\/[^/]+\.supabase\.co$/.test(base) || !key) throw new Error('Regional database is not configured');
  return { base, key };
}
async function userFor(token, env, fetcher) {
  const { base, key } = config(env);
  const res = await fetcher(`${base}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
  if (!res.ok) return null;
  const user = await res.json();
  return uuid.test(user?.id || '') ? user : null;
}
async function db(method, path, token, data, env, fetcher) {
  const { base, key } = config(env);
  const res = await fetcher(`${base}/rest/v1/verified_requests${path}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  if (!res.ok) throw new Error(`Database status ${res.status}`);
  return res.status === 204 ? [] : res.json();
}
const recordPath = (id, version) => `?id=eq.${encodeURIComponent(id)}${version ? `&version=eq.${version}` : ''}&select=*`;

export async function handle(request, env = process.env, fetcher = fetch) {
  const url = new URL(request.url);
  const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
  const reply = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { ...headers, ...extra } });
  if (url.pathname === '/health') return reply({ status: 'ok' });
  if (url.pathname === '/.well-known/oauth-protected-resource/mcp') {
    try { return reply({ resource: `${url.origin}/mcp`, authorization_servers: [`${config(env).base}/auth/v1`] }); }
    catch { return reply({ error: 'Service unavailable' }, 503); }
  }
  if (url.pathname !== '/mcp') return reply({ error: 'Not found' }, 404);
  if (request.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);
  const challenge = `Bearer resource_metadata="${url.origin}/.well-known/oauth-protected-resource/mcp"`;
  const bearer = /^Bearer (\S+)$/i.exec(request.headers.get('Authorization') || '');
  if (!bearer) return reply({ error: 'Authentication required' }, 401, { 'WWW-Authenticate': challenge });
  let owner;
  try { owner = await userFor(bearer[1], env, fetcher); }
  catch { return reply({ error: 'Authentication unavailable' }, 503); }
  if (!owner) return reply({ error: 'Invalid authorization' }, 401, { 'WWW-Authenticate': challenge });
  let input;
  try { input = await request.json(); }
  catch { return reply(error(null, -32700, 'Invalid JSON')); }
  if (input?.jsonrpc !== '2.0' || typeof input.method !== 'string') return reply(error(input?.id ?? null, -32600, 'Invalid request'));
  const { id, method, params = {} } = input;
  if (method === 'initialize') return reply(rpc(id, { protocolVersion: '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'Palm92 Verified Request Regional', version: '0.1.0' } }));
  if (method === 'notifications/initialized') return new Response(null, { status: 202 });
  if (method === 'tools/list') return reply(rpc(id, { tools }));
  if (method !== 'tools/call') return reply(error(id, -32601, 'Method not found'));
  const name = params?.name, a = params?.arguments || {};
  if (!tools.some(t => t.name === name)) return reply(error(id, -32602, 'Unknown tool'));
  const token = bearer[1], now = new Date().toISOString();
  try {
    if (name === 'create_request') {
      if (!valid(a.claim, 4000) || !valid(a.source, 500) || (a.evidence !== undefined && (typeof a.evidence !== 'string' || a.evidence.length > 8000))) return reply(error(id, -32602, 'Invalid input'));
      const requestId = randomUUID();
      const rows = await db('POST', '?select=id,status,created_at', token, {
        id: requestId, owner_id: owner.id, claim: a.claim.trim(), source: a.source.trim(), evidence: a.evidence || '',
        history: [{ kind: 'created', at: now }], created_at: now, updated_at: now,
      }, env, fetcher);
      return reply(rpc(id, bodyText({ request_id: rows[0].id, status: rows[0].status, created_at: rows[0].created_at, verification: 'not independently verified' })));
    }
    if (!uuid.test(a.request_id || '')) return reply(error(id, -32602, 'Invalid request ID'));
    const rows = await db('GET', recordPath(a.request_id), token, undefined, env, fetcher);
    const row = rows[0];
    if (!row) return reply(rpc(id, { ...bodyText({ error: 'Not found' }), isError: true }));
    if (name === 'get_request') return reply(rpc(id, bodyText({ request: row, verification: 'not independently verified' })));
    let changes, event;
    if (name === 'assess_request') {
      if (!valid(a.assessment, 8000) || ['approved', 'rejected'].includes(row.status)) return reply(error(id, -32602, 'Invalid assessment or terminal status'));
      changes = { assessment: a.assessment.trim(), status: 'awaiting_approval', decision_scope: '' };
      event = { kind: 'assessment', detail: a.assessment.trim(), at: now };
    } else {
      if (row.status !== 'awaiting_approval' || !['approved', 'rejected'].includes(a.decision) || !valid(a.scope, 2000)) return reply(error(id, -32602, 'Decision requires an assessed request and exact scope'));
      changes = { status: a.decision, decision_scope: a.scope.trim() };
      event = { kind: a.decision, detail: a.scope.trim(), at: now };
    }
    const updated = await db('PATCH', recordPath(row.id, row.version), token, {
      ...changes, history: [...row.history, event], version: row.version + 1, updated_at: now,
    }, env, fetcher);
    if (!updated.length) return reply(rpc(id, { ...bodyText({ error: 'Record changed; refresh and retry' }), isError: true }));
    return reply(rpc(id, bodyText({ request_id: row.id, status: updated[0].status, scope: updated[0].decision_scope, external_action: 'none', updated_at: now })));
  } catch {
    return reply(error(id, -32603, 'Service temporarily unavailable'));
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  createServer(async (req, res) => {
    const chunks = [];
    try {
      for await (const chunk of req) {
        chunks.push(chunk);
        if (chunks.reduce((n, b) => n + b.length, 0) > 20000) { res.writeHead(413); res.end(); return; }
      }
      const proto = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const url = `${proto}://${req.headers.host || 'localhost'}${req.url}`;
      const response = await handle(new Request(url, { method: req.method, headers: req.headers, ...(req.method === 'POST' ? { body: Buffer.concat(chunks) } : {}) }));
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch { res.writeHead(500); res.end(); }
  }).listen(Number(process.env.PORT || 3000), '0.0.0.0');
}
