export async function saveQuotes(db,quotes){
 if(!quotes.length)return;await db.batch(quotes.map(q=>db.prepare('INSERT INTO quotes(day,id,source,category,model,observed_at,data) VALUES(?,?,?,?,?,?,?) ON CONFLICT(day,id) DO UPDATE SET observed_at=excluded.observed_at,data=excluded.data WHERE excluded.observed_at>quotes.observed_at').bind(q.day,q.id,q.source,q.category,q.model,q.observedAt,JSON.stringify(q))));
}
export async function saveRun(db,report,id=crypto.randomUUID()){
 const {quotes,...details}=report;await db.prepare('INSERT INTO crawl_runs(id,started_at,finished_at,status,data) VALUES(?,?,?,?,?)').bind(id,report.startedAt,report.finishedAt,report.status,JSON.stringify(details)).run();return id;
}
export async function initialize(db,seed){
 if(!db)throw Error('数据库未连接');const key='seed-'+seed.finishedAt;
 if(await db.prepare('SELECT value FROM settings WHERE key=?').bind(key).first())return;
 await saveQuotes(db,seed.quotes);const seedId='seed-'+seed.finishedAt;
 if(!await db.prepare('SELECT id FROM crawl_runs WHERE id=?').bind(seedId).first())await saveRun(db,seed,seedId);
 await db.prepare('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)').bind(key,'done').run();
}
export async function market(db){
 const qr=await db.prepare('SELECT q.data FROM quotes q JOIN (SELECT id,MAX(day) AS day FROM quotes GROUP BY id) latest ON q.id=latest.id AND q.day=latest.day ORDER BY q.category,q.model').all();
 const runs=await db.prepare('SELECT id,data FROM crawl_runs ORDER BY started_at DESC LIMIT 15').all();
 const schedule=await db.prepare('SELECT value FROM settings WHERE key=?').bind('schedule').first();
 return{quotes:qr.results.map(x=>JSON.parse(x.data)),runs:runs.results.map(x=>({id:x.id,...JSON.parse(x.data)})),schedule:schedule?JSON.parse(schedule.value):null,serverTime:new Date().toISOString()};
}
export async function history(db,id){const rows=await db.prepare('SELECT data FROM quotes WHERE id=? ORDER BY day DESC LIMIT 365').bind(id).all();return rows.results.map(x=>JSON.parse(x.data)).reverse();}
export async function acquireLease(db){const now=Date.now();const r=await db.prepare('INSERT INTO leases(key,until_ms) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET until_ms=excluded.until_ms WHERE leases.until_ms<?').bind('refresh',now+60000,now).run();return r.meta.changes>0;}
