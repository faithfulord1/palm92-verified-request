// Existing PayPal Sandbox capability, isolated from the Authority Gate demo.
// Do not call until a future authenticated, request-bound human approval flow exists.
const BASE=process.env.PAYPAL_BASE_URL||'https://api-m.sandbox.paypal.com';
async function createSandboxOrder({amount,currency,reference}){
  const id=process.env.PAYPAL_CLIENT_ID,secret=process.env.PAYPAL_CLIENT_SECRET;
  if(!id||!secret)throw Error('PayPal Sandbox credentials are not configured');
  if(!/^https:\/\/api-m\.sandbox\.paypal\.com$/.test(BASE))throw Error('Only PayPal Sandbox endpoint is allowed');
  if(!/^\d+\.\d{2}$/.test(String(amount))||Number(amount)<=0)throw Error('Invalid amount');
  if(!['GBP','USD','EUR'].includes(currency))throw Error('Unsupported currency');
  const tokenResponse=await fetch(`${BASE}/v1/oauth2/token`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
  if(!tokenResponse.ok)throw Error(`PayPal Sandbox OAuth failed (${tokenResponse.status})`);
  const access=(await tokenResponse.json()).access_token;
  const response=await fetch(`${BASE}/v2/checkout/orders`,{method:'POST',headers:{Authorization:`Bearer ${access}`,'Content-Type':'application/json','PayPal-Request-Id':reference},body:JSON.stringify({intent:'CAPTURE',purchase_units:[{reference_id:reference,amount:{currency_code:currency,value:amount}}]})});
  if(!response.ok)throw Error(`PayPal Sandbox order failed (${response.status})`);
  return response.json();
}
module.exports={createSandboxOrder};
