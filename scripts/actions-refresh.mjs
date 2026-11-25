import {appendFile,writeFile,mkdir} from 'node:fs/promises';
import {collect} from '../src/collect.mjs';
import {recordCollection} from './actions-data.mjs';
const report=await collect();
await recordCollection('data',report);
await mkdir('.local',{recursive:true});
await writeFile('.local/actions-result.json',JSON.stringify({status:report.status,count:report.quotes.length},null,2));
if(process.env.GITHUB_OUTPUT)await appendFile(process.env.GITHUB_OUTPUT,`status=${report.status}\ncount=${report.quotes.length}\n`);
const failures=report.sources.filter(s=>s.status!=='success');
console.log(`采集状态: ${report.status}; 新观察: ${report.quotes.length}; 未获价来源: ${failures.length}`);
for(const s of failures)console.log(`${s.name}: ${s.error}`);
if(process.env.GITHUB_STEP_SUMMARY){
 const summary=`## 中国大陆人民币价格采集\n\n- 本次完成：${report.finishedAt}\n- 成功观察：${report.quotes.length} 条\n- 状态：${report.status}\n- 未获价来源：${failures.length} 个；旧价及原日期保留\n\n${failures.map(s=>`- ${s.name}：${s.error}`).join('\n')}\n\n网站中的个人测算输入只保存在访问者浏览器，不会提交到仓库。\n`;
 await appendFile(process.env.GITHUB_STEP_SUMMARY,summary);
}
// The workflow persists this failure report, deploys the last known data, then fails visibly.
if(report.status==='failed')console.log('::warning::全部来源采集失败；已保留旧价格，并记录失败结果。');
