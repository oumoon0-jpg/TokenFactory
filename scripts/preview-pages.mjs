import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve('pages-dist'),prefix='/TokenFactory/',port=5190;
const types={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const server=createServer(async(req,res)=>{try{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(!pathname.startsWith(prefix)||!['GET','HEAD'].includes(req.method)){res.writeHead(404);res.end('Not found');return;}
 const file=resolve(root,pathname.slice(prefix.length)||'index.html');
 if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
 const bytes=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(req.method==='HEAD'?undefined:bytes);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500);res.end('Not found');}});
server.listen(port,'127.0.0.1',()=>console.log(`Local Pages preview: http://127.0.0.1:${port}${prefix}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
