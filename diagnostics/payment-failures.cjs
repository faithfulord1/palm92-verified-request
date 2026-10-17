// Explicit diagnostic gate, not a passing regression test or live PayPal test.
// Run: node diagnostics/payment-failures.cjs
// Exit 1 means at least one safety expectation remains unmet.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {Readable} = require('node:stream');

const source = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
const operator = 'fictional-payment-probe-token-at-least-32-bytes';
const privateMarker = 'FICTIONAL_PROVIDER_PRIVATE_DETAIL';
const success = data => ({ok: true, status: 200, json: async () => data});
const scenarios = [
  {name: 'missing_credentials', env: {PAYPAL_CLIENT_SECRET: ''}},
  {name: 'oauth_rejected', oauth: {ok: false, status: 401}},
  {name: 'order_rejected', order: {ok: false, status: 422, json: async () => ({message: privateMarker})}},
  {name: 'order_transport_failure', order: () => {throw new Error(privateMarker);}},
  {name: 'order_invalid_json', order: {ok: true, status: 200, json: async () => {throw new Error(privateMarker);}}},
  {name: 'order_missing_id', order: success({status: 'CREATED'})},
  {name: 'rejection_control', decision: 'REJECT'}
];

async function inspect(scenario) {
  let handler;
  const calls = [];
  // Isolation is for deterministic testing, not a sandbox for untrusted code.
  vm.runInNewContext(source, {
    require(name) {
      if (name === 'http') return {createServer(fn) {
        handler = fn;
        return {listen() {}};
      }};
      if (['fs', 'path', 'crypto'].includes(name)) return require(name);
      throw new Error(`Unexpected dependency: ${name}`);
    },
    process: {env: {
      ADMIN_API_TOKEN: operator,
      PAYPAL_CLIENT_ID: 'fictional-client',
      PAYPAL_CLIENT_SECRET: 'fictional-secret',
      ...scenario.env
    }},
    Buffer, URL, __dirname: path.join(__dirname, '..'), console: {log() {}},
    async fetch(url) {
      calls.push(url);
      let response;
      if (url === 'https://api-m.sandbox.paypal.com/v1/oauth2/token') {
        response = scenario.oauth || success({access_token: 'fictional-access'});
      } else if (url === 'https://api-m.sandbox.paypal.com/v2/checkout/orders') {
        response = scenario.order || success({id: 'FICTIONAL-ORDER', status: 'CREATED'});
      } else {
        throw new Error('Unexpected destination');
      }
      return typeof response === 'function' ? response() : response;
    }
  }, {filename: 'server.js'});
  assert.equal(typeof handler, 'function');

  async function request(url, payload) {
    const req = Readable.from(payload ? [JSON.stringify(payload)] : []);
    Object.assign(req, {
      url, method: payload ? 'POST' : 'GET',
      headers: {authorization: `Bearer ${operator}`}
    });
    let status;
    return new Promise((resolve, reject) => {
      Promise.resolve(handler(req, {
        writeHead(code) {status = code;},
        end(text) {resolve({status, body: JSON.parse(text)});}
      })).catch(reject);
    });
  }

  const decision = await request('/api/decision', {
    decision: scenario.decision || 'APPROVE', amount: 10,
    request: 'Fictional provider failure probe'
  });
  const audit = await request('/api/audit');
  assert.equal(audit.status, 200);
  assert.equal(audit.body.records.length, 1);
  const record = audit.body.records[0];
  const failures = [];
  if (scenario.decision === 'REJECT') {
    if (decision.status !== 200 || record.status !== 'REJECTED_NO_PAYMENT' || calls.length !== 0) {
      failures.push('rejection_must_not_call_provider');
    }
  } else {
    if (decision.status < 400) failures.push('provider_failure_must_not_report_success');
    if (['APPROVED_PENDING_PAYPAL', 'PAYPAL_ORDER_CREATED'].includes(record.status)) {
      failures.push('audit_must_distinguish_failure_or_unknown_outcome');
    }
    if (JSON.stringify(decision.body).includes(privateMarker)) {
      failures.push('raw_provider_details_must_not_reach_client');
    }
  }
  return {
    scenario: scenario.name, httpStatus: decision.status,
    auditStatus: record.status, providerCalls: calls.length,
    result: failures.length ? 'UNMET' : 'PASS', failures
  };
}

(async () => {
  const results = [];
  for (const scenario of scenarios) results.push(await inspect(scenario));
  const unmet = results.filter(result => result.result === 'UNMET').length;
  console.log(JSON.stringify({
    mode: 'fictional-no-network', scenarios: results.length,
    passed: results.length - unmet, unmet, results
  }, null, 2));
  process.exitCode = unmet ? 1 : 0;
})().catch(() => {
  // Do not print potentially sensitive exception text from future changes.
  console.error('Diagnostic harness failed before completing all scenarios.');
  process.exitCode = 2;
});
