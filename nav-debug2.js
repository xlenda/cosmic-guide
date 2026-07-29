const path=require('path'),http=require('http'),fs=require('fs');
const {chromium}=require('playwright-core');
const ROOT=path.resolve(process.argv[2]);const PORT=9113;const BASE=`http://localhost:${PORT}/cosmic-guide/`;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.ttf':'font/ttf','.ico':'image/x-icon','.svg':'image/svg+xml'};
const s=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);if(u.startsWith('/_vercel')){res.writeHead(404);return res.end('nf');}let f=path.join(ROOT,u);if(u.endsWith('/'))f=path.join(f,'index.html');if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(ROOT,'cosmic-guide','index.html');try{const d=fs.readFileSync(f);res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(d);}catch{res.writeHead(404);res.end('nf');}});
s.listen(PORT,async()=>{
const b=await chromium.launch();const c=await b.newContext();const p=await c.newPage();
await p.addInitScript(()=>{window.__errs=[];window.addEventListener('error',e=>window.__errs.push('ERR '+e.message+' @ '+e.filename+':'+e.lineno));window.addEventListener('unhandledrejection',e=>window.__errs.push('REJ '+(e.reason&&(e.reason.stack||e.reason.message||e.reason))));});
await p.goto(BASE);await p.waitForTimeout(8000);
const info=await p.evaluate(()=>({errs:window.__errs,rootLen:(document.getElementById('root')||{}).innerHTML?.length||0,scripts:[...document.querySelectorAll('script[src]')].map(s=>s.src)}));
console.log(JSON.stringify(info,null,1).slice(0,3000));
await b.close();s.close();});
