import {purchaseSources,parsePurchase} from './purchase.mjs';
export const sources=[
 {id:'gongji',name:'共绩算力',url:'https://suanli.cn/price/',kind:'rent'},
 {id:'apetops',name:'猿界算力',url:'https://www.apetops.com/index.html',kind:'rent'},
 {id:'qxlc-659',name:'全芯联储 · 5090八卡整机',url:'https://www.qxlc.chat/product/659',kind:'buy'},
 {id:'qxlc-655',name:'全芯联储 · 5090单卡',url:'https://www.qxlc.chat/product/655',kind:'buy'},
 {id:'qxlc-658',name:'全芯联储 · H200整机',url:'https://www.qxlc.chat/product/658',kind:'buy'},
 {id:'qxlc-667',name:'全芯联储 · B300整机',url:'https://www.qxlc.chat/product/667',kind:'buy'},
 {id:'qxlc-120',name:'全芯联储 · PRO6000',url:'https://www.qxlc.chat/product/120',kind:'buy'},
 {id:'qxlc-628',name:'全芯联储 · PRO6000服务器版',url:'https://www.qxlc.chat/product/628',kind:'buy'},
 {id:'qxlc-627',name:'全芯联储 · H200 NVL单卡',url:'https://www.qxlc.chat/product/627',kind:'buy'},
 {id:'qxlc-556',name:'全芯联储 · H100拆机单卡',url:'https://www.qxlc.chat/product/556',kind:'buy'},
 ...purchaseSources,
 {id:'aliyun',name:'阿里云百炼 · MiniMax官方供给',url:'https://help.aliyun.com/zh/model-studio/minimax-m2-5-by-minimax',kind:'token'}
];
export const cnDay=(d=new Date())=>new Date(+d+8*3600000).toISOString().slice(0,10);
export function clean(t){return t.replace(/<!--[\s\S]*?-->/g,' ').replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&yen;|&#165;/g,'¥').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();}
const rows=html=>[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>[...m[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(c=>clean(c[1])));
const amount=s=>Number(String(s).replace(/,/g,'').match(/\d+(?:\.\d+)?/)?.[0]);
export function modelId(name,mem=''){
 const n=name.toUpperCase().replace(/\s+/g,'');const m=String(mem)||n;
 if(/定制|改装|扩容/.test(n))return null;
 if(/4090/.test(n))return /4090D|48\s*G/i.test(n+m)?null:'rtx4090-24';
 if(/5090/.test(n)){if(/5090DV2/.test(n))return 'rtx5090dv2-24';if(/5090D/.test(n))return /24\s*G/i.test(n+m)?null:'rtx5090d-32';return 'rtx5090-32';}
 if(/(?:PRO)?6000D/.test(n))return 'rtxpro6000d-84';
 if(/PRO6000/.test(n))return 'rtxpro6000-96';
 if(/B300/.test(n))return 'b300-288';if(/B200/.test(n))return 'b200-180';
 if(/H200/.test(n))return 'h200-141';if(/H800/.test(n))return 'h800-80';if(/H100/.test(n))return /94\s*G/i.test(n+m)?null:'h100-80';
 if(/H20/.test(n))return /141/.test(m)?'h20-141':'h20-96';
 if(/A100/.test(n))return /A10040G|(?:^|\D)40\s*(?:G|$)/i.test(m)?'a100-40':'a100-80';
 if(/A800/.test(n))return /40/.test(m)?null:'a800-80';
 if(/L40S/.test(n))return 'l40s-48';if(/L40/.test(n))return 'l40-48';if(/L20/.test(n))return 'l20-48';return null;
}
function quote(src,at,data){return {source:src.id,provider:src.name,url:src.url,day:cnDay(new Date(at)),observedAt:at,publishedAt:null,currency:'CNY',region:'中国大陆供应商；实际节点待确认',tax:'含税与否未说明',eligible:true,notes:'公开挂牌；库存、全年锁价及批量折扣未确认。',...data};}
function normalized(price,cards,unit){return unit==='server_30day'?price/cards*365/360:unit==='gpu_hour'?price*365*24/12:price/cards;}
export function parseSource(src,html,at=new Date().toISOString()){
 if(purchaseSources.some(s=>s.id===src.id))return parsePurchase(src,html,at,{clean,modelId,quote,rows});
 const result=[];
 if(src.id==='gongji'){
  const tables=[...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)];
  for(const table of tables){const rr=rows(table[1]),head=rr[0]?.join(' ')||'';const month=/30\s*天/.test(head)&&/8\s*卡/.test(head),hour=/GPU.*显存.*价格/.test(head)&&rr[0].length===3;
   if(!month&&!hour)continue;
   for(const r of rr.slice(1)){if(r.length!==(month?6:3))continue;const model=modelId(r[0],r[1]);if(!model)continue;const raw=amount(r[month?5:2]);if(!(raw>0))throw Error('价格单元格为空或非正数');const unit=month?'server_30day':'gpu_hour',cards=month?8:1;
    result.push(quote(src,at,{id:`gongji-${model}-${unit}`,category:'rent',model,variant:r[0],vram:amount(r[1]),rawPrice:raw,unit,cards,normalized:normalized(raw,cards,unit),periodDays:month?30:null,evidence:r.join(' | '),notes:month?'八卡整机30天包；按365天/12个月均摊。PRO6000版本未注明。税、电费及网络边界需确认。':'单卡按量小时价，按730小时折算月成本；不是包月合同。'}));
   }
  }
  if(result.length<8)throw Error('共绩价格表结构变化或有效型号不足');
 }else if(src.id==='apetops'){
  const blocks=html.split(/<div\s+class="swiper-slide"/i);
  for(const b of blocks){const title=clean(b.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i)?.[1]||'');if(!title)continue;const gp=clean(b.match(/<strong>GPU\s*[：:]<\/strong>([\s\S]*?)<\/p>/i)?.[1]||'');const model=modelId(title,gp);if(!model)continue;
   const raw=Number(clean(b).match(/[￥¥]\s*([\d,]+(?:\.\d+)?)\s*元\s*\/\s*月/)?.[1]?.replace(/,/g,''));const cards=Number(title.match(/(\d+)\s*卡/)?.[1]||gp.match(/[*×]\s*(\d+)/)?.[1]);if(!(raw>0&&cards>0))continue;
   const variant=/PCIE/i.test(title+gp)?'PCIe':/SXM|HGX|NVLink/i.test(gp)?'SXM-HGX':'未注明互联';
   result.push(quote(src,at,{id:`apetops-${model}-${variant}-${cards}`,category:'rent',model,variant,cards,rawPrice:raw,unit:'server_month',normalized:raw/cards,evidence:`${raw}元/月；${title}；${gp}`,notes:'整机包月挂牌，按整台起租；显存/互联/机房及电费需向供应商确认。'}));
  }
  if(result.length<4)throw Error('猿界产品卡片结构变化或无法匹配价格');
 }else if(src.id.startsWith('qxlc-')){
  const title=clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');const model=modelId(title);if(!model)throw Error('采购型号未识别或页面已失效');
  const raw=amount(clean(html.match(/<span[^>]*data-price[^>]*>([\s\S]*?)<\/span>/i)?.[1]||''));
  const content=clean(html.slice(html.search(/<h1\b/i))).split('同类推荐')[0];const cards=Number(title.match(/(\d+)\s*卡/)?.[1]||(/服务器(?!版)|整机|模组/.test(title)?0:1));
  if(!(raw>0))throw Error('采购价格面议或未公开数字');
  const shenzhen=content.includes('全新深圳现货'),hongkong=/香港现货/.test(content),eligible=shenzhen&&cards>0;
  result.push(quote(src,at,{id:src.id,category:'buy',model,variant:title,rawPrice:raw,unit:cards===1?'gpu':'server',scope:cards===1?'card':'server',cards:cards||null,normalized:cards?raw/cards:null,eligible,defaultEligible:eligible,condition:/拆机/.test(title)?'拆机 / 二手':/全新/.test(content)?'全新':'成色未确认',priceKind:'平台商户挂牌',region:hongkong?'香港现货，转大陆交付待确认':shenzhen?'中国大陆 · 深圳现货':'交货地区未确认',publishedAt:content.match(/发布时间\s*(\d{4}-\d{2}-\d{2})/)?.[1]||null,evidence:`${title}；平台报价${raw}元；${shenzhen?'全新深圳现货':hongkong?'香港现货':'地点未确认'}`,notes:eligible?(cards===1?'单卡报价，不含服务器配套；具体版本、库存和税况需确认。':'八卡整机分摊参考，三种配置未细分，显存和最终配置需确认；不是裸卡价格。'):'未满足大陆现货、卡数或配置确认条件，不自动用于测算。'}));
 }else if(src.id==='aliyun'){
  const rr=rows(html),price={};for(const r of rr){if(r.length!==3||!r[2].includes('百万'))continue;const n=amount(r[1]);if(r[0]==='输入')price.inputPrice=n;else if(r[0]==='输出')price.outputPrice=n;else if(/缓存命中/.test(r[0]))price.cachePrice=n;}
  if(!Object.values(price).every(n=>n>0)||Object.keys(price).length!==3||!html.includes('华北2'))throw Error('Token定价表结构变化或大陆区域未匹配');
  result.push(quote(src,at,{id:'aliyun-minimax-m25',category:'token',model:'MiniMax-M2.5',rawPrice:price.inputPrice,unit:'million_tokens',cards:1,normalized:price.inputPrice,...price,region:'中国大陆 · 华北2（北京）',evidence:`输入${price.inputPrice}；输出${price.outputPrice}；缓存${price.cachePrice}元/百万tokens`,notes:'公开调用原价，供给方MiniMax；作为销售报价参考，不代表自营工厂可实现的成交价。'}));
 }
 if(!result.length)throw Error('未解析到可验证报价');return result;
}
export async function collect(fetcher=fetch){
 const reports=new Array(sources.length);let next=0;
 await Promise.all(Array.from({length:5},async()=>{while(next<sources.length){const index=next++,src=sources[index],start=new Date().toISOString();try{const r=await fetcher(src.url,{headers:{'User-Agent':'TokenFactoryPriceMonitor/1.0 (public price observation)','Accept':'text/html'},signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(`HTTP ${r.status}`);const html=src.encoding?new TextDecoder(src.encoding).decode(await r.arrayBuffer()):await r.text();if(html.length>4000000)throw Error('页面超过解析上限');const quotes=parseSource(src,html,start);reports[index]={source:src.id,name:src.name,status:'success',observedAt:start,count:quotes.length,quotes};}catch(e){reports[index]={source:src.id,name:src.name,status:'failed',observedAt:start,count:0,error:String(e.message).slice(0,220),quotes:[]};}}}));
 return{startedAt:reports.map(x=>x.observedAt).sort()[0],finishedAt:new Date().toISOString(),status:reports.every(x=>x.status==='success')?'success':reports.some(x=>x.status==='success')?'partial':'failed',quotes:reports.flatMap(x=>x.quotes),sources:reports.map(({quotes,...x})=>x)};
}
