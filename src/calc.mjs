export const number=(x,fallback=0)=>Number.isFinite(Number(x))&&x!==''&&x!==null?Number(x):fallback;
const pct=x=>Math.max(0,Math.min(100,number(x)))/100;
export function calculate(s){
 const months=Math.max(0,number(s.months)),gpu=Math.max(0,Math.floor(number(s.gpu))),group=Math.max(1,Math.floor(number(s.group,8))),replicas=Math.floor(gpu/group),idle=gpu-replicas*group,days=365*months/12;
 const ratio=Math.max(0,number(s.ratio)),weight=Math.max(0,number(s.prefillWeight)),workloadFactor=(1+Math.max(0,number(s.baseRatio))*weight)/(1+ratio*weight);
 const outputTPS=replicas*Math.max(0,number(s.tps))*pct(s.scaling)*workloadFactor,fullOutput=outputTPS*days*86400*pct(s.availability),output=fullOutput*pct(s.utilization),input=output*ratio;
 const cached=input*pct(s.cache),ordinary=input-cached,discount=1-pct(s.saleDiscount),ordinaryRevenue=ordinary/1e6*number(s.inputPrice)*discount,cachedRevenue=cached/1e6*number(s.cachePrice)*discount,outputRevenue=output/1e6*number(s.outputPrice)*discount,revenue=ordinaryRevenue+cachedRevenue+outputRevenue;
 const rentPack=Math.max(1,Math.floor(number(s.rentPack,1))),purchasePack=Math.max(1,Math.floor(number(s.purchasePack,1))),billedCards=s.mode==='buy'?Math.ceil(gpu/purchasePack)*purchasePack:Math.ceil(gpu/rentPack)*rentPack;
 const missingPrice=(s.mode==='buy'?s.purchase:s.rent)===null||(s.mode==='buy'?s.purchase:s.rent)==='';
 const rent=s.mode==='rent'?billedCards*number(s.rent)*months*(1-pct(s.rentDiscount)):0,capex=s.mode==='buy'?billedCards*number(s.purchase)+number(s.extraHardware):0,depreciation=s.mode==='buy'?capex*(1-pct(s.residual))*Math.min(months/12/Math.max(0.1,number(s.depreciationYears,3)),1):0;
 const salaries=(number(s.n1)*number(s.s1)+number(s.n2)*number(s.s2)+number(s.n3)*number(s.s3))*months,personnel=salaries*(1+pct(s.social))+number(s.bonus)*months/12;
 const ops=['office','admin','sales','other','reserve','maintenance','insurance','finance'].reduce((n,k)=>n+number(s[k]),0)*months,infrastructure=['network','storage','software','hosting'].reduce((n,k)=>n+number(s[k]),0)*months;
 const electricity=s.powerMode==='included'?0:(billedCards*number(s.gpuWatts)+Math.ceil(billedCards/8)*number(s.hostWatts))/1000*days*24*number(s.pue,1)*number(s.powerPrice);
 const startup=number(s.setup),fixed=rent+personnel+ops+infrastructure+electricity+depreciation+startup,salesFees=revenue*pct(s.fee),turnoverTax=revenue*pct(s.revenueTax),pretax=revenue-fixed-salesFees-turnoverTax,incomeTax=Math.max(0,pretax)*pct(s.incomeTax);
 const profit=pretax-incomeTax,totalCost=fixed+salesFees+turnoverTax+incomeTax,cash=profit+depreciation-capex-number(s.deposit),contribution=1-pct(s.fee)-pct(s.revenueTax);
 const fullRevenue=fullOutput/1e6*(ratio*((1-pct(s.cache))*number(s.inputPrice)+pct(s.cache)*number(s.cachePrice))+number(s.outputPrice))*discount,breakRevenue=contribution>0?fixed/contribution:null,breakUtil=fullRevenue>0&&breakRevenue!==null?breakRevenue/fullRevenue*100:null;
 return{months,gpu,days,replicas,idle,billedCards,outputTPS,workloadFactor,output,input,cached,ordinary,ordinaryRevenue,cachedRevenue,outputRevenue,revenue,rent,capex,depreciation,personnel,ops,infrastructure,electricity,startup,fixed,salesFees,turnoverTax,pretax,incomeTax,profit,totalCost,cash,breakRevenue,breakUtil,fullRevenue,missingPrice,unitCost:input+output>0?totalCost/((input+output)/1e6):null,unitPrice:input+output>0?revenue/((input+output)/1e6):null};
}
