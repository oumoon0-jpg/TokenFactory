export const minimaxPriceSource={id:'minimax-official',name:'MiniMax 开放平台 · 人民币按量价',url:'https://platform.minimaxi.com/docs/pricing/overview.md',kind:'models'};
export function parseMiniMaxPrices(src,body,at){
 const result=[],day=new Date(new Date(at).getTime()+8*3600000).toISOString().slice(0,10);
 const base={source:src.id,provider:src.name,url:src.url,observedAt:at,day,publishedAt:null,currency:'CNY',region:'中国大陆 · MiniMax开放平台人民币报价',tax:'含税与否未说明',eligible:true,cards:1,notes:'官方API零售参考价，不代表自营成交价或供应商结算价；自托管版本与API版本的质量及性能需单独核验。'};
 const numeric=cell=>Number(cell.replace(/~~[^~]*~~/g,'').replace(/[*¥￥\s]/g,''));
 let priorityTier=false;
 for(const line of body.split('\n')){
  if(/\[tab\]\s*优先/.test(line))priorityTier=true;
  if(/\[tab\]\s*标准/.test(line))priorityTier=false;
  if(priorityTier)continue;
  if(!/\|.*MiniMax-M(?:3\.1-Flash|3)\*?/.test(line))continue;
  const cells=line.replace(/^>\s*/,'').split('|').slice(1,-1).map(x=>x.trim());
  if(cells.length!==4)continue;
  const model=cells[0].includes('M3.1')?'MiniMax-M3.1-Flash':'MiniMax-M3',spec=/>(?:\s|\*)*512/.test(cells[0])?'long':'standard';
  if(result.some(q=>q.model===model&&q.spec===spec))throw Error('MiniMax文本标准定价重复，需检查页面');
  const [inputPrice,outputPrice,cachePrice]=cells.slice(1).map(numeric);if(![inputPrice,outputPrice,cachePrice].every(x=>x>0&&Number.isFinite(x)))throw Error('MiniMax文本价格单元格变化');
  result.push({...base,id:`minimax-${model.toLowerCase().replaceAll('.','-')}-${spec}`,category:'token',model,spec,variant:spec==='long'?'标准服务，输入 >512K':'标准服务',inputPrice,outputPrice,cachePrice,rawPrice:inputPrice,normalized:inputPrice,unit:'million_tokens'});
 }
 const videoSection=body.split('### H3 系列旗舰模型')[1]?.split('### 视频再生成')[0]||'';
 const flagshipImages=Number(videoSection.match(/每次任务前\s*\*\*(\d+)\s*张\*\*免费/)?.[1]);
 const maxImages=Number(videoSection.split('### H3 系列扩展模型')[1]?.match(/每次任务前\s*\*\*(\d+)\s*张\*\*图片免费/)?.[1]);
 if(!Number.isFinite(flagshipImages)||!Number.isFinite(maxImages))throw Error('MiniMax图片免费额度未匹配');
 const section=[...videoSection.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)].filter(m=>/输出分辨率/.test(m[1])&&/每秒/.test(m[1])).map(m=>m[1]).join('\n');let current='';
 for(const row of section.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const cells=[...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>m[1].replace(/<[^>]*>/g,'').trim());if(!cells.length)continue;
  if(cells.length===5){current=cells.shift().match(/MiniMax-H3(?:-Highspeed|-Lite|-Max)?/)?.[0]||'';}
  if(!current||cells.length!==4)continue;
  const [spec,...values]=cells,[outputPrice,inputPrice,imagePrice]=values.map(numeric);if(!['768P','480P','2K'].includes(spec)||![outputPrice,inputPrice,imagePrice].every(x=>x>0&&Number.isFinite(x)))throw Error('MiniMax视频价格表结构变化');
  result.push({...base,id:`minimax-${current.toLowerCase()}-${spec.toLowerCase()}`,category:'video',model:current,spec,variant:`${spec} · 原生音画`,outputPrice,inputPrice,imagePrice,freeImages:current.endsWith('-Max')?maxImages:flagshipImages,rawPrice:outputPrice,normalized:outputPrice,unit:'video_second'});
 }
 if(result.filter(q=>q.category==='token').length!==3||result.filter(q=>q.category==='video').length!==8)throw Error('MiniMax模型价格覆盖不完整，保留上次报价');
 return result;
}
