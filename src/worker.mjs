import {collect} from './collect.mjs';
import {initialize,market,history,saveQuotes,saveRun,acquireLease} from './storage.mjs';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','X-Content-Type-Options':'nosniff'}});
export function createWorker(assets,seed){return{async fetch(request,env){
 const url=new URL(request.url);
 try{
  if(url.pathname.startsWith('/api/')){
   // Private owner-only Sites dispatch authenticates visitors and service callers.
   // Keep this Site private; these operations store shared business planning data.
   if(!['GET','POST'].includes(request.method))return json({error:'Method not allowed'},405);
   if(request.method==='POST'){
    const origin=request.headers.get('origin');if(origin&&origin!==url.origin)return json({error:'Origin denied'},403);
    if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required'},415);
   }
   await initialize(env.DB,seed);
   if(url.pathname==='/api/market'&&request.method==='GET')return json(await market(env.DB));
   if(url.pathname==='/api/history'&&request.method==='GET')return json(await history(env.DB,url.searchParams.get('id')||''));
   if(url.pathname==='/api/refresh'&&request.method==='POST'){
    if(!await acquireLease(env.DB))return json({error:'正在更新，或距上次更新不足60秒。请稍后再试。'},409);
    const report=await collect();await saveQuotes(env.DB,report.quotes);const id=await saveRun(env.DB,report);return json({id,...report});
   }
   if(url.pathname==='/api/schedule'&&request.method==='POST'){
    const body=await request.json();if(typeof body.id!=='string'||body.time!=='09:00'||body.timezone!=='Asia/Shanghai')return json({error:'Invalid schedule metadata'},400);
    await env.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('schedule',JSON.stringify({id:body.id,time:body.time,timezone:body.timezone,enabled:body.enabled===true})).run();return json({saved:true});
   }
   return json({error:'Not found'},404);
  }
  const key=url.pathname==='/'?'/index.html':url.pathname;const asset=assets[key];if(!asset)return new Response('Not found',{status:404});
  return new Response(request.method==='HEAD'?null:asset.content,{headers:{'content-type':asset.type,'cache-control':'no-cache','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'"}});
 }catch(e){return json({error:String(e.message).slice(0,250)},500);}
}};}
