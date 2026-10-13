const $=id=>document.getElementById(id);
let current=null;
async function api(url,options){const response=await fetch(url,options);const data=await response.json();if(!response.ok)throw Error(data.error||'Request failed');return data;}
function payload(){return Object.fromEntries(['claimedBy','channel','action','amount','destination','invoice'].map(id=>[id,$(id).value]));}
function render(record,events=[]){current=record;$('checks').replaceChildren();for(const check of record.assessment.checks){const row=document.createElement('div');row.className=check.pass?'pass':'fail';row.textContent=`${check.pass?'PASS':'FAIL'} · ${check.name}: ${check.detail}`;$('checks').append(row);}
  $('status').textContent=`Case ${record.id} · ${record.status} · Risk ${record.assessment.risk}`;
  $('approve').disabled=record.status!=='AWAITING_HUMAN';$('reject').disabled=record.status!=='AWAITING_HUMAN';$('export').disabled=false;
  $('outcome').textContent=record.status==='PERMITTED_DEMO'?'Simulated action permitted. No external payment or repository action occurred.':record.status==='REJECTED'?'Human rejected. Action blocked.':record.status==='BLOCKED_CHECKS'?'Authority checks failed. Action blocked.':'Waiting for a human decision. Action blocked.';
  $('audit').replaceChildren();for(const item of events){const li=document.createElement('li');li.textContent=`${item.sequence}. ${item.at} · ${item.type} · SHA-256 ${item.hash.slice(0,12)}…`;$('audit').append(li);}
}
async function refresh(record){const audit=await api(`/api/requests/${record.id}/audit`);render(record,audit.events);}
$('submit').onclick=async()=>{try{await refresh(await api('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload())}));}catch(e){$('status').textContent=e.message;}};
async function decide(decision){try{const record=await api(`/api/requests/${current.id}/decision`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({decision,reviewer:$('reviewer').value,reason:$('reason').value})});await refresh(record);}catch(e){$('status').textContent=e.message;}}
$('approve').onclick=()=>decide('APPROVE');$('reject').onclick=()=>decide('REJECT');
$('export').onclick=async()=>{const events=(await api(`/api/requests/${current.id}/audit`)).events;const blob=new Blob([JSON.stringify({case:current,events},null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=`palm92-case-${current.id}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);};
api('/api/scenario').then(({example})=>{for(const [key,value] of Object.entries(example))$(key).value=value;}).catch(e=>{$('status').textContent=e.message;});
