export const REVIVE_SECONDS=8,REVIVE_RADIUS=.055;
const sameRoom=(a,b)=>Math.floor(a.x)===Math.floor(b.x)&&Math.floor(a.y)===Math.floor(b.y);
export function prepareRevives(run){
  const now=run.time||0;
  for(const p of run.players){p.reviving=null;if(p.hp<=0){p.shielding=false;p.holding=false;p.arrived=false;p.reviverId=null;p.reviverIds=[]}}
  for(const p of run.players){
    if(p.hp<=0||p.arrived||now<(p.stunUntil||0)||now<(p.reviveInterruptedUntil||0))continue;
    const target=run.players.filter(q=>q.id!==p.id&&!q.deceased&&q.hp<=0&&!q.throwing&&!q.grabbedBy&&sameRoom(p,q)&&Math.hypot(p.x-q.x,p.y-q.y)<=REVIVE_RADIUS).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0];
    if(!target)continue;
    p.reviving=target.id;p.shielding=false;p.holding=false;
    target.reviverIds.push(p.id);target.reviverId=target.reviverIds[0];
  }
  for(const p of run.players)if(p.hp<=0&&!p.reviverId)p.reviveProgress=0;
}
export function advanceRevives(run,dt){
  for(const target of run.players){
    if(target.deceased||target.hp>0||!target.reviverId)continue;
    const active=(target.reviverIds||[]).map(id=>run.players.find(p=>p.id===id)).filter(p=>p&&p.hp>0&&p.reviving===target.id&&sameRoom(p,target)&&Math.hypot(p.x-target.x,p.y-target.y)<=REVIVE_RADIUS);
    if(!active.length||target.throwing){target.reviveProgress=0;target.reviverId=null;continue}
    target.reviverId=active[0].id;target.reviveProgress=(target.reviveProgress||0)+dt*(1+.2*(active.length-1));
    if(target.reviveProgress+1e-9>=REVIVE_SECONDS){
      target.hp=Math.ceil((target.maxHp||10)*.3);target.shield=target.maxShield??target.shield;target.reviveProgress=0;target.reviverId=null;target.reviverIds=[];target.holding=false;target.shielding=false;target.arrived=false;target.invulnerableUntil=0;
      for(const p of active){p.reviving=null;p.holding=false;p.shielding=false}
    }
  }
}
