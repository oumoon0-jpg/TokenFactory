import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {Script} from 'node:vm';
import {recordCollection,readJSON,loadHistories} from '../scripts/actions-data.mjs';
import {buildPages} from '../scripts/build-pages.mjs';

const q=(id,day,price)=>({id,source:'test',category:'buy',model:'l20-48',day,observedAt:day+'T02:00:00Z',rawPrice:price,normalized:price,currency:'CNY',url:'https://example.com/item'});
const report=(day,quotes)=>({startedAt:day+'T02:00:00Z',finishedAt:day+'T02:01:00Z',status:quotes.length?'partial':'failed',sources:[],quotes});
test('Actions跨天保存真实历史，失败来源保留原价原日期',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'token-factory-actions-'));await writeFile(join(dir,'initial-market.json'),JSON.stringify({quotes:[q('one','2026-11-24',100),q('two','2026-11-24',200)]}));
 const next=await recordCollection(dir,report('2026-11-25',[q('one','2026-11-25',110)]));
 assert.equal(next.quotes.find(q=>q.id==='two').observedAt,'2026-11-24T02:00:00Z');
 const daily=await readJSON(join(dir,'history/2026-11-25.json'));assert.deepEqual(daily.quotes.map(q=>q.id),['one']);
 const history=await loadHistories(dir);assert.equal(history.get('one').length,2);assert.equal(history.get('two').length,1);
 const failed=await recordCollection(dir,report('2026-11-26',[]));assert.equal(failed.quotes.length,2);assert.equal((await readdir(join(dir,'history'))).length,2);assert.equal((await readJSON(join(dir,'actions-runs.json')))[0].status,'failed');
});
test('同日重复运行去重，旧观察不能覆盖当天新报价',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'token-factory-retry-'));const old=q('one','2026-11-25',100),fresh={...old,rawPrice:150,normalized:150,observedAt:'2026-11-25T03:00:00Z'};
 await recordCollection(dir,report('2026-11-25',[fresh]));await recordCollection(dir,report('2026-11-25',[old]));
 const qs=(await readJSON(join(dir,'history/2026-11-25.json'))).quotes;assert.equal(qs.length,1);assert.equal(qs[0].rawPrice,150);
});
test('损坏历史必须报错，不能静默丢失历史后重建',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'token-factory-corrupt-'));await writeFile(join(dir,'initial-market.json'),'{broken');await assert.rejects(()=>recordCollection(dir,report('2026-11-25',[])),SyntaxError);
});
test('Pages产物独立于服务器、支持仓库子目录和完整报价历史',async()=>{
 const out=await mkdtemp(join(tmpdir(),'token-factory-pages-'));const data=await buildPages({outputDir:out,active:false});
 const html=await readFile(join(out,'index.html'),'utf8');const inline=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);assert.equal(inline.length,2);for(const s of inline)assert.doesNotThrow(()=>new Script(s));
 assert.ok(!/<(?:link|script)[^>]+(?:href|src)="\//.test(html));assert.ok(html.includes("'./data/market.json'"));assert.ok(html.includes("'./data/history/'"));assert.equal(data.hosting.type,'github-pages');assert.equal(data.schedule.enabled,false);assert.ok(!html.includes('appgprj_'));
 const market=JSON.parse(await readFile(join(out,'data/market.json'),'utf8'));assert.ok(market.quotes.length>=80);for(const quote of market.quotes){const rows=JSON.parse(await readFile(join(out,'data/history',quote.id+'.json'),'utf8'));assert.ok(rows.some(r=>r.observedAt===quote.observedAt));}
});
