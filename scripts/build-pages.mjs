import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readJSON,loadHistories,mergeQuotes} from './actions-data.mjs';

export async function buildPages({projectDir=process.cwd(),outputDir=join(projectDir,'pages-dist'),repository=process.env.GITHUB_REPOSITORY||'oumoon0-jpg/TokenFactory',active=process.env.GITHUB_ACTIONS==='true'}={}){
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository))throw Error('Invalid GitHub repository');
 const seed=await readJSON(join(projectDir,'data/initial-market.json'),null);if(!seed?.quotes?.length)throw Error('缺少可发布的行情快照');
 const runs=await readJSON(join(projectDir,'data/actions-runs.json'),[{...seed,quotes:undefined}]);
 const histories=await loadHistories(join(projectDir,'data'));
 for(const q of seed.quotes){const qs=histories.get(q.id)||[];const day=qs.find(x=>x.day===q.day);if(!day)qs.push(q);else if(q.observedAt>day.observedAt)qs[qs.indexOf(day)]=q;histories.set(q.id,qs.sort((a,b)=>a.day.localeCompare(b.day)).slice(-365));}
 const schedule={type:'github-actions',enabled:active,time:'09:17',timezone:'Asia/Shanghai',workflow:'prices-and-pages.yml',url:`https://github.com/${repository}/actions/workflows/prices-and-pages.yml`};
 const market={quotes:mergeQuotes([],seed.quotes),runs,schedule,serverTime:seed.finishedAt,hosting:{type:'github-pages',repository,builtAt:new Date().toISOString()}};
 const read=p=>readFile(join(projectDir,p),'utf8');
 const strip=s=>s.replace(/^import[^\n]*\n/gm,'').replace(/\bexport (?=(?:async )?(?:function|const|class))/g,'');
 const script=(await Promise.all(['src/catalog.mjs','src/ai-models.mjs','src/calc.mjs','src/price-policy.mjs','public/app.js'].map(read))).map(strip).join('\n').replace(/<\/script/gi,'<\\/script');
 const css=await read('public/style.css');
 const html=(await read('public/index.html')).replace('<link rel="stylesheet" href="/style.css">',()=>`<style>${css}</style>`).replace('<script src="/bootstrap.js"></script>',()=>`<script>window.__BOOT__=${JSON.stringify(market).replace(/</g,'\\u003c')};</script>`).replace('<script type="module" src="/app.js"></script>',()=>`<script type="module">${script}</script>`);
 await mkdir(join(outputDir,'data/history'),{recursive:true});await writeFile(join(outputDir,'index.html'),html);await writeFile(join(outputDir,'.nojekyll'),'');await writeFile(join(outputDir,'data/market.json'),JSON.stringify(market));
 for(const [id,qs]of histories){if(!/^[\p{L}\p{N}_-]+$/u.test(id))throw Error('不安全的报价ID');await writeFile(join(outputDir,'data/history',id+'.json'),JSON.stringify(qs));}
 console.log(`Pages 构建完成：${market.quotes.length} 条报价，${histories.size} 组历史；目录 ${outputDir}`);return market;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await buildPages();
