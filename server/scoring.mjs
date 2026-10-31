// Provisional speed target: tune with completed-run playtest times.
export const A_RANK_SECONDS=12*60;
export function rankFor({finished,deaths,seconds}){return !finished?'F':deaths===0?'S':seconds<=A_RANK_SECONDS?'A':'B'}
export function createRunLedger(players,startedAt){
 const entries=new Map(players.map(p=>[p.id,{id:p.id,name:p.name,deaths:0,kills:0}])),alive=new Map(players.map(p=>[p.id,true])),kills=new Set();
 return {collect(run,extra=[]){for(const p of run.players){const row=entries.get(p.id);if(!row)continue;if(alive.get(p.id)&&p.hp<=0&&!p.deceased)row.deaths++;alive.set(p.id,p.hp>0)}for(const e of [...extra,...run.enemies])if(e.hp<=0){const key=run.round+':'+e.id;if(kills.has(key))continue;kills.add(key);const row=entries.get(e.lastHitBy);if(row)row.kills++}},finish(run,won,now){const seconds=Math.max(0,(now-startedAt)/1000),finishers=new Set(won?run.players.filter(p=>p.hp>0&&!p.deceased).map(p=>p.id):[]);return {won,seconds,players:[...entries.values()].map(p=>{const finished=finishers.has(p.id);return {...p,finished,rank:rankFor({finished,deaths:p.deaths,seconds})}})}}};
}
