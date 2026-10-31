'use strict';
const assert = require('assert');
const { verifyAgainstRegistry, evaluateCases } = require('../src/verification-engine');

const registry = { emails:['finance@example.org'], phones:['+442071234567'], paymentDestinations:['GB00 PALM 9200'] };

const verified = verifyAgainstRegistry({ senderEmail:'finance@example.org', message:'Invoice confirmation' }, registry);
assert.equal(verified.status, 'VERIFIED');
assert.equal(verified.requiresHumanReview, false);

const conflict = verifyAgainstRegistry({ senderEmail:'attacker@evil.test', message:'URGENT send money now' }, registry);
assert.equal(conflict.status, 'CONFLICT');
assert.equal(conflict.requiresHumanReview, true);

const suite = evaluateCases([
  { id:'verified-email', input:{senderEmail:'finance@example.org', message:'Invoice confirmation'}, registry, expected:'VERIFIED' },
  { id:'conflicting-email', input:{senderEmail:'attacker@evil.test', message:'Please confirm'}, registry, expected:'CONFLICT' },
  { id:'risky-matched-channel', input:{senderEmail:'finance@example.org', message:'URGENT pay now'}, registry, expected:'HUMAN_REVIEW' },
  { id:'unknown', input:{message:'Can you check this?'}, registry, expected:'INSUFFICIENT_EVIDENCE' }
]);
assert.equal(suite.accuracy, 1);
console.log(JSON.stringify(suite, null, 2));
