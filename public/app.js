const $ = id => document.getElementById(id);
const C = window.ScamShieldCore;
let activeMode = 'social';
const statusDescriptions = {
  'VERIFIED RISK': 'An authoritative source directly confirms the relevant risk or unlawful proposition.',
  'LIKELY RISK': 'Multiple strong warning signs support risk, but decisive independent verification is incomplete.',
  'INSUFFICIENT EVIDENCE': 'The material available cannot support a reliable conclusion.',
  'NO MATERIAL RISK DETECTED': 'Checks found no material warning signs. This is not a guarantee of safety.'
};
function renderModes() {
  $('modes').innerHTML = C.MODES.map(([id, name, desc]) => `<button class="mode ${id===activeMode?'active':''}" data-mode="${id}" aria-pressed="${id===activeMode}"><b>${name}</b><span>${desc}</span></button>`).join('');
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => { activeMode=btn.dataset.mode; renderModes(); $('modeLabel').textContent=C.MODES.find(m=>m[0]===activeMode)[1]; }));
}
function renderSources() {
  $('sources').innerHTML = C.SOURCES.map((s,i) => `<div class="source"><label><input type="checkbox" data-source="${i}"> I checked</label><a href="${s[1]}" target="_blank" rel="noopener noreferrer">${s[0]} ↗</a><input data-note="${i}" placeholder="What did you confirm? (optional)"></div>`).join('');
}
function values() {
  const checked = [...document.querySelectorAll('[data-source]:checked')].map(el => Number(el.dataset.source));
  return {mode:activeMode,title:$('title').value,claim:$('claim').value,request:$('request').value,evidence:$('evidence').value,
    indicators:[...document.querySelectorAll('[data-indicator]:checked')].map(el=>el.value),status:$('status').value,
    sources:checked.map(i=>({name:C.SOURCES[i][0],url:C.SOURCES[i][1],checked:true,note:document.querySelector(`[data-note="${i}"]`).value})),
    decision:$('decision').value,decisionNote:$('decisionNote').value,redactName:$('redactName').value,redactPhone:$('redactPhone').value};
}
function showSummary() {
  const v=values(); const validation=C.validateCase(v); $('statusMeaning').textContent=statusDescriptions[v.status];
  const readiness=validation.valid ? '<p><b>Export ready:</b> required evidence and human-review fields are recorded.</p>' : `<p><b>Export not ready:</b> ${validation.errors.join(' ')}</p>`;
  $('summary').innerHTML=`<strong>${v.status}</strong><p>${statusDescriptions[v.status]}</p><p>${v.sources.length} authoritative source(s) marked as checked by you. ScamShield does not browse or verify them automatically.</p><p><b>Human decision:</b> ${v.decision || 'Pending'}</p>${readiness}`;
}
function downloadPack() {
  try {
    const pack=C.buildPack(values()); const blob=new Blob([JSON.stringify(pack,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='palm92-scamshield-evidence-pack.json'; a.click(); URL.revokeObjectURL(url);
    $('toast').textContent='Evidence Pack downloaded. Review the redacted copy before sharing it.';
  } catch (error) {
    $('toast').textContent=`Evidence Pack not downloaded. ${error.message}`;
  }
}
function loadCase() {
  activeMode='social'; renderModes(); $('modeLabel').textContent='Social / WhatsApp';
  $('title').value='Case Study 001 · unsolicited wealth group';
  $('claim').value='An unsolicited group with roughly 299 strangers claimed that £200 would supposedly become £4,000.';
  $('request').value='The material advertised alleged cash/card products, exceptional returns, testimonials and delivery claims. Do not test, buy or contact anyone.';
  $('evidence').value='Captured screenshots show that these claims were advertised. They do not establish that the products existed or worked, that deliveries contained the advertised items, that testimonials were independent, or who controlled the accounts.';
  document.querySelectorAll('[data-indicator]').forEach(el=>el.checked=['unsolicited','extraordinary','social-proof','pressure','illegal-claim'].includes(el.value));
  $('status').value='LIKELY RISK'; $('decision').value='DO NOT PAY OR ENGAGE'; showSummary();
}
$('status').addEventListener('change',showSummary); $('decision').addEventListener('change',showSummary);
$('assess').addEventListener('click',showSummary); $('download').addEventListener('click',downloadPack);
$('clear').addEventListener('click',()=>{document.querySelector('form').reset(); activeMode='social'; $('toast').textContent='Form cleared. Nothing was sent or saved.'; renderModes(); showSummary();});
$('caseButton').addEventListener('click',loadCase);
renderModes(); renderSources(); showSummary();
