'use strict';

const crypto = require('crypto');

const HIGH_RISK_TERMS = ['urgent','immediately','secret','gift card','crypto','bitcoin','wire transfer','send money','pay now','password','otp','one time code'];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function extractSignals(input = {}) {
  const text = normalize([input.message, input.request, input.evidence].filter(Boolean).join(' '));
  const urls = text.match(/https?:\/\/[^\s]+/g) || [];
  const emails = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g) || [];
  const phones = text.match(/(?:\+?\d[\d\s()-]{7,}\d)/g) || [];
  const matchedRiskTerms = HIGH_RISK_TERMS.filter(term => text.includes(term));
  return { text, urls, emails, phones, matchedRiskTerms };
}

function verifyAgainstRegistry(input = {}, registry = {}) {
  const signals = extractSignals(input);
  const expected = {
    domains: (registry.domains || []).map(normalize),
    emails: (registry.emails || []).map(normalize),
    phones: (registry.phones || []).map(normalize),
    paymentDestinations: (registry.paymentDestinations || []).map(normalize)
  };
  const suppliedEmail = normalize(input.senderEmail);
  const suppliedPhone = normalize(input.senderPhone);
  const suppliedDestination = normalize(input.paymentDestination);
  const emailMatch = suppliedEmail ? expected.emails.includes(suppliedEmail) : null;
  const phoneMatch = suppliedPhone ? expected.phones.includes(suppliedPhone) : null;
  const paymentMatch = suppliedDestination ? expected.paymentDestinations.includes(suppliedDestination) : null;
  const observed = [emailMatch, phoneMatch, paymentMatch].filter(v => v !== null);
  const conflicts = observed.filter(v => v === false).length;
  const matches = observed.filter(Boolean).length;

  let status = 'INSUFFICIENT_EVIDENCE';
  if (conflicts > 0) status = 'CONFLICT';
  else if (matches > 0 && signals.matchedRiskTerms.length === 0) status = 'VERIFIED';
  else if (matches > 0) status = 'HUMAN_REVIEW';

  const riskScore = Math.min(100, conflicts * 45 + signals.matchedRiskTerms.length * 12 + (matches === 0 ? 15 : 0));
  const evidenceId = `P92-EV-${crypto.createHash('sha256').update(JSON.stringify({input, registry})).digest('hex').slice(0, 12)}`;
  return {
    evidenceId,
    status,
    riskScore,
    requiresHumanReview: status !== 'VERIFIED',
    checks: { emailMatch, phoneMatch, paymentMatch },
    signals: { matchedRiskTerms: signals.matchedRiskTerms, urls: signals.urls.length, emails: signals.emails.length, phones: signals.phones.length },
    explanation: status === 'VERIFIED'
      ? 'Provided identifiers match trusted registry data and no configured high-risk language was detected.'
      : 'Do not act automatically. One or more checks are conflicting, risky, or incomplete and require human verification.'
  };
}

function evaluateCases(cases = []) {
  const results = cases.map(test => {
    const result = verifyAgainstRegistry(test.input, test.registry);
    return { id: test.id, expected: test.expected, actual: result.status, passed: result.status === test.expected };
  });
  const passed = results.filter(r => r.passed).length;
  return { total: results.length, passed, accuracy: results.length ? passed / results.length : 0, results };
}

module.exports = { extractSignals, verifyAgainstRegistry, evaluateCases };
