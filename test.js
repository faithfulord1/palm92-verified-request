const assert = require('assert');

function gate(input){
  const checks={identity:input.identityVerified===true,authority:input.authorityChecked===true,permission:input.permissionValid===true,scope:input.withinScope===true,risk:String(input.risk||'REVIEW').toUpperCase()};
  const failed=Object.entries(checks).filter(([k,v])=>k!=='risk'&&!v).map(([k])=>k);
  let verdict='READY_FOR_HUMAN_REVIEW';
  if(failed.length||checks.risk==='HIGH') verdict='BLOCKED';
  return {checks,failed,verdict};
}

const legitimate=gate({identityVerified:true,authorityChecked:true,permissionValid:true,withinScope:true,risk:'LOW'});
assert.equal(legitimate.verdict,'READY_FOR_HUMAN_REVIEW');

const suspicious=gate({identityVerified:true,authorityChecked:false,permissionValid:false,withinScope:true,risk:'REVIEW'});
assert.equal(suspicious.verdict,'BLOCKED');
assert(suspicious.failed.includes('authority'));

const highRisk=gate({identityVerified:true,authorityChecked:true,permissionValid:true,withinScope:true,risk:'HIGH'});
assert.equal(highRisk.verdict,'BLOCKED');

const outOfScope=gate({identityVerified:true,authorityChecked:true,permissionValid:true,withinScope:false,risk:'LOW'});
assert.equal(outOfScope.verdict,'BLOCKED');

console.log('Authority Gate tests passed: legitimate, suspicious, high-risk, out-of-scope.');
