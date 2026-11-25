import{collect}from'../src/collect.mjs';import{saveQuotes,saveRun,market}from'../src/storage.mjs';import{localDB}from'./local-db.mjs';import{mkdirSync,writeFileSync}from'node:fs';
const report=await collect();const db=localDB();await saveQuotes(db,report.quotes);await saveRun(db,report);const latest=await market(db);db.close();
if(process.argv.includes('--seed')&&latest.quotes.length){mkdirSync('data',{recursive:true});writeFileSync('data/initial-market.json',JSON.stringify({...report,quotes:latest.quotes,schedule:latest.schedule},null,2));}
console.log(JSON.stringify({status:report.status,quotes:report.quotes.length,sources:report.sources},null,2));if(!report.quotes.length)process.exitCode=1;
