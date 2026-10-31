import {enemyHealthMultiplier} from '../dist/enemies.mjs';
// Provisional solo-equivalent target; calibrate using completion playtests.
export const A_RANK_SECONDS=12*60;
export const SOLO_S_SECONDS=10*60;
export const TRAVEL_WEIGHT=.6,COMBAT_WEIGHT=.4;
const size=n=>Math.max(1,Math.min(8,Math.floor(Number(n)||1)));
// Traversal remains shared; combat work scales with enemy HP per present player.
export function paceBudgetFactor(partySize,enemyTeamSize=partySize){return TRAVEL_WEIGHT+COMBAT_WEIGHT*enemyHealthMultiplier(size(enemyTeamSize))/size(partySize)}
export function aRankTarget(partySize,enemyTeamSize=partySize){return A_RANK_SECONDS*paceBudgetFactor(partySize,enemyTeamSize)}
export function rankFor({finished,deaths,seconds,partySize=1,enemyTeamSize=partySize,equivalentSeconds,soloRun=partySize===1}){const pace=Number.isFinite(equivalentSeconds)?equivalentSeconds:seconds/paceBudgetFactor(partySize,enemyTeamSize);return !finished?'F':deaths===0&&(!soloRun||seconds<=SOLO_S_SECONDS+1e-6)?'S':pace<=A_RANK_SECONDS+1e-6?'A':'B'}
export function createRunLedger(players,startedAt){
 const soloRun=players.length===1;
 const entries=new Map(players.map(p=>[p.id,{id:p.id,name:p.name,deaths:0,kills:0}])),alive=new Map(players.map(p=>[p.id,true])),kills=new Set();
 let lastAt=startedAt,equivalentSeconds=0;
 function measure(run,now){if(!Number.isFinite(now)||now<=lastAt)return;const partySize=Math.max(1,run.players.filter(p=>!p.deceased).length),enemyTeamSize=run.teamSize||partySize;equivalentSeconds+=(now-lastAt)/1000/paceBudgetFactor(partySize,enemyTeamSize);lastAt=now}
 function collect(run,extra=[],now=lastAt){measure(run,now);for(const p of run.players){const row=entries.get(p.id);if(!row)continue;if(alive.get(p.id)&&p.hp<=0&&!p.deceased)row.deaths++;alive.set(p.id,p.hp>0)}for(const e of [...extra,...run.enemies])if(e.hp<=0){const key=run.round+':'+e.id;if(kills.has(key))continue;kills.add(key);const row=entries.get(e.lastHitBy);if(row)row.kills++}}
 return {collect,finish(run,won,now){collect(run,[],now);const seconds=Math.max(0,(now-startedAt)/1000),finishers=new Set(won?run.players.filter(p=>p.hp>0&&!p.deceased).map(p=>p.id):[]);return {won,seconds,equivalentSeconds,soloRun,sTargetSeconds:soloRun?SOLO_S_SECONDS:null,aTargetSeconds:equivalentSeconds>0?A_RANK_SECONDS*seconds/equivalentSeconds:aRankTarget(players.length),players:[...entries.values()].map(p=>{const finished=finishers.has(p.id);return {...p,finished,rank:rankFor({finished,deaths:p.deaths,seconds,equivalentSeconds,soloRun})}})}}};
}
