import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';

export async function readJSON(path,fallback){
 try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}
}
export function mergeQuotes(previous,incoming){
 const byId=new Map(previous.map(q=>[q.id,q]));
 for(const q of incoming){
  if(!q.id||!/^\d{4}-\d{2}-\d{2}$/.test(q.day)||!Number.isFinite(Date.parse(q.observedAt)))throw Error('价格缺少合法ID、日期或采集时间');
  const old=byId.get(q.id);if(!old||q.observedAt>old.observedAt)byId.set(q.id,q);
 }
 return [...byId.values()].sort((a,b)=>`${a.category}/${a.model}/${a.id}`.localeCompare(`${b.category}/${b.model}/${b.id}`));
}
export async function saveDaily(dataDir,quotes){
 const grouped=new Map();for(const q of quotes){if(!/^\d{4}-\d{2}-\d{2}$/.test(q.day))throw Error('非法观察日期');if(!grouped.has(q.day))grouped.set(q.day,[]);grouped.get(q.day).push(q);}
 await mkdir(join(dataDir,'history'),{recursive:true});
 for(const [day,qs] of grouped){const path=join(dataDir,'history',day+'.json'),old=await readJSON(path,{day,quotes:[]});await writeFile(path,JSON.stringify({day,quotes:mergeQuotes(old.quotes,qs)},null,2)+'\n');}
}
export async function recordCollection(dataDir,report){
 await mkdir(dataDir,{recursive:true});const path=join(dataDir,'initial-market.json'),old=await readJSON(path,{quotes:[]});
 // Bootstrap original observations under their actual dates, never today's date.
 await saveDaily(dataDir,old.quotes);await saveDaily(dataDir,report.quotes);
 const runs=await readJSON(join(dataDir,'actions-runs.json'),[]),{quotes,...run}=report;
 const nextRuns=[{id:report.startedAt,...run},...runs.filter(r=>r.startedAt!==report.startedAt)].slice(0,90);
 const schedule={type:'github-actions',enabled:true,time:'09:17',timezone:'Asia/Shanghai',workflow:'prices-and-pages.yml',requires:'GitHub Actions启用；无需本机运行'};
 const seed={...report,quotes:mergeQuotes(old.quotes,report.quotes),schedule};
 await writeFile(path,JSON.stringify(seed,null,2)+'\n');await writeFile(join(dataDir,'actions-runs.json'),JSON.stringify(nextRuns,null,2)+'\n');return seed;
}
export async function loadHistories(dataDir){
 let files;try{files=await readdir(join(dataDir,'history'));}catch(e){if(e.code==='ENOENT')return new Map();throw e;}
 const byId=new Map();for(const name of files.filter(n=>/^\d{4}-\d{2}-\d{2}\.json$/.test(n)).sort()){
  const daily=await readJSON(join(dataDir,'history',name),null);
  for(const q of daily.quotes){if(!byId.has(q.id))byId.set(q.id,[]);byId.get(q.id).push(q);}
 }
 for(const [id,qs]of byId)byId.set(id,qs.slice(-365));return byId;
}
