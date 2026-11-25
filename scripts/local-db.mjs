import {DatabaseSync} from 'node:sqlite';import {mkdirSync,readFileSync} from 'node:fs';
export function localDB(file='.local/market.sqlite'){
 mkdirSync('.local',{recursive:true});const sql=new DatabaseSync(file);sql.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS local_migrations(name TEXT PRIMARY KEY)');
 if(!sql.prepare('SELECT name FROM local_migrations WHERE name=?').get('0000_market')){sql.exec(readFileSync('drizzle/0000_market.sql','utf8'));sql.prepare('INSERT INTO local_migrations VALUES(?)').run('0000_market');}
 const wrap=(query,args=[])=>({bind(...values){return wrap(query,values);},async first(){return sql.prepare(query).get(...args)||null;},async all(){return{results:sql.prepare(query).all(...args)};},async run(){const r=sql.prepare(query).run(...args);return{meta:{changes:Number(r.changes)}};}});
 return{prepare:q=>wrap(q),async batch(statements){sql.exec('BEGIN');try{const r=[];for(const s of statements)r.push(await s.run());sql.exec('COMMIT');return r;}catch(e){sql.exec('ROLLBACK');throw e;}},close:()=>sql.close()};
}
