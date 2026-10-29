import {doorKey,entrances,passable} from './doors.mjs';
export {doorKey,entrances,passable} from './doors.mjs';
import {movePlayer} from './movement.mjs';
import {generateObstacles,resolveWalls} from './obstacles.mjs';
import {SIZE,PLAYER_RADIUS,SPEED_MULTIPLIER} from './world.mjs';
export {SIZE} from './world.mjs';
import {grapple,beginGrapple,startWrestler,updateWrestler,updateGrapples,updateThrows} from './throw.mjs';
import {roleFor,WIDTH,advanceAim} from './roles.mjs';
import {prepareRevives,advanceRevives} from './revive.mjs';
import {refreshEnemyActivity,enterRoom,updateRoomLocks,removeDefeatedEnemies,attack,stepCombat,stepHazards,PLAYER_HP} from './combat.mjs';
export const ROOM_SIZE=2,SPEED=.72/ROOM_SIZE*SPEED_MULTIPLIER,RADIUS=PLAYER_RADIUS,AIM_SPEED=3.6*SPEED_MULTIPLIER;
export function neighbors(i){const x=i%SIZE,y=Math.floor(i/SIZE);return [y>0?i-SIZE:-1,x<SIZE-1?i+1:-1,y<SIZE-1?i+SIZE:-1,x>0?i-1:-1].filter(n=>n>=0)}
export function distances(edges,starts){const d=Array(edges.length).fill(Infinity),q=[...starts];for(const n of q)d[n]=0;for(let k=0;k<q.length;k++)for(const n of edges[q[k]])if(d[n]===Infinity){d[n]=d[q[k]]+1;q.push(n)}return d}
export const MIN_PATH_ROOMS=Object.freeze([5,6,6,7,8]);
export function generateDungeon(random=Math.random,round=1){
 const minimum=MIN_PATH_ROOMS[Math.max(0,Math.min(4,Math.floor(round)-1))]||5;
 for(let attempt=0;attempt<2000;attempt++){
  const startRoom=(SIZE-1)*SIZE+2*Math.floor(random()*Math.ceil(SIZE/2));
  const path=[startRoom],used=new Set(path),length=minimum+Math.floor(random()*3);
  for(let i=1;i<length;i++){
   const options=neighbors(path.at(-1)).filter(n=>!used.has(n));if(!options.length)break;
   const next=options[Math.floor(random()*options.length)];path.push(next);used.add(next);
  }
  if(path.length<minimum||Math.floor(path.at(-1)/SIZE)>=SIZE-1)continue;
  const edges=Array.from({length:SIZE*SIZE},()=>[]);
  const connect=(a,b)=>{edges[a].push(b);edges[b].push(a)};
  for(let i=1;i<path.length;i++)connect(path[i-1],path[i]);
  const branchParents=path.slice(0,-1).sort(()=>random()-.5);let branches=0;
  for(const parent of branchParents){
   const options=neighbors(parent).filter(n=>!used.has(n));if(!options.length)continue;
   const n=options[Math.floor(random()*options.length)];used.add(n);connect(parent,n);branches++;
   if(branches>=3+Math.floor(random()*3))break;
  }
  if(branches<3)continue;
  const doors={};for(const room of used)for(const n of edges[room])if(n>room){const doorRoll=random(),kind=doorRoll<.55?0:doorRoll<.93?1:2;doors[doorKey(room,n)]=kind===0?[]:kind===1?[[.12,.34],[.66,.88]]:[[.06,.24],[.41,.59],[.76,.94]];if(kind===0){const start=.16+random()*.4;doors[doorKey(room,n)]=[[start,start+.28]]}}
  const goal=path.at(-1),mapOptions=[...used].filter(i=>i!==goal&&i!==startRoom),mapRoom=mapOptions[Math.floor(random()*mapOptions.length)];
  // Along each branch, leave one or two safe rooms between encounters.
  const enemyRooms=Array(SIZE*SIZE).fill(false),queue=[[startRoom,-1,0,2+Math.floor(random()*2)]];
  while(queue.length){const [room,parent,distance,nextEncounter]=queue.shift();let d=distance,limit=nextEncounter;if(room!==startRoom&&room!==goal&&d>=limit){enemyRooms[room]=true;d=0;limit=2+Math.floor(random()*2)}for(const n of edges[room])if(n!==parent)queue.push([n,room,d+1,limit]);}
  // The last approach is always an encounter; keep its immediate neighbors safe.
  const finalEncounter=path.at(-2);for(const n of edges[finalEncounter])enemyRooms[n]=false;enemyRooms[finalEncounter]=true;
  const obstacles=generateObstacles(edges,enemyRooms,startRoom,goal,random);
  return {edges,doors,startRoom,goal,mapRoom,enemyRooms,obstacles,mapCollected:false,minPathTiles:path.length};
 }
 throw Error('Could not generate a valid dungeon. Try again.');
}
export function routeToGoal(run,start){const previous=Array(run.edges.length).fill(-1),q=[start];previous[start]=start;for(let k=0;k<q.length;k++){const i=q[k];if(i===run.goal)break;for(const n of run.edges[i])if(previous[n]===-1){previous[n]=i;q.push(n)}}if(previous[run.goal]===-1)return [];const path=[run.goal];while(path[0]!==start)path.unshift(previous[path[0]]);return path}
export function navigationTarget(run,p){if(!run.mapCollected||p.hp<=0||p.arrived)return null;const start=Math.floor(p.y)*SIZE+Math.floor(p.x),path=routeToGoal(run,start);if(!path.length)return null;if(path.length===1)return {x:run.goal%SIZE+.5,y:Math.floor(run.goal/SIZE)+.5,nextRoom:run.goal};const next=path[1],horizontal=Math.abs(next-start)===1;const options=entrances(run,start,next).map(([lo,hi])=>{const t=(lo+hi)/2;return {x:horizontal?(next>start?start%SIZE+1:start%SIZE):start%SIZE+t,y:horizontal?Math.floor(start/SIZE)+t:(next>start?Math.floor(start/SIZE)+1:Math.floor(start/SIZE)),nextRoom:next}});return options.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null}
export function collectMap(run,p){if(!run.mapCollected&&Math.hypot(p.x-(run.mapRoom%SIZE+.5),p.y-(Math.floor(run.mapRoom/SIZE)+.5))<.11){run.mapCollected=true;run.mapFoundBy=p.name;return true}return false}
export function createRun(players,random=Math.random,round=1){const dungeon=generateDungeon(random,round);const startRoom=dungeon.startRoom;const run={...dungeon,startRoom,round,teamSize:players.filter(p=>!p.deceased).length,tick:0,time:0,failed:false,players:players.map((p,i)=>{const angle=-Math.PI*(.2+random()*.6);return {...p,x:startRoom%SIZE+.5+(players.length>1?Math.cos(i*2*Math.PI/players.length)*.085:0),y:Math.floor(startRoom/SIZE)+.5+(players.length>1?Math.sin(i*2*Math.PI/players.length)*.085:0),vx:Math.cos(angle)*roleFor(p.color).speed*WIDTH,vy:Math.sin(angle)*roleFor(p.color).speed*WIDTH,angle,holding:false,shielding:false,hp:roleFor(p.color).hp,maxHp:roleFor(p.color).hp,shield:roleFor(p.color).shield,maxShield:roleFor(p.color).shield,invulnerableUntil:.8,arrived:false,inputSeq:0}})};run.enemies=[];run.spawnedEnemyRooms=Array(SIZE*SIZE).fill(false);run.lockedRooms=Array(SIZE*SIZE).fill(false);refreshEnemyActivity(run,random);return run}
export function applyInput(run,id,m){
 const p=run.players.find(p=>p.id===id);if(!p||p.hp<=0||p.arrived||p.throwing||p.grabbedBy||run.time<(p.stunUntil||0)||run.failed||!Number.isSafeInteger(m.seq)||m.seq<=p.inputSeq||typeof m.holding!=='boolean')return false;
 if(m.holding&&m.attack===true&&!p.usingAttack&&!p.wrestlerState&&run.time<(p.nextAttack||0))return false;p.inputSeq=m.seq;if(p.reviving){if(m.holding&&m.attack!==true){p.reviveAvoidTarget=p.reviving;p.reviving=null;p.shielding=false}else{p.holding=false;p.shielding=false;return true}}
 if(p.color==='teal'){
  if(p.wrestlerState){if(!m.holding||m.attack!==true){p.wrestlerReleased=true;if(m.cancel===true)p.wrestlerCancel=true}return true}
  if(m.holding&&m.attack===true){startWrestler(run,p);return true}
 }
 if(m.holding)p.aimDirection=m.aimDirection===-1?-1:m.aimDirection===1?1:(p.holding?p.aimDirection:1);
 const wasAttacking=!!p.usingAttack;
 if(m.holding&&!p.holding){p.holding=true;p.holdStarted=run.time;p.angle=(p.vx||p.vy)?Math.atan2(p.vy,p.vx):(p.angle||0)}
 if(m.holding&&m.attack===true&&!wasAttacking){p.usingAttack=true;p.attackStarted=run.time;p.attackAngle=(p.vx||p.vy)?Math.atan2(p.vy,p.vx):(p.angle||0);p.angle=p.attackAngle}
 const attackingNow=m.holding&&m.attack===true;
 if(attackingNow){const wasShielding=p.shielding;p.shielding=p.color!=='teal'&&(p.shield||0)>0;if(!wasShielding&&p.shielding)p.shieldRaisedAt=run.time}
 else if(wasAttacking){p.shielding=false;p.angle=p.attackAngle;p.usingAttack=false;if(m.cancel!==true){if(p.color==='teal'&&run.time-(p.attackStarted??run.time)>=.4)grapple(run,p);else attack(run,p)}}
 if(!m.holding&&p.holding){if(!wasAttacking&&Number.isFinite(m.angle))p.angle=m.angle%(Math.PI*2);p.holding=false;p.shielding=false;p.usingAttack=false;p.vx=Math.cos(p.angle)*roleFor(p.color).speed*WIDTH;p.vy=Math.sin(p.angle)*roleFor(p.color).speed*WIDTH}
 return true;
}
export function step(run,dt,random=Math.random){run.time=(run.time||0)+dt;updateRoomLocks(run);refreshEnemyActivity(run,random);updateThrows(run,dt);updateGrapples(run);prepareRevives(run);for(const p of run.players){const shieldX=p.x,shieldY=p.y;if(p.arrived||p.hp<=0||p.reviving||p.throwing||p.grabbedBy){p.shieldTick=0;continue}if(run.time<(p.stunUntil||0)){p.holding=false;p.shielding=false;p.usingAttack=false;p.wrestlerState=null;p.shieldTick=0;continue}if(p.color==='teal'&&p.wrestlerState)updateWrestler(run,p);collectMap(run,p);if(p.holding&&p.wrestlerState!=='lunging'){p.shieldTick=0;if(!p.usingAttack||p.color==='blue'){advanceAim(run,p,dt,AIM_SPEED);if(p.usingAttack)p.attackAngle=p.angle;}continue}movePlayer(run,p,dt,{onEnter:(from,to)=>enterRoom(run,from,to,random),onLunge:()=>updateWrestler(run,p),onSubstep:()=>{collectMap(run,p);const gx=run.goal%SIZE+.5,gy=Math.floor(run.goal/SIZE)+.5;if(Math.hypot(p.x-gx,p.y-gy)<.14){p.arrived=true;p.holding=false;p.shielding=false;p.poison=null;p.stunUntil=0;p.x=gx+(run.players.indexOf(p)%3-1)*.045;p.y=gy+(Math.floor(run.players.indexOf(p)/3)-1)*.045;return true}return false;}});regenerateShield(run,p,dt,Math.hypot(p.x-shieldX,p.y-shieldY)>1e-8);}stepHazards(run,random);stepCombat(run,dt,random);removeDefeatedEnemies(run);updateRoomLocks(run);advanceRevives(run,dt);run.failed=run.players.length>0&&run.players.every(p=>p.hp<=0);run.tick++;return !run.failed&&run.players.every(p=>p.hp<=0||p.arrived)}

export function regenerateShield(run,p,dt,moved){if(!moved||p.hp<=0||p.arrived||p.holding||p.shielding||p.reviving||p.throwing||p.grabbedBy||run.time<(p.stunUntil||0)){p.shieldTick=0;return}p.shieldTick=(p.shieldTick||0)+dt;while(p.shieldTick+1e-9>=1){p.shield=Math.min(p.maxShield,p.shield+1);p.shieldTick=Math.max(0,p.shieldTick-1)}}
