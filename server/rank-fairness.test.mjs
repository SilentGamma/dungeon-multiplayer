import {Session} from './session.mjs';
import assert from 'node:assert/strict';import {rankFor,aRankTarget,paceBudgetFactor,createRunLedger,A_RANK_SECONDS,SOLO_S_SECONDS} from './scoring.mjs';
for(let n=1;n<=8;n++){
 const target=aRankTarget(n);for(const [relative,expected] of [[.99,'A'],[1,'A'],[1.01,'B']])assert.equal(rankFor({finished:true,deaths:1,seconds:target*relative,partySize:n}),expected,`${n} players: same relative pace gets same grade`);
 assert.equal(rankFor({finished:true,deaths:0,seconds:100000,partySize:n}),n===1?'B':'S');assert.equal(rankFor({finished:false,deaths:0,seconds:1,partySize:n}),'F');
 const players=Array.from({length:n},(_,i)=>({id:String(i),name:'P'+i,hp:10})),run={round:1,teamSize:n,players,enemies:[]},ledger=createRunLedger(players,0);ledger.collect(run,[],target*1000);const result=ledger.finish(run,true,target*1000);assert(Math.abs(result.equivalentSeconds-A_RANK_SECONDS)<1e-6);assert(Math.abs(result.aTargetSeconds-target)<1e-6);assert.equal(result.seconds,target);
}
assert(aRankTarget(8)<aRankTarget(1),'large party does not get solo combat budget');assert.equal(paceBudgetFactor(1),1);
const players=[{id:'a',name:'A',hp:10},{id:'b',name:'B',hp:10}],run={round:1,teamSize:2,players,enemies:[]},ledger=createRunLedger(players,0);ledger.collect(run,[],100000);players[1].hp=0;ledger.collect(run,[],200000);players[1].deceased=true;ledger.collect(run,[],200000);ledger.collect(run,[],300000);const result=ledger.finish(run,true,300000);assert(Math.abs(result.equivalentSeconds-(200/paceBudgetFactor(2,2)+100/paceBudgetFactor(1,2)))<1e-6,'party changes only affect future time, downing does not relax pace');assert.equal(result.players[1].rank,'F');assert.equal(result.seconds,300);
console.log('PASS: equal relative pace across 1–8 players, stable S/F, actual play time, downed players and prospective departure adjustment');

for(const [seconds,rank] of [[599,'S'],[600,'S'],[600.001,'A'],[720,'A'],[720.001,'B']])assert.equal(rankFor({finished:true,deaths:0,seconds,soloRun:true}),rank);
const coOp=createRunLedger([{id:'a',name:'A'},{id:'b',name:'B'}],0),lateSolo={teamSize:2,round:6,players:[{id:'a',hp:10},{id:'b',hp:0,deceased:true}],enemies:[]};const ended=coOp.finish(lateSolo,true,900000);assert.equal(ended.soloRun,false);assert.equal(ended.players[0].rank,'S','disconnects do not turn a co-op run into a solo challenge');
const single=createRunLedger([{id:'s',name:'S'}],0),singleRun={teamSize:1,players:[{id:'s',hp:10}],enemies:[]};assert.equal(single.finish(singleRun,true,601000).players[0].rank,'A');assert.equal(single.finish(singleRun,true,599000).sTargetSeconds,SOLO_S_SECONDS);

for(const [seconds,rank,unlocked] of [[599,'S',true],[601,'A',false],[721,'B',false]]){let clock=0;const session=new Session({code:'solo',clock:()=>clock});session.join({id:'s',name:'Solo'});session.ready('s',true);session.start('s');session.run.round=6;session.run.players[0].arrived=true;clock=seconds*1000;session.tick(.02);assert.equal(session.results.players[0].rank,rank);assert.equal(session.goldAwards.get('s').has(session.players[0].color),unlocked,'GOLD requires a qualifying solo S finish');}
