import{createServer}from'node:http';import{spawn}from'node:child_process';import{localDB}from'./local-db.mjs';
import worker from '../dist/server/index.js';
const db=localDB(),port=Number(process.env.TOKEN_FACTORY_PORT||5188);
const server=createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const request=new Request('http://127.0.0.1:'+port+req.url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks),duplex:'half'})});const response=await worker.fetch(request,{DB:db});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500);res.end(e.message);}});
server.listen(port,'127.0.0.1',()=>{console.log('Local: http://127.0.0.1:'+port);if(process.argv.includes('--open'))spawn('cmd.exe',['/c','start','','http://127.0.0.1:'+port],{windowsHide:true,stdio:'ignore'});});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
