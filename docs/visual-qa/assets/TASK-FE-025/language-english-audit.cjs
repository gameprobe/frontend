const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const result=JSON.parse(fs.readFileSync(path.join(__dirname,'language-after-results.json'),'utf8'));
const checks=Object.entries(result.states).filter(([name])=>name.endsWith('-en')).map(([name,state])=>({state:name,untranslatedKorean:state.contentText.split('\n').filter(line=>/[가-힣]/.test(line))}));
assert.equal(checks.length,12);
fs.writeFileSync(path.join(__dirname,'language-english-audit.json'),JSON.stringify(checks,null,2));
assert.deepEqual(checks.filter(check=>check.untranslatedKorean.length),[]);
console.log('PASS: 12 English main-content snapshots contain no Korean text after excluding the language switch button');
