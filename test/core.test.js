const test = require('node:test');
const assert = require('node:assert/strict');
const {redact, validateCase, buildPack, MODES, STATUSES, statusMeaning} = require('../public/core.js');

test('all six ScamShield modes are present', () => assert.equal(MODES.length, 6));
test('four evidence statuses are defined and qualified', () => {
  assert.equal(STATUSES.length, 4);
  assert.match(statusMeaning('NO MATERIAL RISK DETECTED'), /not a guarantee/i);
});
test('redaction masks emails, phone numbers, invite links and supplied names', () => {
  const output = redact('Contact Jane Doe at jane@example.com or +44 7700 900123 https://chat.whatsapp.com/secret', ['Jane Doe']);
  assert.doesNotMatch(output, /Jane Doe|jane@example\.com|7700 900123|whatsapp\.com\/secret/);
  assert.match(output, /REDACTED/);
});
test('Evidence Pack keeps human decision and source-check provenance distinct', () => {
  const pack = buildPack({mode:'job',title:'Demo',claim:'offer',request:'fee',evidence:'Screenshot records the offer only.',status:'INSUFFICIENT EVIDENCE',sources:[{name:'Companies House',url:'https://find-and-update.company-information.service.gov.uk/',checked:true,note:'Checked'}],decision:'VERIFY THROUGH AN OFFICIAL CHANNEL'});
  assert.equal(pack.humanInTheLoop, true);
  assert.equal(pack.sourcesChecked[0].checkedByUser, true);
  assert.equal(pack.privacy.remoteSubmission, false);
  assert.equal(pack.humanDecision, 'VERIFY THROUGH AN OFFICIAL CHANNEL');
});
test('every Evidence Pack requires a claim, evidence scope and human decision', () => {
  const result = validateCase({mode:'job',status:'LIKELY RISK'});
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, [
    'Record the claim before exporting.',
    'Record what the evidence actually proves before exporting.',
    'Record a human decision before exporting.'
  ]);
});
test('conclusive risk status fails closed without a documented authoritative check', () => {
  const input = {mode:'pay',claim:'Guaranteed return',evidence:'Message screenshot',status:'VERIFIED RISK',decision:'DO NOT PAY OR ENGAGE'};
  assert.throws(() => buildPack(input), error => error.name === 'ScamShieldValidationError' && /authoritative source/.test(error.message));
  input.sources = [{name:'FCA Firm Checker',url:'https://www.fca.org.uk/consumers/fca-firm-checker',checked:true,note:'No result recorded'}];
  assert.doesNotThrow(() => buildPack(input));
});
test('no-material-risk status also requires a documented authoritative check', () => {
  const input = {mode:'business',claim:'Supplier invoice',evidence:'Invoice copy',status:'NO MATERIAL RISK DETECTED',decision:'PROCEED WITH CAUTION',sources:[{name:'Companies House',checked:true,note:'   '} ]};
  const result = validateCase(input);
  assert.equal(result.valid, false);
  assert.match(result.errors.at(-1), /authoritative source/);
});
test('provisional risk can be exported offline when limitations and human decision are recorded', () => {
  const input = {mode:'social',claim:'Exceptional return',evidence:'Screenshot proves the claim was made only.',status:'LIKELY RISK',decision:'DO NOT PAY OR ENGAGE'};
  assert.equal(validateCase(input).valid, true);
  assert.equal(buildPack(input).status, 'LIKELY RISK');
});
test('invalid modes and statuses are rejected', () => {
  const result = validateCase({mode:'unknown',claim:'x',evidence:'y',status:'SAFE',decision:'REVIEWED'});
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /valid ScamShield mode.*valid evidence status/);
});
test('sanitised Case Study 001 avoids private identity material', () => {
  const fs=require('node:fs'); const html=fs.readFileSync('public/index.html','utf8'); const app=fs.readFileSync('public/app.js','utf8');
  assert.match(html, /299 strangers/); assert.match(app, /£200 would supposedly become £4,000/);
  assert.doesNotMatch(html+app, /\+44\s?7\d{3}|@|chat\.whatsapp\.com\//);
});
test('local preview server blocks path traversal and sets security headers', async () => {
  const {spawn} = require('node:child_process'); const port=3217;
  const child=spawn(process.execPath,['preview-server.js'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
  try {
    let home; for(let i=0;i<30;i++){try{home=await fetch(`http://127.0.0.1:${port}/`);break}catch{await new Promise(r=>setTimeout(r,50));}}
    assert.equal(home.status,200); assert.match(home.headers.get('content-security-policy'),/connect-src 'none'/);
    const blocked=await fetch(`http://127.0.0.1:${port}/%2e%2e/package.json`); assert.ok([403,404].includes(blocked.status));
    const post=await fetch(`http://127.0.0.1:${port}/`,{method:'POST'}); assert.equal(post.status,405);
  } finally {child.kill();}
});
