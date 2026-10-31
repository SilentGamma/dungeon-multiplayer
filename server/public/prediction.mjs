import {advanceActionShield} from './action.mjs';
import {keyPending} from './keys.mjs';
import {movePlayer} from './movement.mjs';
import {roleFor,WIDTH,movementSpeed,advanceAim} from './roles.mjs';
import {AIM_SPEED} from './dungeon.mjs';
import {SIZE,PLAYER_RADIUS} from './world.mjs';
import {wallBlocksLine,resolveWalls} from './obstacles.mjs';
const locked=(run,p)=>!p||p.hp<=0||p.arrived||p.deceased||p.throwing||p.grabbedBy||run.time<(p.stunUntil||0)||p.wrestlerState==='orbit';
const room=p=>Math.floor(p.y)*SIZE+Math.floor(p.x);
export function createPrediction(id){
 let run=null,received=0,round=null,pending=[],oneWay=.1,offset={x:0,y:0,time:0};
 function raw(now){if(!run)return null;const auth=run.players.find(p=>p.id===id);if(!auth)return null;const p={...auth};if(locked(run,p))return p;
  const elapsed=Math.min(.5,oneWay+Math.max(0,now-received)/1000),end=run.time+elapsed,sim={...run,lockedRooms:run.lockedRooms?.slice(),time:run.time};
  function stepTo(time){while(sim.time<time-1e-9){const dt=Math.min(1/60,time-sim.time);sim.time+=dt;advanceActionShield(sim,p);
   if(locked(sim,p)||p.reviving||p.predictedGoal)continue;
   if(p.wrestlerState==='guard'&&p.wrestlerReleased){p.wrestlerState=null;p.holding=false;p.usingAttack=false;p.shielding=false;continue}
   if(p.wrestlerState==='lunging'&&sim.time>=(p.wrestlerUntil||0)){p.wrestlerState=p.wrestlerReleased?null:'guard';p.holding=!p.wrestlerReleased;p.usingAttack=!p.wrestlerReleased;if(p.wrestlerReleased)p.shielding=false;p.vx=0;p.vy=0;continue}
   if(p.holding&&p.wrestlerState!=='lunging'){if(!p.usingAttack||p.color==='blue'){advanceAim(sim,p,dt,AIM_SPEED);if(p.usingAttack)p.attackAngle=p.angle}continue}
   movePlayer(sim,p,dt,{onEnter:(_,to)=>{if(((sim.enemyRooms?.[to]&&!sim.spawnedEnemyRooms?.[to])||keyPending(sim,to))&&sim.lockedRooms)sim.lockedRooms[to]=true},onSubstep:()=>{if(sim.kind!=='boss'&&Math.hypot(p.x-(sim.goal%SIZE+.5),p.y-(Math.floor(sim.goal/SIZE)+.5))<.14){p.predictedGoal=true;p.vx=0;p.vy=0;return true}return false}});
  }}
  function apply(m){if(locked(sim,p))return;if(p.awaitingLaunch&&!(p.vx||p.vy))m={...m,attack:false};
   if(p.reviving){if(m.holding&&!m.attack)p.reviving=null;else return}
   if(p.color==='teal'&&p.wrestlerState){if(!m.holding||!m.attack){p.wrestlerReleased=true;p.shielding=false}return}
   if(p.color==='teal'&&m.holding&&m.attack&&!p.wrestlerState&&!p.usingAttack&&sim.time>=(p.nextAttack||0)){if(!(p.shield>0))return;p.wrestlerReleased=false;p.wrestlerState='lunging';p.wrestlerUntil=sim.time+.32;p.wrestlerAngle=p.angle;p.vx=Math.cos(p.angle);p.vy=Math.sin(p.angle)}
   if(m.holding)p.aimDirection=m.aimDirection===-1?-1:m.aimDirection===1?1:(p.holding?p.aimDirection:1);
   const wasAttack=!!p.usingAttack;if(m.holding&&!p.holding)p.angle=(p.vx||p.vy)?Math.atan2(p.vy,p.vx):(p.angle||0);if(m.holding&&m.attack&&!wasAttack){p.attackAngle=p.angle;p.usingAttack=true;p.actionShielded=false;p.attackStarted=sim.time}
   if(!m.holding&&p.awaitingLaunch&&m.cancel){p.holding=false;p.usingAttack=false;p.shielding=false;p.vx=0;p.vy=0;return}if(!m.holding)p.awaitingLaunch=false;p.holding=m.holding;if(!m.holding||!m.attack)p.shielding=false;else advanceActionShield(sim,p);
   if(!m.holding){if(Number.isFinite(m.angle))p.angle=m.angle;p.usingAttack=false;p.shielding=false;const speed=movementSpeed(p,sim.time);p.vx=Math.cos(p.angle)*speed;p.vy=Math.sin(p.angle)*speed}
   else if(!m.attack)p.usingAttack=false;
  }
  for(const event of pending){if(event.at>end||now-event.created>750)continue;stepTo(Math.max(sim.time,event.at));apply(event.message)}stepTo(end);return p;
 }
 function sample(now){const p=raw(now);if(!p)return null;const decay=Math.exp(-Math.max(0,now-offset.time)/85);const result={...p,x:p.x+offset.x*decay,y:p.y+offset.y*decay};resolveWalls(run,result,p.x,p.y,PLAYER_RADIUS);return result}
 return {
  sample,
  set(next,now){const prior=sample(now),changed=round!==next.round;run=next;received=now;round=next.round;const auth=run.players.find(p=>p.id===id);if(!auth)return;
   if(changed||locked(run,auth))pending=[];else pending=pending.filter(e=>e.message.seq>Math.max(auth.inputSeq||0,auth.lastProcessedInputSeq||0)&&now-e.created<=750);
   offset={x:0,y:0,time:now};const nextP=raw(now);if(!changed&&prior&&nextP&&!locked(run,auth)&&room(prior)===room(nextP)&&Math.hypot(prior.x-nextP.x,prior.y-nextP.y)<.15&&!wallBlocksLine(run,prior,nextP))offset={x:prior.x-nextP.x,y:prior.y-nextP.y,time:now};
  },
  input(message,now){if(!run)return;pending=pending.filter(e=>now-e.created<=750);pending.push({message:{...message},created:now,at:run.time+Math.max(0,now-received)/1000+oneWay});if(pending.length>16)pending.shift();offset={x:0,y:0,time:now}},
  reject(seq){pending=pending.filter(e=>e.message.seq!==seq);offset={x:0,y:0,time:received}},
  latency(ms){if(Number.isFinite(ms))oneWay=Math.max(0,Math.min(.35,ms/2000))},
  reset(){run=null;pending=[];round=null;offset={x:0,y:0,time:0}}
 };
}
