import test from 'node:test';
import assert from 'node:assert/strict';
import '../site/care-search.js';
import {parseCareExperience} from './source.mjs';
const care=globalThis.CareSearch;
test('multiple care requirements use AND by default and support explicit OR',()=>{
 assert.equal(care.matches('協助翻身，照顧臥床長者',['翻身','臥床'],''),true);
 assert.equal(care.matches('只有翻身記載',['翻身','臥床'],''),false);
 assert.equal(care.matches('只有翻身記載',['翻身','臥床'],'','any'),true);
});
test('bedridden synonyms do not infer that all wheelchair users are bedridden',()=>{
 assert.equal(care.matches('照護卧床長者',['臥床'],''),true);
 assert.equal(care.matches('輪椅協助',['臥床'],''),false);
 assert.equal(care.matches('協助祖母從床上轉移到輪椅上',['移位／抱扶'],''),true);
 assert.equal(care.matches('', ['翻身'],''),false);
});
test('free text requires every term and evidence preserves negative statements',()=>{
 assert.equal(care.matches('臥床照護，不會翻身',[],'臥床 翻身'),true);
 assert.equal(care.matches('臥床照護',[],'臥床、翻身'),false);
 assert.match(care.snippets('臥床照護，不會翻身',['翻身'],'')[0],/不會翻身/);
});
test('only care-related sections are indexed; family and religion sections are excluded',()=>{
 const html=`<div class="lists2"><div>其他資訊</div><div>伊斯蘭教</div><div class="lists2"><div>工作經驗</div><div>協助翻身</div><div class="lists2"><div>家庭成員</div><div>家屬資料</div><div class="lists2"><div>備註</div><div>臥床照護</div><style>hidden CSS</style><div>線上履歷由AI協助輸入</div>`;
 const result=parseCareExperience(html);
 assert.match(result,/協助翻身/);assert.match(result,/臥床照護/);
 assert.doesNotMatch(result,/伊斯蘭教|家屬資料|hidden CSS|線上履歷/);
});
