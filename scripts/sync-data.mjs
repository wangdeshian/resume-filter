import fs from 'node:fs/promises';
import {getSource,getReligion} from './source.mjs';

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
const previous=await read('.cache/religions.json')||{};
const religions={}, queue=[...data.rows];
let failures=0;
async function worker(){
 while(queue.length){
  const row=queue.shift(),id=new URL(row['原始履歷']).searchParams.get('id');
  const saved=previous[id];
  if(saved&&Date.now()-Date.parse(saved.fetchedAt)<24*60*60*1000){religions[id]=saved;continue}
  try{const item=await getReligion(id);religions[id]={...item,fetchedAt:new Date().toISOString()}}catch{
   failures++;if(saved)religions[id]={...saved,stale:true};
  }
 }
}
await Promise.all([worker(),worker()]);
await fs.writeFile('.cache/religions.json',JSON.stringify(religions));
await fs.writeFile('site/data/source.json',JSON.stringify(data));
await fs.writeFile('site/data/religions.json',JSON.stringify(religions));
console.log(`Source records: ${data.rows.length}; religion records: ${Object.keys(religions).length}; detail fetch failures: ${failures}`);
