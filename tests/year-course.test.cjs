const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map(),els=new Map();const el=()=>({innerHTML:'',hidden:false,textContent:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){},showModal(){},close(){}});
const sandbox={console,Date,setTimeout(){},clearTimeout(){},setInterval(){},window:{scrollTo(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},document:{getElementById:k=>{if(!els.has(k))els.set(k,el());return els.get(k)},querySelectorAll:()=>[],addEventListener(){}}};vm.createContext(sandbox);
for(const f of ['content.js','course.js','app.js'])vm.runInContext(fs.readFileSync(f,'utf8'),sandbox,{filename:f});const run=s=>vm.runInContext(s,sandbox);
assert.equal(run('includedTopics().length'),58);assert.equal(run('stageTotal()'),174);
assert.equal(run('SUBJECTS.map(s=>s.id).join(",")'),'math,russian,reading,world,english');
assert.equal(run('SUBJECTS.every(s=>s.topics.every(t=>t.chapter>=1&&t.chapter<=4&&t.practice.task&&t.practice.criteria.length===2&&new Set(t.stages.flatMap(l=>l.questions.map(q=>q.q))).size===9))'),true);
assert.equal(run('unlockedChapter()'),1);assert.equal(run('topicUnlocked("math/numbers")'),true);assert.equal(run('topicUnlocked("math/comparison")'),true);assert.equal(run('topicUnlocked("math/multiply")'),true);
assert.equal(run('confirmPractice("math/numbers",[true,true])'),false,'Practice cannot be confirmed before learning');
run('start("math/multiply")');assert.equal(run('run.key'),'math/multiply','Every topic starts immediately');
run('state.freeStudy=true;start("math/multiply")');assert.equal(run('run.key'),'math/multiply');assert.equal(run('xp()'),0,'Opening topics does not grant points');run('run=null;state.freeStudy=false');
for(let chapter=1;chapter<=4;chapter++){
 const keys=run(`chapterTopics(${chapter}).map(x=>x.key)`);
 for(const key of keys){
  assert.equal(run(`topicUnlocked(${JSON.stringify(key)})`),true);
  for(let level=1;level<=3;level++){
   run(`start(${JSON.stringify(key)},${level})`);assert.equal(run('run.level'),level);run('run.first=3;run.hints=0;finish()');
  }
  assert.equal(run(`confirmPractice(${JSON.stringify(key)},[true,false])`),false);
  assert.equal(run(`confirmPractice(${JSON.stringify(key)},[true,true])`),true);
 }
 assert.equal(run(`chapterDone(${chapter})`),true);
 assert.equal(run('unlockedChapter()'),Math.min(chapter+1,4));
}
assert.equal(run('includedStageCount()'),174);assert.ok(run('year()').includes('МАРШРУТ ПРОЙДЕН'));assert.equal(run('xp()'),4640);
const data=JSON.parse(storage.get('academy-tutor-v1'));run('state=fresh()');run(`mergeProgress(${JSON.stringify(data)})`);assert.equal(run('unlockedChapter()'),4);assert.ok(run('year()').includes('МАРШРУТ ПРОЙДЕН'));
const before=run('JSON.stringify(state)');const bad={...data,practicals:{'math/numbers':{done:true,date:'bad'}}};assert.throws(()=>run(`mergeProgress(${JSON.stringify(bad)})`));assert.equal(run('JSON.stringify(state)'),before);
run('state.includeEnglish=false');assert.equal(run('includedTopics().length'),51);assert.equal(run('stageTotal()'),153);assert.equal(run('xp()'),4640,'Hidden subject rewards stay earned');
run('state=fresh();state.completed["math/multiply"]=true');assert.equal(run('topicUnlocked("math/multiply")'),true,'Existing unlocked topic survives new route');assert.equal(run('availableStage("math/multiply")'),2);
assert.ok(fs.readFileSync('sw.js','utf8').includes("'./course.js'"));assert.ok(fs.readFileSync('Репетитор.html','utf8').includes('const CHAPTERS='));
console.log('OK: annual sequence through all 4 chapters, 58 topics, 174 stages, adult rubric gating, exclusions, persistence/import and final completion.');
