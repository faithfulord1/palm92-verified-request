const crypto = require('node:crypto');

const registry = Object.freeze({
  organisation: 'Northbridge Community Fund (fictional)',
  people: {
    'Maya Okafor': {channels: ['registered-portal'], roles: ['finance-officer'], actions: ['supplier-payment'], limit: 500},
    'Ayo Bello': {channels: ['registered-portal'], roles: ['volunteer'], actions: ['view-record'], limit: 0}
  },
  destinations: ['GB-DEMO-SUPPLIER-104']
});

function assess(input) {
  const amount = Number(input.amount);
  const person = registry.people[input.claimedBy];
  const checks = [
    {name:'Identity', pass:Boolean(person && person.channels.includes(input.channel)), detail:'Claimed person and channel match demo registry'},
    {name:'Authority', pass:Boolean(person && person.roles.includes('finance-officer')), detail:'Role may authorise supplier payments'},
    {name:'Permission', pass:Boolean(person && person.actions.includes(input.action)), detail:'Action is granted to this role'},
    {name:'Scope', pass:Boolean(person && Number.isFinite(amount) && amount > 0 && amount <= person.limit && registry.destinations.includes(input.destination)), detail:'Amount and destination are inside registered scope'},
    {name:'Risk', pass:Boolean(input.invoice === 'INV-104' && input.channel === 'registered-portal'), detail:'Invoice and channel match this controlled scenario'}
  ];
  return {checks, eligible:checks.every(c=>c.pass), risk:checks.every(c=>c.pass)?'REVIEW':'HIGH'};
}

function createStore() {
  const cases = new Map();
  const audit = [];
  let previousHash = 'GENESIS';
  function event(caseId, type, detail) {
    const entry = {sequence:audit.length+1, at:new Date().toISOString(), caseId, type, detail, previousHash};
    entry.hash = crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');
    previousHash = entry.hash;
    audit.push(entry);
    return entry;
  }
  function submit(input) {
    const id = crypto.randomUUID();
    const request = {claimedBy:String(input.claimedBy||''), channel:String(input.channel||''), action:String(input.action||''), amount:String(input.amount||''), destination:String(input.destination||''), invoice:String(input.invoice||'')};
    const assessment = assess(request);
    const record = {id, request, assessment, status:assessment.eligible?'AWAITING_HUMAN':'BLOCKED_CHECKS', decision:null, action:null};
    cases.set(id, record);
    event(id,'REQUEST_RECEIVED',{request});
    event(id,'CHECKS_COMPLETED',{checks:assessment.checks, status:record.status});
    return record;
  }
  function decide(id, decision, reviewer, reason) {
    const record=cases.get(id);
    if (!record) return {error:'Case not found', code:404};
    if (record.status !== 'AWAITING_HUMAN') return {error:'This case cannot be approved or decided again', code:409};
    if (!['APPROVE','REJECT'].includes(decision) || !String(reviewer||'').trim() || !String(reason||'').trim()) return {error:'Decision, reviewer and reason are required', code:400};
    record.decision={decision, reviewer:String(reviewer).trim(), reason:String(reason).trim(), at:new Date().toISOString()};
    event(id,'HUMAN_DECISION',record.decision);
    if (decision==='REJECT') { record.status='REJECTED'; event(id,'ACTION_BLOCKED',{reason:'Human rejected'}); }
    else { record.status='PERMITTED_DEMO'; record.action={type:'SIMULATED_SUPPLIER_PAYMENT', result:'PERMITTED_ONLY', externalExecution:false}; event(id,'ACTION_PERMITTED',record.action); }
    return record;
  }
  return {submit,decide,get:id=>cases.get(id),events:id=>audit.filter(e=>e.caseId===id),audit};
}
module.exports={registry,assess,createStore};
