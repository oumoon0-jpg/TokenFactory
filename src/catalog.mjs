export const catalog = [
 {id:'rtx5090-32',name:'RTX 5090 · 32GB',vram:32,group:8,tps:1500,evidence:'legacy',notes:'沿用上一版每8卡1,500输出TPS规划假设；INT4部署，未经同负载压测。'},
 {id:'rtx4090-24',name:'RTX 4090 · 24GB',vram:24,group:8,tps:900,evidence:'estimate'},
 {id:'rtx5090d-32',name:'RTX 5090 D · 32GB',vram:32,group:8,tps:1200,evidence:'estimate'},
 {id:'rtx5090dv2-24',name:'RTX 5090 D v2 · 24GB',vram:24,group:8,tps:1050,evidence:'estimate'},
 {id:'rtxpro6000-96',name:'RTX PRO 6000 · 96GB（版本见报价）',vram:96,group:4,tps:1900,evidence:'legacy',notes:'服务器、工作站和Max-Q版本分别在报价中标明；未明版本租赁需核验。每4卡1,900 TPS仅为规划假设，不代表不同版本性能相同。'},
 {id:'rtxpro6000d-84',name:'RTX PRO 6000 D · 84GB',vram:84,group:4,tps:1500,evidence:'estimate'},
 {id:'l20-48',name:'L20 · 48GB',vram:48,group:8,tps:650,evidence:'estimate'},
 {id:'l40s-48',name:'L40S · 48GB',vram:48,group:8,tps:800,evidence:'estimate'},
 {id:'l40-48',name:'L40 · 48GB',vram:48,group:8,tps:700,evidence:'estimate'},
 {id:'a100-40',name:'A100 · 40GB',vram:40,group:8,tps:600,evidence:'estimate'},
 {id:'a100-80',name:'A100 · 80GB',vram:80,group:4,tps:550,evidence:'estimate'},
 {id:'a800-80',name:'A800 · 80GB',vram:80,group:4,tps:450,evidence:'estimate'},
 {id:'h20-96',name:'H20 · 96GB',vram:96,group:4,tps:550,evidence:'estimate'},
 {id:'h20-141',name:'H20 · 141GB',vram:141,group:4,tps:650,evidence:'estimate'},
 {id:'h800-80',name:'H800 · 80GB',vram:80,group:4,tps:800,evidence:'estimate'},
 {id:'h100-80',name:'H100 · 80GB',vram:80,group:4,tps:849,evidence:'benchmark',ratio:8,notes:'Lambda：4×H100、输入8192/输出1024、并发32、SGLang，输出849 TPS。'},
 {id:'h200-141',name:'H200 · 141GB',vram:141,group:4,tps:1200,evidence:'estimate'},
 {id:'b200-180',name:'B200 · 180GB',vram:180,group:2,tps:896,evidence:'benchmark',ratio:8,notes:'Lambda：2×B200、输入8192/输出1024、并发32、SGLang，输出896 TPS。'},
 {id:'b300-288',name:'B300 · 288GB',vram:288,group:2,tps:1250,evidence:'estimate'}
];
export const scenarios={optimistic:{label:'乐观上限',multiplier:1.4,availability:99.5,utilization:100},base:{label:'基准经营',multiplier:1,availability:98,utilization:53},cautious:{label:'保守起步',multiplier:0.7,availability:97,utilization:30}};
export const defaultState={model:'rtx5090-32',gpu:64,months:12,mode:'rent',scenario:'optimistic',group:8,tps:2100,availability:99.5,utilization:100,ratio:4,baseRatio:4,prefillWeight:0.05,scaling:100,inputPrice:2.1,outputPrice:8.4,cachePrice:0.21,cache:0,saleDiscount:0,rent:null,rentPack:8,purchase:null,purchasePack:8,rentDiscount:0,extraHardware:0,depreciationYears:3,residual:10,powerMode:'included',gpuWatts:575,hostWatts:600,pue:1.3,powerPrice:0.65,hosting:0,n1:1,s1:40000,n2:1,s2:25000,n3:1,s3:20000,social:23.5294117647,bonus:0,office:3000,admin:2000,sales:3000,network:1500,storage:1000,software:500,other:0,reserve:6000,maintenance:0,insurance:0,setup:0,deposit:0,finance:0,fee:5,revenueTax:0,incomeTax:25};
export function preset(model,gpu,key){const g=catalog.find(x=>x.id===model)||catalog[0],s=scenarios[key]||scenarios.optimistic;return{group:g.group,tps:g.tps*s.multiplier,availability:s.availability,utilization:s.utilization,ratio:g.ratio||4,baseRatio:g.ratio||4,scaling:100};}
export const benchmarkUrl='https://lambda.com/inference-models/minimaxai/minimax-m2.5';
