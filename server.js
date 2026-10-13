const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PAYPAL_BASE = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const records = [];

function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));}
function body(req){return new Promise((resolve,reject)=>{let d='';req.on('data',c=>{d+=c;if(d.length>1e6)reject(new Error('too large'));});req.on('end',()=>{try{resolve(d?JSON.parse(d):{})}catch(e){reject(e)}});req.on('error',reject);});}
function bool(v){return v===true||v==='true'||v==='on'||v===1||v==='1';}
function gate(input){
 const checks={identity:bool(input.identityVerified),authority:bool(input.authorityChecked),permission:bool(input.permissionValid),scope:bool(input.withinScope),risk:String(input.risk||'REVIEW').toUpperCase()};
 const failed=Object.entries(checks).filter(([k,v])=>k!=='risk'&&!v).map(([k])=>k);
 let verdict='READY_FOR_HUMAN_REVIEW';
 if(failed.length) verdict='BLOCKED';
 if(checks.risk==='HIGH') verdict='BLOCKED';
 return {checks,failed,verdict,principle:'Access does not equal authority.'};
}
function fingerprint(record){return crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex');}
async function token(){if(!CLIENT_ID||!CLIENT_SECRET)throw new Error('PayPal Sandbox credentials are not configured on the server');const auth=Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');const r=await fetch(`${PAYPAL_BASE}/v1/oauth2/token`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});if(!r.ok)throw new Error(`PayPal OAuth failed (${r.status})`);return(await r.json()).access_token;}
async function createOrder(amount,currency,reference){const access=await token();const r=await fetch(`${PAYPAL_BASE}/v2/checkout/orders`,{method:'POST',headers:{Authorization:`Bearer ${access}`,'Content-Type':'application/json','PayPal-Request-Id':reference},body:JSON.stringify({intent:'CAPTURE',purchase_units:[{reference_id:reference,amount:{currency_code:currency,value:amount}}]})});const data=await r.json();if(!r.ok)throw new Error(data.message||`PayPal order failed (${r.status})`);return data;}

const server=http.createServer(async(req,res)=>{try{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(req.method==='GET'&&pathname==='/api/health')return json(res,200,{ok:true,mode:'sandbox',paypalConfigured:Boolean(CLIENT_ID&&CLIENT_SECRET),principle:'AI investigates. Humans decide.',control:'Access does not equal authority.'});
 if(req.method==='GET'&&pathname==='/api/audit')return json(res,200,{records});
 if(req.method==='POST'&&pathname==='/api/gate'){const b=await body(req);return json(res,200,gate(b));}
 if(req.method==='POST'&&pathname==='/api/decision'){
   const b=await body(req);const decision=String(b.decision||'').toUpperCase();
   if(!['APPROVE','REJECT'].includes(decision))return json(res,400,{error:'Decision must be APPROVE or REJECT'});
   const amount=Number(b.amount);if(!Number.isFinite(amount)||amount<=0)return json(res,400,{error:'Enter a valid positive amount'});
   const currency=String(b.currency||'GBP').toUpperCase();const authorityGate=gate(b);
   const record={id:`P92-${Date.now()}`,createdAt:new Date().toISOString(),request:String(b.request||''),requester:String(b.requester||''),organisation:String(b.organisation||''),destination:String(b.destination||''),evidence:String(b.evidence||''),amount:amount.toFixed(2),currency,decision,authorityGate,status:'PENDING'};
   record.fingerprint=fingerprint(record);records.unshift(record);
   if(decision==='REJECT'){record.status='REJECTED_NO_ACTION';return json(res,200,{record,message:'Rejected. No payment API execution occurred.'});}
   if(authorityGate.verdict!=='READY_FOR_HUMAN_REVIEW'){record.status='BLOCKED_BY_AUTHORITY_GATE';return json(res,403,{record,error:`Authority Gate blocked execution: ${authorityGate.failed.join(', ')||'high risk'}. Access does not equal authority.`});}
   const order=await createOrder(record.amount,currency,record.id);record.status='PAYPAL_ORDER_CREATED';record.paypalOrderId=order.id;record.paypalStatus=order.status;record.links=order.links;return json(res,200,{record,message:'Authority Gate passed and human approval recorded. PayPal Sandbox order created.'});
 }
 if(req.method==='GET'){const requestedPath=pathname==='/'?'/index.html':pathname;const publicDir=path.join(__dirname,'public');const file=path.resolve(publicDir,'.'+requestedPath);if(!file.startsWith(publicDir+path.sep))return json(res,403,{error:'Forbidden'});if(fs.existsSync(file)&&fs.statSync(file).isFile()){const ext=path.extname(file);const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};res.writeHead(200,{'Content-Type':types[ext]||'text/plain'});return fs.createReadStream(file).pipe(res);}}
 json(res,404,{error:'Not found'});
}catch(e){json(res,500,{error:e.message});}});
server.listen(PORT,()=>console.log(`Palm92 Verified Request Authority Gate listening on ${PORT}`));
