export const observedAge=(q,now=Date.now())=>(now-new Date(q.observedAt).getTime())/86400000;
export const publishedAge=(q,now=Date.now())=>q.publishedAt?(now-new Date(q.publishedAt+'T00:00:00+08:00').getTime())/86400000:null;
export function autoComparable(q,now=Date.now()){
 if(!q.eligible||q.defaultEligible===false||!Number.isFinite(q.normalized)||q.normalized<=0)return false;
 if(q.category!=='buy')return true;
 const age=publishedAge(q,now);
 return age!==null&&age>=0&&age<14&&observedAge(q,now)<2&&!/拆机|二手/.test(q.condition||'')&&!/MAX-Q|工作站/i.test(q.variant||'');
}
export function selectQuote(quotes,kind,model,now=Date.now()){
 const qs=quotes.filter(q=>q.category===kind&&q.model===model&&autoComparable(q,now));
 const live=qs.filter(q=>observedAge(q,now)<2),pool=live.length?live:qs;
 return pool.sort((a,b)=>a.normalized-b.normalized)[0];
}
