const {readFileSync}=require('node:fs');
const vm=require('node:vm'),assert=require('node:assert/strict');
const storage=new Map(),elements=new Map();
function element(){return {innerHTML:'',textContent:'',hidden:false,className:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){},close(){},showModal(){}};}
const sandbox={console,Date,setTimeout(){},clearTimeout(){},setInterval(){},window:{scrollTo(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},querySelectorAll(){return[]},querySelector(){return element()},addEventListener(){}}};
vm.createContext(sandbox);
for(const file of ['content.js','course.js','app.js'])vm.runInContext(readFileSync(file,'utf8'),sandbox,{filename:file});
const run=s=>vm.runInContext(s,sandbox);
run('state.freeStudy=true');
const key='math/numbers';
// Exercise answer scoring through the real answer handler and the three questions.
function complete(key,level,{wrong=[],hints=[]}={}){
 run(`start(${JSON.stringify(key)},${level})`);
 assert.equal(run('run.level'),level);
 for(let i=0;i<3;i++){
  run(`run.index=${i};run.answered=false;run.wrong=false;run.hintUsed=false;missionRender()`);
  if(hints.includes(i))run('run.hints++;run.hintUsed=true');
  if(wrong.includes(i))run('answer((run.t.questions[run.index].answer+1)%3,{classList:{add(){}},disabled:false})');
  run('answer(run.t.questions[run.index].answer,{classList:{add(){}},disabled:false})');
 }
 run('finish()');
}
assert.equal(run('SUBJECTS.flatMap(s=>s.topics.flatMap(t=>t.stages.flatMap(l=>l.questions))).length'),522);
assert.equal(run('SUBJECTS.every(s=>s.topics.every(t=>t.stages.length===3&&t.stages.every(l=>l.questions.length===3&&l.questions.every(q=>q.options.length===3&&q.options[q.answer]&&q.hint&&q.explain))))'),true);
run(`start('${key}',3)`);assert.equal(run('run.level'),3,'Every stage can be started immediately');run('run=null');
complete(key,1,{wrong:[0,1]});assert.equal(run('availableStage("math/numbers")'),1);assert.equal(run('xp()'),30);
assert.ok(elements.get('mission-body').innerHTML.includes('Давай закрепим'));
complete(key,1,{hints:[0,1]});assert.equal(run('availableStage("math/numbers")'),1,'Two hints require consolidation even with correct first answers');
complete(key,1);assert.equal(run('availableStage("math/numbers")'),2);assert.equal(run('xp()'),30,'Base reward remains one-time');
complete(key,2,{wrong:[0]});assert.equal(run('availableStage("math/numbers")'),3);assert.equal(run('xp()'),50);
complete(key,2);assert.equal(run('xp()'),50,'Repeating mastered stage does not farm XP');
complete(key,3,{wrong:[0,1]});assert.equal(run('progressOf("math/numbers").length'),2);assert.equal(run('xp()'),50);
complete(key,3);assert.equal(run('progressOf("math/numbers").length'),3);assert.equal(run('xp()'),80);
assert.equal(run('missionCount()'),1,'Higher stages do not masquerade as new topics to unlock heroes');
complete(key,3);assert.equal(run('xp()'),80);
const exported=JSON.parse(storage.get('academy-tutor-v1'));
run('state=fresh();state.freeStudy=true');run(`mergeProgress(${JSON.stringify(exported)})`);assert.equal(run('xp()'),80);assert.equal(run('progressOf("math/numbers").length'),3);
const before=run('JSON.stringify(state)');run(`mergeProgress(${JSON.stringify(exported)})`);assert.equal(run('JSON.stringify(state)'),before,'Import is idempotent including stage history');
const bad={...exported,progression:{[key]:[1,4]}};assert.throws(()=>run(`mergeProgress(${JSON.stringify(bad)})`));assert.equal(run('JSON.stringify(state)'),before);
// Legacy users retain old rewards and immediately get genuinely new questions.
run('state=fresh();state.freeStudy=true;state.completed["math/numbers"]=true');assert.equal(run('xp()'),30);run(`start('${key}')`);assert.equal(run('run.level'),2);assert.equal(run('run.t.questions[0].q'),'Какое число состоит из 6 десятков и 3 единиц?');
run('state=fresh()');
complete('world/space',3);
assert.equal(run('JSON.stringify(progressOf("world/space"))'),'[3]','Out-of-order mastery does not fabricate easier stages');
assert.equal(run('xp()'),60,'First topic reward and mastered advanced stage match displayed reward');
assert.ok(elements.get('mission-body').innerHTML.includes('60 энергии'));
assert.ok(!elements.get('mission-body').innerHTML.includes('Все три ступени этой темы освоены!'));
const advanced=JSON.parse(storage.get('academy-tutor-v1'));
run('state=fresh()');run(`mergeProgress(${JSON.stringify(advanced)})`);
assert.equal(run('JSON.stringify(progressOf("world/space"))'),'[3]');
complete('world/space',1);assert.equal(run('xp()'),60);
complete('world/space',2);assert.equal(run('xp()'),80);
run('state=fresh();state.freeStudy=true');
const allKeys=run('SUBJECTS.flatMap(s=>s.topics.map(t=>`${s.id}/${t.id}`))');
for(const k of allKeys)for(let l=1;l<=3;l++)complete(k,l);
assert.equal(run('stageCount()'),174);assert.equal(run('xp()'),4640);assert.equal(run('unlockedHeroes().length'),6);assert.ok(allKeys.includes(run('recommendMission()')));
// Rotated answers preserve the meaning and the correct option at every stage.
for(const k of allKeys)for(let l=1;l<=3;l++){
 run(`start(${JSON.stringify(k)},${l})`);
 assert.equal(run('run.t.questions.every(q=>{const original=run.s.topics.find(t=>t.id===run.t.id).stages[run.level-1].questions.find(x=>x.q===q.q);return q.options[q.answer]===original.options[original.answer]})'),true);
}
console.log('OK: 522 questions, progressive unlock, answer/hint-based consolidation, legacy migration, unique XP, import and every stage/answer.');
