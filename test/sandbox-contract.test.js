const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {Readable} = require('node:stream');

// All values are fictional. This harness never inherits host credentials or
// opens sockets. It executes the real server handler with a stubbed PayPal API.
const operator = 'fictional-operator-token-at-least-32-bytes';
const source = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

function loadServer(env = {}) {
  let handler;
  const calls = [];
  vm.runInNewContext(source, {
    require(name) {
      if (name === 'http') return {createServer(fn) {
        handler = fn;
        return {listen() {}};
      }};
      if (['fs', 'path', 'crypto'].includes(name)) return require(name);
      throw new Error(`Unexpected server dependency: ${name}`);
    },
    process: {env: {
      ADMIN_API_TOKEN: operator,
      PAYPAL_CLIENT_ID: 'fictional-client',
      PAYPAL_CLIENT_SECRET: 'fictional-secret',
      PAYPAL_BASE_URL: 'https://api-m.paypal.com',
      ...env
    }},
    Buffer, URL, __dirname: path.join(__dirname, '..'),
    console: {log() {}},
    async fetch(url, options) {
      calls.push({url, options});
      if (url === 'https://api-m.sandbox.paypal.com/v1/oauth2/token') {
        return {ok: true, json: async () => ({access_token: 'fictional-access'})};
      }
      if (url === 'https://api-m.sandbox.paypal.com/v2/checkout/orders') {
        return {ok: true, json: async () => ({id: 'FICTIONAL-ORDER', status: 'CREATED', links: []})};
      }
      throw new Error('Unexpected outbound destination');
    }
  }, {filename: 'server.js'});
  assert.equal(typeof handler, 'function');
  return {
    calls,
    async request(url, {method = 'GET', authorization = `Bearer ${operator}`, payload} = {}) {
      const req = Readable.from(payload === undefined ? [] : [JSON.stringify(payload)]);
      Object.assign(req, {url, method, headers: authorization === null ? {} : {authorization}});
      let status, headers;
      return new Promise((resolve, reject) => {
        const res = {
          writeHead(code, values) { status = code; headers = values; },
          end(text) { resolve({status, headers, body: JSON.parse(text)}); }
        };
        Promise.resolve(handler(req, res)).catch(reject);
      });
    }
  };
}

test('approval calls only sandbox OAuth and order APIs despite production override', async () => {
  const server = loadServer();
  const result = await server.request('/api/decision', {
    method: 'POST', payload: {decision: 'APPROVE', amount: 12.34, currency: 'gbp', request: 'Fictional pilot'}
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.record.status, 'PAYPAL_ORDER_CREATED');
  assert.equal(result.body.record.paypalOrderId, 'FICTIONAL-ORDER');
  assert.deepEqual(server.calls.map(call => call.url), [
    'https://api-m.sandbox.paypal.com/v1/oauth2/token',
    'https://api-m.sandbox.paypal.com/v2/checkout/orders'
  ]);
  const order = JSON.parse(server.calls[1].options.body);
  assert.equal(order.purchase_units[0].amount.value, '12.34');
  assert.equal(order.purchase_units[0].amount.currency_code, 'GBP');
  assert.equal(server.calls[1].options.headers['PayPal-Request-Id'], result.body.record.id);
  const audit = await server.request('/api/audit');
  assert.equal(audit.body.records.length, 1);
  assert.equal(audit.body.records[0].paypalOrderId, 'FICTIONAL-ORDER');
});

test('rejection persists evidence without any outbound API call', async () => {
  const server = loadServer();
  const result = await server.request('/api/decision', {
    method: 'POST', payload: {decision: 'REJECT', amount: 10, evidence: 'Fictional mismatch'}
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.record.status, 'REJECTED_NO_PAYMENT');
  assert.equal(result.body.record.evidence, 'Fictional mismatch');
  assert.equal(result.body.record.paypalOrderId, undefined);
  assert.equal(server.calls.length, 0);
});

test('invalid bearer credentials cannot approve or read audit records', async () => {
  const server = loadServer();
  for (const authorization of [null, 'Basic fictional', 'Bearer wrong', `Bearer ${'x'.repeat(operator.length)}`]) {
    for (const url of ['/api/audit', '/api/decision']) {
      const result = await server.request(url, {
        authorization, method: url.endsWith('decision') ? 'POST' : 'GET',
        payload: {decision: 'APPROVE', amount: 10}
      });
      assert.equal(result.status, 401);
      assert.equal(result.headers['Cache-Control'], 'no-store');
      assert.equal(result.body.record, undefined);
    }
  }
  assert.equal((await server.request('/api/audit')).body.records.length, 0);
  assert.equal(server.calls.length, 0);
});

test('short server token fails closed even when the supplied token matches', async () => {
  const server = loadServer({ADMIN_API_TOKEN: 'too-short'});
  assert.equal((await server.request('/api/health')).body.approvalConfigured, false);
  for (const url of ['/api/audit', '/api/decision']) {
    assert.equal((await server.request(url, {
      authorization: 'Bearer too-short', method: url.endsWith('decision') ? 'POST' : 'GET',
      payload: {decision: 'APPROVE', amount: 10}
    })).status, 401);
  }
  assert.equal(server.calls.length, 0);
});

test('invalid decisions and amounts create neither orders nor audit records', async () => {
  const server = loadServer();
  for (const payload of [
    {decision: 'MAYBE', amount: 10},
    {decision: 'APPROVE', amount: 0},
    {decision: 'APPROVE', amount: -1},
    {decision: 'APPROVE', amount: 'not-a-number'}
  ]) {
    assert.equal((await server.request('/api/decision', {method: 'POST', payload})).status, 400);
  }
  assert.equal((await server.request('/api/audit')).body.records.length, 0);
  assert.equal(server.calls.length, 0);
});

test('health, decision and audit JSON do not disclose configured credentials', async () => {
  const server = loadServer();
  const responses = [await server.request('/api/health')];
  responses.push(await server.request('/api/decision', {
    method: 'POST', payload: {decision: 'APPROVE', amount: 10}
  }));
  responses.push(await server.request('/api/audit'));
  for (const response of responses) {
    const text = JSON.stringify(response.body);
    for (const secret of [operator, 'fictional-client', 'fictional-secret', 'fictional-access']) {
      assert.equal(text.includes(secret), false);
    }
    assert.equal(response.headers['Cache-Control'], 'no-store');
  }
});
