const qudaoSkus=[
 ['cd81793f-2ef3-492c-b6dc-a017805ea591','A100 40GB'],
 ['b6c9bdd3-80ca-4645-a3b0-871f1e9d1088','A100 80GB'],
 ['000044eb-6391-4888-9b27-b255005cf468','RTX 4090 涡轮'],
 ['2ffd0536-b7ab-4890-8cb0-fa9d1d51b8a7','RTX 5090 涡轮'],
 ['d2881a24-f728-4724-b56e-e19527ea8bcc','RTX 5090 风扇'],
 ['36157b64-b365-44ee-9455-1f5722e2e0ac','RTX 5090 D V2'],
 ['dbf74adf-f69a-498b-915a-732c8b580eb0','RTX PRO 6000 D'],
 ['3edb8573-502e-4d38-bab8-be7ea3d8f447','L20'],
 ['aec92c99-69da-4376-8a04-c33a12d6f4b1','RTX PRO 6000 Max-Q'],
 ['7c52c6da-5b4f-4113-976e-73220f631876','RTX PRO 6000 工作站'],
 ['71e95311-6d75-4ae5-a529-4e8b3e2eacb1','RTX PRO 6000 服务器']
];
const cplightProducts=[
 [1365,'L40S 全新含税','product/l40s/1365'],
 [280,'L40','product/l40/280'],
 [1027,'A100 80GB','goods_detail/1027'],
 [1360,'H100 PCIe 全新含税','product/h100-pcie/1360'],
 [1743,'H200 NVL · 合肥源算','product/h200-nvl-141g/1743'],
 [2045,'H200 NVL · 奥昇','product/h200-nvl-141g/2045'],
 [1003,'H100 拆组八卡模组','product/refurbished-fan-backplane/1003'],
 [2556,'Dell B300 八卡整机','product/b300-server/2556']
];
export const purchaseSources=[
 ...qudaoSkus.map(([id,name])=>({id:'qudao-'+id,name:'宽泛采销 · '+name,url:'https://www.qudao.co/sku/'+id,kind:'buy'})),
 ...cplightProducts.map(([id,name,path])=>({id:'cplight-'+id,name:'算力之光 · '+name,url:'https://www.cplight.com/'+path,kind:'buy'})),
 {id:'aiswr-purchase',name:'北京数位人 · 整机采购',url:'https://www.aiswr.com/gpu-rental/fact-card/',kind:'buy'},
 {id:'zol-a800',name:'成都强川 / ZOL · A800历史挂牌',url:'https://price.zol.com.cn/1265/12653183_all.html',kind:'buy',encoding:'gb18030'},
 {id:'jd-5090d',name:'京东公开商品页 · RTX 5090 D 32GB',url:'https://item.jd.com/product/x6HZ1Egdphc3DVYPZA4CTA.html',kind:'buy'}
];
const purchaseAmount=s=>{const m=String(s).replace(/,/g,'').match(/([\d.]+)\s*(万)?/);return m?Number(m[1])*(m[2]?10000:1):NaN;};
const conditionOf=s=>/拆机|拆组|二手|95新/.test(s)?'拆机 / 二手':/全新/.test(s)?'全新':'成色未确认';
export function parsePurchase(src,html,at,{clean,modelId,quote,rows}){
 const result=[];
 if(src.id.startsWith('qudao-')){
  const paragraphs=[...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(m=>clean(m[1]));
  const offers=paragraphs.filter(t=>/今日(?:特价)?显卡现货(?:出货|供货)挂牌/.test(t)&&/(?:特价|货源)供货单价/.test(t));
  for(const t of offers){
   const title=t.match(/规格型号[：:]\s*([^。]+)/)?.[1],model=modelId(title||'');
   const raw=purchaseAmount(t.match(/(?:特价|货源)供货单价[：:]\s*[¥￥]([\d,.]+)/)?.[1]);
   const publishedAt=t.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
   if(!model||!(raw>0)||!publishedAt||!t.includes('上海宽泛科技有限公司直供'))throw Error('供货挂牌结构、主体或型号变化');
   const special=/特价供货/.test(t),conditionText=t.match(/【([^】]+)】/)?.[1]||'',condition=conditionOf(conditionText);
   const server=/服务器版/.test(title+conditionText),workstation=/工作站|MAX-Q/i.test(title),tax=/含税/.test(conditionText)?'明确含税；页面称可开13%增值税专票':'支持13%增值税专票；挂牌是否含税未明确';
   result.push(quote(src,at,{id:src.id+(special?'-special':'-regular'),category:'buy',model,variant:title,rawPrice:raw,unit:'gpu',scope:'card',cards:1,normalized:raw,publishedAt,condition,conditionText,priceKind:'供应商供货挂牌',region:'中国大陆 · 上海供应商直供（商品交付地需书面确认）',tax,stock:Number(t.match(/现货存量[：:]\s*(\d+)片/)?.[1])||null,defaultEligible:condition!=='拆机 / 二手'&&!workstation,edition:server?'服务器版':workstation?(/MAX-Q/i.test(title)?'Max-Q':'工作站版'):'版本见商品名称',evidence:t,notes:`${special?'特价供货':'普通供货'}；${conditionText||condition}；单卡，不含服务器配套。供货与求购价格已分开。库存为商家声明，批量价格及交货地需复核。${workstation?'工作站 / Max-Q 不自动替代服务器版。':''}`}));
  }
 }else if(src.id.startsWith('cplight-')){
  const section=html.match(/<section\b[^>]*aria-label="商品信息"[^>]*>([\s\S]*?)<\/section>/i)?.[1];
  if(!section)throw Error('商品信息区缺失，拒绝读取店铺推荐价格');
  const fields=Object.fromEntries([...section.matchAll(/<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi)].map(m=>[clean(m[1]),clean(m[2])]));
  const title=fields['商品名称']||'',description=clean(section),model=modelId(title+' '+(fields['商品分类']||''));
  const raw=purchaseAmount(fields['报价']),rawUnit=fields['报价']?.split('/').pop();
  if(!model||!(raw>0)||/定制|改装|扩容/.test(title))throw Error('商品型号、价格缺失或非标准定制卡');
  const cards=Number(title.match(/(\d+)\s*[- ]?(?:卡|GPU)/i)?.[1]||(/台|套/.test(rawUnit)?0:1));
  const scope=/模组/.test(title)?'module':/服务器|整机/.test(title)?'server':'card';
  const condition=conditionOf(description),pending=src.id==='cplight-2556';
  const primary=clean(html.slice(html.indexOf('<body')).split('店铺推荐')[0]);
  const tax=/含13%增值税/.test(description)?'明确含13%增值税':/含税/.test(primary)&&!/未税|不含税/.test(primary)?'页面标注含税；税率未说明':'含税与否未说明';
  result.push(quote(src,at,{id:src.id,category:'buy',model,variant:title,provider:'算力之光 · '+fields['供应商'],rawPrice:raw,unit:scope==='module'?'module':scope==='server'?'server':'gpu',scope,cards:cards||null,normalized:cards?raw/cards:null,condition,priceKind:'平台商户挂牌',stock:Number(fields['库存']?.match(/^\d+/)?.[0])||null,region:'境内平台商户挂牌 · 实际交付地未确认',tax,eligible:cards>0&&!pending,defaultEligible:false,evidence:description,notes:pending?'Dell XE9780八卡整机；期货/准现货报价未区分，1–2周或8–12周；库存字段64/128冲突，交货地未确认。仅线索，不自动测算。':`${scope==='module'?'GPU模组，不是完整服务器':scope==='card'?'单卡，不含服务器配套':'整机'}；${condition}；报价日未公布，交付地待确认。可手动用作预算参考，不自动匹配。`}));
 }else if(src.id==='aiswr-purchase'){
  const t=clean(html),publishedAt=t.match(/价格确认日\s*(\d{4}-\d{2}-\d{2})/)?.[1];if(!publishedAt)throw Error('未找到独立价格确认日期');
  for(const r of rows(html)){
   const name=r[0]||'';if(!/H200|B300/.test(name)||!/买断|购买/.test(name))continue;
   const b300=/B300/.test(name),m=r[2]?.match(/([\d,.]+)\s*万元\s*\/\s*台/);if(!m)throw Error('人民币整机价格缺失');
   const raw=purchaseAmount(m[1]+'万'),cards=Number(name.match(/(\d+)\s*卡/)?.[1])||null;
   result.push(quote(src,at,{id:'aiswr-'+(b300?'b300':'h200'),category:'buy',model:b300?'b300-288':'h200-141',variant:name,rawPrice:raw,unit:'server',scope:'server',cards,normalized:cards?raw/cards:null,publishedAt,priceKind:'有日期的旧挂牌参考',condition:'成色未确认',tax:'是否含税以书面报价单为准；支持增值税专票',region:b300?'海南自贸区 · 提离及交付条件待确认':'中国大陆 · 北京（供应商声明）',eligible:!!cards,defaultEligible:false,evidence:r.join(' | '),notes:`价格确认日${publishedAt}，每日重读不改变此日期。${b300?'仅保留海南人民币价，排除香港美元价；卡数不明，不能除以8。':'八卡整机买断，非月租；配置与互联待书面确认。'}`}));
  }
 }else if(src.id==='zol-a800'){
  const rr=rows(html),row=rr.find(r=>/A800.*80G/i.test(r[0]||'')&&r.length===4),t=clean(html);
  const d=t.match(/价格采集日期[：:]\s*(\d{4})年(\d{1,2})月(\d{1,2})日/),raw=purchaseAmount(row?.[2]);
  if(!row||!d||!(raw>0)||!t.includes('成都强川科技有限公司'))throw Error('经销商历史报价表结构变化');
  result.push(quote(src,at,{id:src.id,category:'buy',model:'a800-80',variant:'NVIDIA Tesla A800 80G · 历史经销商挂牌',rawPrice:raw,unit:'gpu',scope:'card',cards:1,normalized:raw,publishedAt:`${d[1]}-${d[2].padStart(2,'0')}-${d[3].padStart(2,'0')}`,priceKind:'有日期的旧挂牌参考',condition:'全新（文章声明）',region:'中国大陆 · 成都商家，现货需重新核验',defaultEligible:false,evidence:row.join(' | '),notes:'经销商在ZOL发布的历史促销，非今日重新确认价；不自动匹配。单卡，不含服务器。'}));
 }else if(src.id==='jd-5090d'){
  const primary=html.split('<div class="itemInfo-wrap">')[1]||'',title=clean(primary.match(/class="sku-name-title"[^>]*>([\s\S]*?)<\/span>/)?.[1]||'');
  const price=primary.match(/class="price-seo"[\s\S]*?class="value"[^>]*>([\s\S]*?)<\/div>/)?.[1],raw=purchaseAmount(clean(price||''));
  if(modelId(title)!=='rtx5090d-32'||!(raw>0)||!/32G/.test(title))throw Error('京东当前SKU或公开价格缺失，拒绝使用推荐商品/搜索快照');
  result.push(quote(src,at,{id:src.id,category:'buy',model:'rtx5090d-32',variant:title,rawPrice:raw,unit:'gpu',scope:'card',cards:1,normalized:raw,condition:conditionOf(title),priceKind:'电商公开展示价',region:'京东大陆站 · 实际送货地址库存待确认',defaultEligible:false,evidence:`${title}；当前商品公开价格${raw}元`,notes:'未登录公开展示价，不是登录后到手价；标题混列品牌，具体SKU、发票、库存需核验。单卡，不含服务器。'}));
 }
 if(!result.length)throw Error('未解析到可核验采购供货价');return result;
}
