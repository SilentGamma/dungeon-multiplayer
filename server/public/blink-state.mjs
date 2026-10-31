export const ATTACK_BLINK_MS=180;
export function createBlinkState(){
 let previous=new Map(),until=new Map(),round=null;
 return {reset(){previous.clear();until.clear();round=null},set(run,now){
  if(round!==run.round){previous.clear();until.clear();round=run.round}
  const present=new Set();for(const p of run.players){present.add(p.id);const old=previous.get(p.id);
   if(p.color!=='blue'&&old&&((p.attackUntil>run.time&&p.attackUntil>(old.attackUntil||0))||(p.color==='teal'&&p.wrestlerState==='lunging'&&old.wrestlerState!=='lunging')))until.set(p.id,now+ATTACK_BLINK_MS);
   previous.set(p.id,{attackUntil:p.attackUntil,wrestlerState:p.wrestlerState});
  }
  for(const id of previous.keys())if(!present.has(id)){previous.delete(id);until.delete(id)}
 },closed(p,time,now){return p.color!=='blue'&&p.hp>0&&!p.deceased&&(!!(p.shielding&&p.shield>0)||now<(until.get(p.id)||0))}};
}
