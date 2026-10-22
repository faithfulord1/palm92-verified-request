const test = require('node:test');
const assert = require('node:assert/strict');
const {redact, buildPack, MODES, STATUSES, statusMeaning} = require('../public/core.js');

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
  const pack = buildPack({mode:'job',title:'Demo',claim:'offer',request:'fee',status:'INSUFFICIENT EVIDENCE',sources:[{name:'Companies House',url:'https://find-and-update.company-information.service.gov.uk/',checked:true,note:'Checked'}],decision:'VERIFY THROUGH AN OFFICIAL CHANNEL'});
  assert.equal(pack.humanInTheLoop, true);
  assert.equal(pack.sourcesChecked[0].checkedByUser, true);
  assert.equal(pack.privacy.remoteSubmission, false);
  assert.equal(pack.humanDecision, 'VERIFY THROUGH AN OFFICIAL CHANNEL');
});
test('sanitised Case Study 001 avoids private identity material', () => {
  const fs=require('node:fs'); const html=fs.readFileSync('public/index.html','utf8'); const app=fs.readFileSync('public/app.js','utf8');
  assert.match(html, /299 strangers/); assert.match(app, /£200 would supposedly become £4,000/);
  assert.doesNotMatch(html+app, /\+44\s?7\d{3}|@|chat\.whatsapp\.com\//);
});
