import fs from 'node:fs/promises';
import {getSource,getDetails} from './source.mjs';

await fs.mkdir('.cache',{recursive:true});
await fs.mkdir('site/data',{recursive:true});
const read=async path=>{try{return JSON.parse(await fs.readFile(path,'utf8'))}catch{return null}};
const old=await read('.cache/source.json');
let data;
try{
 data=await getSource();
 if(!data.complete)throw Error(`資料不完整：取得 ${data.rows.length} 筆，來源顯示 ${data.reported} 筆`);
 await fs.writeFile('.cache/source.json',JSON.stringify(data));
}catch(e){
 if(!old?.rows?.length)throw e;
 data={...old,syncError:'來源網站暫時無法更新，正顯示上次成功取得的資料。'};
 console.warn(data.syncError);
}
const previous=await read('.cache/details-v2.json')||{};
const details={},religions={}, queue=[...data.rows];
let failures=0;
async function worker(){
 while(queue.length){
  const row=queue.shift(),id=new URL(row['原始履歷']).searchParams.get('id');
  const saved=previous[id];
  if(saved&&Date.now()-Date.parse(saved.fetchedAt)<24*60*60*1000){details[id]=saved;continue}
  try{const item=await getDetails(id);details[id]={...item,fetchedAt:new Date().toISOString()}}catch{
   failures++;if(saved)details[id]={...saved,stale:true};
  }
 }
}
await Promise.all([worker(),worker()]);
for(const row of data.rows){
 const id=new URL(row['原始履歷']).searchParams.get('id'),item=details[id];
 if(item)religions[id]={religion:item.religion,source:item.source,fetchedAt:item.fetchedAt,stale:!!item.stale};
 row['照護經驗原文']=item?.careText||'';
 row['照護資料更新']=item?.fetchedAt||'';
 row['照護資料狀態']=!item?'尚未取得':item.stale?'沿用上次記載':item.careText?'已取得':'來源未列出';
}
data.detailCount=data.rows.filter(r=>r['照護資料狀態']==='已取得').length;
await fs.writeFile('.cache/details-v2.json',JSON.stringify(details));
await fs.writeFile('site/data/source.json',JSON.stringify(data));
await fs.writeFile('site/data/religions.json',JSON.stringify(religions));
console.log(`Source records: ${data.rows.length}; religion records: ${Object.keys(religions).length}; detail fetch failures: ${failures}`);
