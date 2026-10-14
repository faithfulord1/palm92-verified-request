const test = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');

const token = 'test-operator-token-with-at-least-32-bytes';

async function withServer(extraEnv, fn) {
  const port = 31000 + Math.floor(Math.random() * 10000);
  const child = spawn(process.execPath, ['server.js'], {
    cwd: require('node:path').resolve(__dirname, '..'),
    env: {...process.env, PORT: String(port), ...extraEnv},
    stdio: 'ignore'
  });
  const url = `http://127.0.0.1:${port}`;
  try {
    for (let i = 0; i < 50; i++) {
      try { await fetch(url + '/api/health'); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 20)); }
    }
    await fn(url);
  } finally {
    child.kill();
  }
}

test('decision and audit fail closed when no token is configured', async () => {
  await withServer({ADMIN_API_TOKEN: ''}, async url => {
    const audit = await fetch(url + '/api/audit');
    assert.equal(audit.status, 401);
    const decision = await fetch(url + '/api/decision', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({decision: 'APPROVE', amount: 10})
    });
    assert.equal(decision.status, 401);
  });
});

test('operator token protects audit and rejection; production PayPal override is ignored', async () => {
  await withServer({ADMIN_API_TOKEN: token, PAYPAL_BASE_URL: 'https://api-m.paypal.com'}, async url => {
    const health = await (await fetch(url + '/api/health')).json();
    assert.equal(health.mode, 'sandbox');
    assert.equal(health.approvalConfigured, true);
    assert.equal((await fetch(url + '/api/audit')).status, 401);
    assert.equal((await fetch(url + '/api/audit', {headers: {Authorization: 'Bearer wrong'}})).status, 401);
    assert.equal((await fetch(url + '/api/audit', {headers: {Authorization: `Bearer ${token}`}})).status, 200);
    const rejected = await fetch(url + '/api/decision', {
      method: 'POST', headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
      body: JSON.stringify({decision: 'REJECT', amount: 10, request: 'fictional test'})
    });
    assert.equal(rejected.status, 200);
    assert.equal((await rejected.json()).record.status, 'REJECTED_NO_PAYMENT');
  });
});
