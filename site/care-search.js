'use strict';
globalThis.CareSearch={
 presets:{
  '幫傭／家務':['幫傭','家務','家事','打掃','清掃','清潔房間','清潔臥室','清潔家','洗衣','洗衫','燙衫','熨衣','housework','housekeeping','domestic helper','pekerjaan rumah','membersihkan rumah'],
  '照顧小孩':['保母','保姆','育兒','babysitting','childcare','child care','menjaga anak','mengasuh anak','merawat anak'],
  '嬰幼兒照顧':['育嬰','照顧嬰幼兒','menjaga bayi','merawat bayi','mengasuh bayi'],
  '煮飯備餐':['煮飯','做飯','煮菜','備餐','烹飪','烹調','燒飯','cooking','memasak'],
  '翻身':['翻身'],'臥床':['臥床','卧床','躺床'],'移位／抱扶':['移位','轉移到輪椅','轉移至輪椅','抱扶','抱起','抱上','抱下','抱輪椅'],'鼻胃管':['鼻胃管','鼻飼'],'管灌／灌食':['灌食','管灌','餵食管'],'抽痰':['抽痰','吸痰'],'拍背':['拍背','叩背','拍痰'],'沐浴／擦澡':['洗澡','沐浴','擦澡','洗身體'],'尿布／如廁':['尿布','如廁','上廁所'],'輪椅協助':['輪椅'],'復健陪同':['復健'],'失智照護':['失智','阿茲海默'],'中風照護':['中風']
 },
 patterns:{
  '照顧小孩':[
   /(?:照顧|照看|照料|陪伴|接送|帶)[^。；;，,\n]{0,24}?(?:小孩|孩子|兒童|孩童|小朋友|男童|女童|嬰兒|幼兒|寶寶)/i,
   /(?:take\s+care\s+of|caring\s+for|looking\s+after)[^.;\n]{0,30}?(?:children|child\b|kids?\b|bab(?:y|ies))/i
  ],
  '嬰幼兒照顧':[
   /(?:照顧|照看|照料|陪伴|帶)[^。；;，,\n]{0,24}?(?:嬰兒|幼兒|嬰幼兒|寶寶)/i,
   /(?:take\s+care\s+of|caring\s+for|looking\s+after)[^.;\n]{0,30}?(?:bab(?:y|ies)|infants?|toddlers?)/i
  ]
 },
 matchedTerms(text,label){
  const raw=String(text||''),lower=raw.toLowerCase();
  return [...(this.presets[label]||[label]).filter(term=>lower.includes(term.toLowerCase())),...(this.patterns[label]||[]).flatMap(pattern=>{const m=raw.match(pattern);return m?[m[0]]:[]})];
 },
 tokens(query){return query.toLowerCase().split(/[\s,，、]+/).filter(Boolean)},
 matches(text,selected,query,mode='all'){
  const value=String(text||'').toLowerCase();
  const checks=selected.map(label=>this.matchedTerms(text,label).length>0);
  return (!checks.length||(mode==='any'?checks.some(Boolean):checks.every(Boolean)))&&this.tokens(query).every(term=>value.includes(term));
 },
 snippets(text,selected,query){
  const raw=String(text||''),lower=raw.toLowerCase(),terms=[...selected.flatMap(label=>this.matchedTerms(raw,label)),...this.tokens(query)];
  const results=[];
  for(const term of terms){let pos=lower.indexOf(term.toLowerCase());if(pos<0)continue;const a=Math.max(0,pos-24),b=Math.min(raw.length,pos+term.length+50);const snippet=(a?'…':'')+raw.slice(a,b)+(b<raw.length?'…':'');if(!results.includes(snippet))results.push(snippet)}
  return results.slice(0,6);
 }
};
