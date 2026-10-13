const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {registry,createStore}=require('./gate');
const store=createStore();
const root=path.join(__dirname,'public');
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function parse(req){let data='';for await(const chunk of req){data+=chunk;if(data.length>10000)throw Error('Request too large');}return JSON.parse(data||'{}');}
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(req.method==='GET'&&url.pathname==='/api/scenario')return send(res,200,{registry,example:{claimedBy:'Maya Okafor',channel:'registered-portal',action:'supplier-payment',amount:'125',destination:'GB-DEMO-SUPPLIER-104',invoice:'INV-104'}});
    if(req.method==='POST'&&url.pathname==='/api/requests')return send(res,201,store.submit(await parse(req)));
    const match=url.pathname.match(/^\/api\/requests\/([0-9a-f-]+)(?:\/(decision|audit))?$/);
    if(match){const [,id,part]=match;const record=store.get(id);if(!record)return send(res,404,{error:'Case not found'});
      if(req.method==='GET'&&part==='audit')return send(res,200,{events:store.events(id)});
      if(req.method==='GET'&&!part)return send(res,200,record);
      if(req.method==='POST'&&part==='decision'){const b=await parse(req);const result=store.decide(id,b.decision,b.reviewer,b.reason);return send(res,result.code||200,result);}
    }
    if(req.method==='GET'){const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(root+path.sep))return send(res,403,{error:'Forbidden'});if(fs.existsSync(file)&&fs.statSync(file).isFile()){const type={'.html':'text/html','.css':'text/css','.js':'text/javascript'}[path.extname(file)]||'text/plain';res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});return fs.createReadStream(file).pipe(res);}}
    send(res,404,{error:'Not found'});
  }catch(e){send(res,e instanceof SyntaxError?400:e.message==='Request too large'?413:500,{error:e.message});}
});
if(require.main===module)server.listen(process.env.PORT||3000,()=>console.log('Verified Request demo listening'));
module.exports=server;
