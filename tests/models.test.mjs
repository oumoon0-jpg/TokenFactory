import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {aiModels,modelPreset,modelDefaults,revenueQuote,quotePrices} from '../src/ai-models.mjs';
import {catalog,defaultState} from '../src/catalog.mjs';
import {calculate} from '../src/calc.mjs';
import {parseMiniMaxPrices,minimaxPriceSource} from '../src/model-prices.mjs';
const fixture=readFileSync(new URL('./fixtures/minimax-pricing.md',import.meta.url),'utf8');
const quotes=parseMiniMaxPrices(minimaxPriceSource,fixture,'2026-11-25T05:00:00Z');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('官方人民币表识别当前折后标准价，排除优先服务和任务支持表',()=>{
 assert.equal(quotes.length,11);const standard=quotes.find(q=>q.model==='MiniMax-M3'&&q.spec==='standard');
 assert.deepEqual([standard.inputPrice,standard.outputPrice,standard.cachePrice],[2.1,8.4,.42]);
 const max=quotes.find(q=>q.model==='MiniMax-H3-Max'&&q.spec==='768P');assert.deepEqual([max.inputPrice,max.outputPrice,max.imagePrice,max.freeImages],[.97,.5,.5,2]);
 assert.throws(()=>parseMiniMaxPrices(minimaxPriceSource,fixture.replace('¥0.97','待询价'),'2026-11-25T05:00:00Z'));
 assert.throws(()=>parseMiniMaxPrices(minimaxPriceSource,fixture.replaceAll('MiniMax-M3.1-Flash','OtherModel'),'2026-11-25T05:00:00Z'));
});
test('按模型与规格匹配报价，视频价格不流入文本、2K不流入768P',()=>{
 const h3=revenueQuote(quotes,{aiModel:'minimax-h3',modelSpec:'768P'}),m3=revenueQuote(quotes,{aiModel:'minimax-m3',modelSpec:'long'});
 assert.equal(h3.outputPrice,.5);assert.equal(m3.outputPrice,16.8);assert.equal(revenueQuote(quotes,{aiModel:'minimax-m25',modelSpec:'standard'}),null);
 assert.deepEqual(quotePrices(h3),{videoPrice:.5,videoInputPrice:.5,imagePrice:.2,freeImages:5});
});
test('全部模型、显卡与规格均有明确可编辑默认值，视频不套文本1.4倍TPS',()=>{
 for(const model of aiModels)for(const g of catalog)for(const [spec]of model.specs){
  const p=modelPreset({...defaultState,aiModel:model.id,model:g.id,modelSpec:spec}),prices=modelDefaults(model.id,spec);
  assert.ok(p.group>0);assert.equal(p.workloadType,model.kind);assert.ok(Object.values(prices).every(Number.isFinite));
  assert.ok(model.kind==='video'?p.genSeconds>0:p.tps>0);
 }
 const v={...defaultState,aiModel:'minimax-h3',modelSpec:'768P'};
 assert.equal(modelPreset(v).genSeconds,modelPreset({...v,scenario:'base'}).genSeconds);
 assert.equal(modelPreset({...v,modelSpec:'480P',videoEngine:'turbo4'}).genSeconds,117);
 assert.equal(modelPreset({...defaultState,aiModel:'minimax-m3',model:'b200-180'}).group,8);
 assert.equal(modelPreset({...defaultState,aiModel:'minimax-m31-flash',model:'b300-288'}).group,4);
});
const video={...defaultState,workloadType:'video',gpu:8,group:1,months:12,rent:1000,availability:100,utilization:50,scaling:100,videoDuration:15,genSeconds:590,overheadSeconds:10,success:80,refund:25,videoPrice:.5,videoInputSeconds:10,videoInputPrice:.4,referenceImages:7,freeImages:5,imagePrice:.2,saleDiscount:10};
test('视频按完整任务、成功交付、参考素材与退款计算，不混入Token收入',()=>{
 const c=calculate(video);assert.equal(c.fullAttempts,420480);assert.equal(c.attempts,210240);close(c.delivered,126144);
 close(c.output,1892160);close(c.input,1261440);close(c.outputRevenue,851472);close(c.imageRevenue,45411.84);close(c.revenue,1351002.24);
 assert.equal(c.outputTPS,0);assert.equal(c.cachedRevenue,0);close(c.revenue,calculate({...video,tps:999999,inputPrice:888,outputPrice:999,ratio:1000,cache:100}).revenue);
 close(c.unitCost,c.totalCost/c.output);close(c.costPerVideo,c.totalCost/c.delivered);
});
test('无订单、全部失败或全额退款时无收入，硬件与公司固定成本仍发生',()=>{
 for(const patch of [{utilization:0},{success:0},{refund:100}]){const c=calculate({...video,...patch});assert.equal(c.revenue,0);assert.equal(c.rent,96000);assert.ok(c.profit<0);assert.equal(c.unitCost,null);}
});
test('视频更慢、开销增加或空卡都会降低产能；整包计费不虚增产能',()=>{
 assert.ok(calculate({...video,genSeconds:1200}).delivered<calculate(video).delivered);
 assert.ok(calculate({...video,overheadSeconds:900}).delivered<calculate(video).delivered);
 const c=calculate({...video,gpu:9,group:8});assert.equal(c.replicas,1);assert.equal(c.billedCards,16);assert.equal(c.idle,1);
});
test('每台每卡利润分摊全公司净预算，部分八卡主机与零分母明确处理',()=>{
 for(const patch of [{},{gpu:9},{gpu:16,mode:'buy',purchase:50000,purchasePack:8}]){
  const c=calculate({...video,...patch});close(c.profitPerCard*c.gpu,c.profit);close(c.profitPerServer*c.servers,c.profit);close(c.monthlyProfitPerServer*c.servers*c.months,c.profit);close(c.monthlyProfitPerCard*c.gpu*c.months,c.profit);
 }
 const zero=calculate({...video,gpu:0,months:0});assert.equal(zero.profitPerCard,null);assert.equal(zero.profitPerServer,null);assert.equal(zero.monthlyProfitPerServer,null);
});
