'use strict';
globalThis.CareSearch={
 presets:{'翻身':['翻身'],'臥床':['臥床','卧床','躺床'],'移位／抱扶':['移位','轉移到輪椅','轉移至輪椅','抱扶','抱起','抱上','抱下','抱輪椅'],'鼻胃管':['鼻胃管','鼻飼'],'管灌／灌食':['灌食','管灌','餵食管'],'抽痰':['抽痰','吸痰'],'拍背':['拍背','叩背','拍痰'],'沐浴／擦澡':['洗澡','沐浴','擦澡','洗身體'],'尿布／如廁':['尿布','如廁','上廁所'],'輪椅協助':['輪椅'],'復健陪同':['復健'],'失智照護':['失智','阿茲海默'],'中風照護':['中風']},
 tokens(query){return query.toLowerCase().split(/[\s,，、]+/).filter(Boolean)},
 matches(text,selected,query,mode='all'){
  const value=String(text||'').toLowerCase();
  const checks=selected.map(label=>(this.presets[label]||[label]).some(term=>value.includes(term.toLowerCase())));
  return (!checks.length||(mode==='any'?checks.some(Boolean):checks.every(Boolean)))&&this.tokens(query).every(term=>value.includes(term));
 },
 snippets(text,selected,query){
  const raw=String(text||''),lower=raw.toLowerCase(),terms=[...selected.flatMap(label=>this.presets[label]||[label]),...this.tokens(query)];
  const results=[];
  for(const term of terms){let pos=lower.indexOf(term.toLowerCase());if(pos<0)continue;const a=Math.max(0,pos-24),b=Math.min(raw.length,pos+term.length+50);const snippet=(a?'…':'')+raw.slice(a,b)+(b<raw.length?'…':'');if(!results.includes(snippet))results.push(snippet)}
  return results.slice(0,6);
 }
};
