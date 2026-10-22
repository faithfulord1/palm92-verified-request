(function (root) {
  const STATUSES = ['VERIFIED RISK', 'LIKELY RISK', 'INSUFFICIENT EVIDENCE', 'NO MATERIAL RISK DETECTED'];
  const MODES = [
    ['social', 'Social / WhatsApp', 'Messages, groups, social posts and unexpected requests'],
    ['job', 'JobShield', 'Jobs, recruiters, sponsorship and fee requests'],
    ['property', 'PropertyShield', 'Accommodation, deposits and property leads'],
    ['community', 'Community Safety', 'Churches, charities and community groups'],
    ['business', 'Small Business Fraud Shield', 'Invoices, suppliers and business requests'],
    ['pay', 'Check Before I Pay', 'Any payment request, before money moves']
  ];
  const SOURCES = [
    ['Report Fraud (UK)', 'https://www.reportfraud.police.uk/'],
    ['GOV.UK: report a scam', 'https://www.gov.uk/report-suspicious-emails-websites-phishing'],
    ['Companies House', 'https://find-and-update.company-information.service.gov.uk/'],
    ['Charity Commission register (England and Wales)', 'https://register-of-charities.charitycommission.gov.uk/'],
    ['FCA Firm Checker', 'https://www.fca.org.uk/consumers/fca-firm-checker'],
    ['GOV.UK: check a job / employment rights', 'https://www.gov.uk/browse/working']
  ];
  function redact(value, extra = []) {
    let s = String(value ?? '');
    for (const raw of extra.filter(Boolean)) {
      const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try { s = s.replace(new RegExp(escaped, 'gi'), '[REDACTED]'); } catch {}
    }
    return s
      .replace(/\b[\w.+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, '[REDACTED EMAIL]')
      .replace(/(?:\+?\d[\d ()-]{7,}\d)/g, '[REDACTED PHONE]')
      .replace(/https?:\/\/chat\.whatsapp\.com\/[^\s]+/gi, '[REDACTED INVITE LINK]')
      .replace(/\b(?:https?:\/\/)?(?:www\.)?[^\s/]+\.(?:com|co\.uk|org|net|io)\/[^\s]*/gi, '[REDACTED LINK]');
  }
  function buildPack(input) {
    const privateValues = [input.redactName, input.redactPhone].filter(Boolean);
    const clean = v => redact(v, privateValues);
    return {
      product: 'Palm92 ScamShield', schemaVersion: '1.0', generatedAt: new Date().toISOString(),
      workflow: 'STOP → VERIFY → DECIDE', humanInTheLoop: true,
      privacy: {processing: 'This browser session only', remoteSubmission: false, redactionsApplied: true},
      mode: input.mode, caseTitle: clean(input.title), claim: clean(input.claim), request: clean(input.request),
      evidence: clean(input.evidence), indicators: input.indicators || [],
      status: input.status, statusMeaning: statusMeaning(input.status),
      sourcesChecked: (input.sources || []).map(x => ({name: x.name, url: x.url, checkedByUser: x.checked, note: clean(x.note)})),
      limitations: 'A screenshot proves that a claim was made, not that it is true. An unchecked source is not verified. This assessment is not a finding of guilt.',
      safeNextSteps: ['Do not pay or share sensitive information while uncertain.', 'Verify through an independently found official contact route.', 'Preserve original evidence securely; redact copies before sharing.', 'Report suspected fraud through the appropriate official route.'],
      humanDecision: input.decision, decisionNote: clean(input.decisionNote), audit: 'Created locally by the user; no server record is created.'
    };
  }
  function statusMeaning(status) {
    return {
      'VERIFIED RISK':'An authoritative source directly confirms the relevant risk or unlawful proposition.',
      'LIKELY RISK':'Multiple strong warning signs support risk, but decisive independent verification is incomplete.',
      'INSUFFICIENT EVIDENCE':'Available evidence cannot support a reliable conclusion.',
      'NO MATERIAL RISK DETECTED':'Checks found no material warning signs. This is not a guarantee of safety.'
    }[status] || 'Choose a status only after reviewing evidence and limitations.';
  }
  const api = {STATUSES, MODES, SOURCES, redact, buildPack, statusMeaning};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ScamShieldCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
