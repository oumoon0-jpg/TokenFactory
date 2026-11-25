import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseSource,sources,modelId} from '../src/collect.mjs';
import {selectQuote,autoComparable} from '../src/price-policy.mjs';
const fixtures=JSON.parse(readFileSync(new URL('./fixtures/purchase.json',import.meta.url),'utf8'));
const at='2026-11-25T03:00:00Z',now=Date.parse(at);
const parse=(id,h=fixtures[id])=>parseSource(sources.find(s=>s.id===id),h,at);
test('GPU型号匹配区分NVIDIA字母D、D v2、定制卡和A100显存',()=>{
 for(const [name,id] of [['NVIDIA RTX 5090 32GB','rtx5090-32'],['NVIDIA RTX 5090 D 32G','rtx5090d-32'],['RTX 5090 D V2 24G','rtx5090dv2-24'],['NVIDIA A100 40GB 原厂','a100-40'],['NVIDIA A100 80GB','a100-80'],['RTX 4090 48GB 定制',null],['H100 94G PCIE',null],['H20 96G 定制版',null]])assert.equal(modelId(name),id,name);
});
test('供货挂牌不采用求购价，特价拆机与普通供货分开保存',()=>{
 const qs=parse('qudao-cd81793f-2ef3-492c-b6dc-a017805ea591');assert.equal(qs.length,2);assert.deepEqual(qs.map(q=>q.rawPrice),[41500,45000]);assert.ok(qs.every(q=>q.model==='a100-40'&&q.publishedAt==='2026-11-24'));
 assert.equal(qs[0].condition,'拆机 / 二手');assert.equal(qs[0].defaultEligible,false);assert.match(qs[1].tax,/是否含税未明确/);assert.equal(selectQuote(qs,'buy','a100-40',now).rawPrice,45000);
});
test('重读旧网页不能把发布日期变成今天并进入自动测算',()=>{
 const q=parse('qudao-cd81793f-2ef3-492c-b6dc-a017805ea591')[1];assert.equal(autoComparable(q,now),true);assert.equal(autoComparable({...q,publishedAt:'2026-10-01'},now),false);assert.equal(autoComparable({...q,publishedAt:null},now),false);assert.equal(autoComparable({...q,observedAt:'2026-11-20T03:00:00Z'},now),false);
});
test('Max-Q低价不可自动替代服务器版，仍能查看供货参考',()=>{const q=parse('qudao-aec92c99-69da-4376-8a04-c33a12d6f4b1')[0];assert.equal(q.rawPrice,120000);assert.equal(q.eligible,true);assert.equal(autoComparable(q,now),false);});
test('CPLIGHT精确读取本品209050元，不取舍入20.9万或推荐价格',()=>{
 const q=parse('cplight-1360')[0];assert.equal(q.rawPrice,209050);assert.equal(q.cards,1);assert.equal(q.condition,'全新');assert.match(q.tax,/含13%/);assert.equal(q.publishedAt,null);assert.equal(q.defaultEligible,false);assert.equal(q.model,'h100-80');
 assert.throws(()=>parse('cplight-1360','<p>店铺推荐 H100 ￥123000</p>'));
});
test('H100模组与B300八卡整机保留真实交付单位和限制',()=>{
 const module=parse('cplight-1003')[0],server=parse('cplight-2556')[0];assert.equal(module.scope,'module');assert.equal(module.normalized,160000);assert.equal(module.cards,8);assert.equal(module.defaultEligible,false);assert.equal(server.normalized,1625000);assert.equal(server.scope,'server');assert.equal(server.eligible,false);
});
test('京东只读当前SKU公开价格，推荐商品和缺价页不得冒充',()=>{
 const q=parse('jd-5090d')[0];assert.equal(q.rawPrice,45599);assert.equal(q.model,'rtx5090d-32');assert.equal(q.defaultEligible,false);assert.throws(()=>parse('jd-5090d','<div>看了又看 RTX5090D ¥29999</div>'));
});
test('有日期整机报价区分人民币买断、外币和卡数未知',()=>{
 const [h,b]=parse('aiswr-purchase');assert.equal(h.rawPrice,6850000);assert.equal(h.normalized,856250);assert.equal(h.publishedAt,'2026-10-31');assert.equal(b.rawPrice,19500000);assert.equal(b.cards,null);assert.equal(b.normalized,null);assert.equal(b.eligible,false);
});
test('服务器版PCIe显卡是单卡商品，不因名称带服务器字样误判为整机',()=>{
 const q=parse('qxlc-628','<h1>RTX PRO 6000 Blackwell Server Edition（服务器版）</h1><span data-price>¥170,000</span><p>全新深圳现货 发布时间 2026-10-26</p>')[0];assert.equal(q.cards,1);assert.equal(q.scope,'card');assert.equal(q.normalized,170000);
});
