import {catalog,preset} from './catalog.mjs';

export const modelPricingUrl='https://platform.minimaxi.com/docs/pricing/overview.md';
export const videoBenchmarkUrl='https://github.com/shaozheng0503/minimax-h3-turbo';
export const aiModels=[
 {id:'minimax-m25',name:'MiniMax M2.5',api:'MiniMax-M2.5',kind:'text',specs:[['standard','标准文本']],prices:{standard:[2.1,8.4,.21]},source:'https://help.aliyun.com/zh/model-studio/minimax-m2-5-by-minimax'},
 {id:'minimax-m31-flash',name:'MiniMax M3.1 Flash',api:'MiniMax-M3.1-Flash',kind:'text',specs:[['standard','标准文本']],prices:{standard:[1,4,.1]},weightGB:252,source:modelPricingUrl,deploy:'https://platform.minimax.cn/docs/guides/local-deploy-m3-1-flash'},
 {id:'minimax-m3',name:'MiniMax M3',api:'MiniMax-M3',kind:'text',specs:[['standard','标准服务 · 输入 ≤ 512K'],['long','标准服务 · 输入 > 512K']],prices:{standard:[2.1,8.4,.42],long:[4.2,16.8,.84]},weightGB:444,source:modelPricingUrl,deploy:'https://platform.minimax.cn/docs/guides/local-deploy-m3'},
 {id:'minimax-h3',name:'MiniMax H3',api:'MiniMax-H3',kind:'video',specs:[['768P','768P'],['2K','2K · 需额外再生成链路']],prices:{'768P':[.5,.5,.2],'2K':[.8,.8,.2]},freeImages:5,source:modelPricingUrl},
 {id:'minimax-h3-highspeed',name:'MiniMax H3 Highspeed',api:'MiniMax-H3-Highspeed',kind:'video',specs:[['768P','768P'],['480P','480P']],prices:{'768P':[.4,.4,.2],'480P':[.26,.26,.2]},freeImages:5,source:modelPricingUrl},
 {id:'minimax-h3-lite',name:'MiniMax H3 Lite',api:'MiniMax-H3-Lite',kind:'video',specs:[['768P','768P'],['480P','480P']],prices:{'768P':[.26,.26,.13],'480P':[.16,.16,.13]},freeImages:5,source:modelPricingUrl},
 {id:'minimax-h3-max',name:'MiniMax H3 Max',api:'MiniMax-H3-Max',kind:'video',specs:[['768P','768P'],['480P','480P']],prices:{'768P':[.5,.97,.5],'480P':[.33,.37,.5]},freeImages:2,source:modelPricingUrl}
];
export const aiModel=id=>aiModels.find(m=>m.id===id)||aiModels[0];
export function modelDefaults(id,spec){const m=aiModel(id),p=m.prices[spec]||m.prices[m.specs[0][0]];return m.kind==='text'?{inputPrice:p[0],outputPrice:p[1],cachePrice:p[2],cache:0,saleDiscount:0}:{videoPrice:.2,videoInputPrice:.2,imagePrice:p[2],freeImages:m.freeImages,videoInputSeconds:0,referenceImages:0,saleDiscount:0,refund:0};}
// Multipliers are deliberately budget assumptions, not a GPU performance ranking.
const videoSpeed={'rtx5090-32':1,'rtx4090-24':.65,'rtx5090d-32':.8,'rtx5090dv2-24':.7,'rtxpro6000-96':1.15,'rtxpro6000d-84':.95,'l20-48':.4,'l40s-48':.55,'l40-48':.5,'a100-40':.5,'a100-80':.55,'a800-80':.5,'h20-96':.5,'h20-141':.6,'h800-80':.85,'h100-80':.9,'h200-141':1.1,'b200-180':1.6,'b300-288':1.9};
export function modelPreset(s){
 const m=aiModel(s.aiModel),g=catalog.find(g=>g.id===s.model)||catalog[0],base=preset(g.id,s.gpu,s.scenario);
 if(m.kind==='text'){
  if(!m.weightGB)return{...base,workloadType:'text'};
  // Reserve 25% for runtime state. This memory budget does not establish deployment compatibility.
  const minimum=Math.ceil(m.weightGB*1.25/g.vram),group=m.id==='minimax-m3'&&g.id==='b200-180'?8:g.id==='b300-288'?4:m.id==='minimax-m3'&&g.id==='h200-141'?8:Math.pow(2,Math.ceil(Math.log2(Math.max(1,minimum))));
  return {...base,workloadType:'text',group,tps:Math.round(base.tps/base.group*group*.5)};
 }
 const duration=Math.max(1,Number(s.videoDuration)||15),table=s.modelSpec==='480P'?[38,65,117]:s.modelSpec==='2K'?[228*4,584*4,1472*4]:[75,168,375];
 const anchors=[5,10,15];let seconds;
 if(duration<=5)seconds=table[0]*duration/5;else if(duration>=15)seconds=table[2]*duration/15;else{const i=duration<=10?0:1;seconds=table[i]+(table[i+1]-table[i])*(duration-anchors[i])/5;}
 const resolutionFactor=s.modelSpec==='768P'?Math.pow(768/720,2):1,stepsFactor=s.videoEngine==='turbo4'?1:5;
 return{workloadType:'video',group:1,genSeconds:Math.round(seconds*resolutionFactor*stepsFactor/videoSpeed[g.id]),overheadSeconds:30,videoDuration:duration,success:95,availability:base.availability,utilization:base.utilization,scaling:95};
}
export function capacityEvidence(s){
 const m=aiModel(s.aiModel);
 if(m.kind==='video')return `预算推算：基于社区 RTX 5090 的 H3 Turbo 四步热启动测试（720P / 15秒耗时375秒；480P / 15秒耗时117秒），768P按像素比例换算；20步按5倍耗时、2K按1080P的4倍工作量推算，其他显卡使用规划速度系数。选中的 ${m.name} 是销售对标产品，公开 H3-Base / Turbo 的部署、质量及性能不等同于这些 API 产品；2K还需额外链路。30秒任务开销、95%成功率及95%集群效率均为可编辑预算假设。`;
 if(m.weightGB)return `预算推算：${m.name} 权重约 ${m.weightGB}GB；显存预算额外预留25%，不足时增加副本卡数。官方参考配置为${m.id==='minimax-m3'?'8×B200 / 4×B300 / 8×H200':'4×B300'}。其余配置未核验可部署；默认TPS按原M2.5每卡规划吞吐量的50%折算，不是本模型实测，长上下文也必须重新压测。`;
 return '';
}
export function revenueQuote(quotes,s){const m=aiModel(s.aiModel);return quotes.filter(q=>q.eligible&&q.model===m.api&&q.category===(m.kind==='video'?'video':'token')&&(q.spec||'standard')===(s.modelSpec||m.specs[0][0])).sort((a,b)=>b.observedAt.localeCompare(a.observedAt))[0]||null;}
export function quotePrices(q){return q.category==='video'?{videoPrice:q.outputPrice,videoInputPrice:q.inputPrice,imagePrice:q.imagePrice,freeImages:q.freeImages}:{inputPrice:q.inputPrice,outputPrice:q.outputPrice,cachePrice:q.cachePrice};}
