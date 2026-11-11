export const SOURCE='https://www.imaid.com.tw/biox/index.php?fun=resume&sales=adam';
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0*39;|&apos;/g,"'").replace(/&nbsp;/g,' ');
const text=s=>decode(s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
const countries={Indonesia:'印尼',Taiwan:'台灣',Malaysia:'馬來西亞',Singapore:'新加坡','Saudi Arabia':'沙烏地阿拉伯','Hong Kong':'香港'};
export function parseSource(html){
 const chunks=html.split(/<div\s+class\s*=\s*["']lists["'][^>]*>/i).slice(1),rows=[];
 for(const c of chunks){
  const id=c.match(/[?&]id=([a-f0-9]{32})/i)?.[1];
  const code=c.match(/id\s*=\s*["']shownomber\d*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
  if(!id||!code)continue;
  const name=c.match(/class\s*=\s*["']listblock ts["'][^>]*>([\s\S]*?)<br/i)?.[1]||'';
  const age=c.match(/class\s*=\s*["']fyo["'][^>]*>\s*([♀♂])\s*(\d+)/i);
  const marriage=c.match(/class\s*=\s*["']space4["'][^>]*>([\s\S]*?)<\/div>/i)?.[1]||'';
  const hw=c.match(/(\d+)\s*cm\s*\/\s*(\d+)\s*kg/i);
  const flags=[...c.matchAll(/alt\s*=\s*["']([^"']+?\s+\d{4}-\d{4})["']/gi)].map(m=>decode(m[1]));
  const cs=[...new Set(flags.map(f=>f.replace(/\s+\d{4}-\d{4}$/,'')).map(f=>countries[f]||f))];
  const status=text(c.match(/<li>\s*<div>\s*([^<>]*(?:履歷|預訂|面試|已選)[^<>]*)<\/div>/i)?.[1]||'未列出');
  const u=new URL(SOURCE);u.searchParams.set('fun','showresume');u.searchParams.set('id',id);u.searchParams.set('of','resume');
  rows.push({'編號':text(code),'姓名':text(name),'國籍':'印尼','性別':age?.[1]==='♀'?'女':age?.[1]==='♂'?'男':'未列出','年齡':age?Number(age[2]):'','婚姻':text(marriage),'身高(cm)':hw?Number(hw[1]):'','體重(kg)':hw?Number(hw[2]):'','履歷狀態':status,'台灣經驗':cs.includes('台灣')?'有列出':'未列出','工作國家':cs.join('、')||'未列出','工作經歷':flags.join('；')||'未列出','原始履歷':u.href});
 }
 const unique=[...new Map(rows.map(r=>[r['原始履歷'],r])).values()];
 const reported=Number(html.match(/共\s*<span[^>]*>\s*(\d+)\s*<\/span>\s*筆履歷/i)?.[1]||0);
 const pages=Number(html.match(/id\s*=\s*["']tpg["'][^>]*value\s*=\s*["'](\d+)/i)?.[1]||1);
 return {rows:unique,reported,pages};
}
let cached=null;
export function parseReligion(html){
 const section=html.split(/<div\s+class\s*=\s*["']lists2["'][^>]*>/i).find(s=>s.includes('其他資訊'));
 if(!section)return '來源未記載或格式已變更';
 const left=section.split(/<div\s+class\s*=\s*["']listblock tright["']/i)[0];
 const items=[...left.matchAll(/<li>\s*<div>([\s\S]*?)<\/div>\s*<\/li>/gi)].map(m=>text(m[1]));
 return items.length===4&&/cm\s*\/.*kg/.test(items[1])?items[3]||'來源未記載':'來源未記載或格式已變更';
}
export function parseCareExperience(html){
 const sections=html.split(/<div\s+class\s*=\s*["']lists2["'][^>]*>/i).filter(s=>/其他資訊|家庭成員/.test(s)===false&&/工作經驗|備註/.test(s));
 return sections.map(s=>text(s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<!--[^]*?-->/g,''))).join('\n').replace(/線上履歷由AI[\s\S]*$/,'').replace(/\.{4}/g,'').trim();
}
export async function getDetails(id){
 if(!/^[a-f0-9]{32}$/.test(id||''))throw Error('履歷編號無效');
 const u=new URL(SOURCE);u.searchParams.set('fun','showresume');u.searchParams.set('id',id);u.searchParams.set('of','resume');
 const r=await fetch(u,{signal:AbortSignal.timeout(20000),redirect:'error'});if(!r.ok)throw Error('原始履歷暫時無法讀取');
 const html=await r.text();
 return {religion:parseReligion(html),careText:parseCareExperience(html),source:u.href};
}
export async function getSource(){
 if(cached&&Date.now()-cached.at<60000)return cached.data;
 const load=async page=>{const u=new URL(SOURCE);if(page>1)u.searchParams.set('page',page);const r=await fetch(u,{signal:AbortSignal.timeout(20000),redirect:'error'});if(!r.ok)throw Error('來源網站暫時無法讀取');return parseSource(await r.text());};
 const first=await load(1);if(!first.rows.length)throw Error('來源版型改變或暫無資料，請稍後重試');
 let rows=first.rows;
 if(first.reported>rows.length){const parts=await Promise.all(Array.from({length:Math.min(first.pages,20)-1},(_,i)=>load(i+2)));rows=[...new Map([...rows,...parts.flatMap(p=>p.rows)].map(r=>[r['原始履歷'],r])).values()];}
 const data={rows,source:SOURCE,fetchedAt:new Date().toISOString(),reported:first.reported,complete:!first.reported||rows.length===first.reported};cached={at:Date.now(),data};return data;
}
