const path=require('path'),http=require('http'),fs=require('fs');
const {chromium}=require('playwright-core');
const ROOT=path.resolve(process.argv[2]);const PORT=9112;const BASE=`http://localhost:${PORT}/cosmic-guide/`;
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.json':'application/json','.ttf':'font/ttf','.ico':'image/x-icon','.svg':'image/svg+xml'};
const s=http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);if(u.startsWith('/_vercel')){res.writeHead(404);return res.end('nf');}let f=path.join(ROOT,u);if(u.endsWith('/'))f=path.join(f,'index.html');if(!fs.existsSync(f)||fs.statSync(f).isDirectory())f=path.join(ROOT,'cosmic-guide','index.html');try{const d=fs.readFileSync(f);res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(d);}catch{res.writeHead(404);res.end('nf');}});
s.listen(PORT,async()=>{
const b=await chromium.launch();const c=await b.newContext();const p=await c.newPage();
p.on('pageerror',e=>console.log('PAGEERROR:',e.message,'\n',(e.stack||'').split('\n').slice(0,6).join('\n')));
p.on('console',m=>console.log('CONSOLE['+m.type()+']:',m.text().slice(0,400)));
p.on('requestfailed',r=>console.log('REQFAIL:',r.url(),r.failure()&&r.failure().errorText));
await p.goto(BASE);await p.waitForTimeout(8000);
console.log('BODY:',(await p.evaluate(()=>document.body.innerText)).slice(0,300));
await b.close();s.close();});
