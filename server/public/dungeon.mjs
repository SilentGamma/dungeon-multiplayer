import {generateObstacles,resolveWalls} from './obstacles.mjs';
import {SIZE,PLAYER_RADIUS} from './world.mjs';
export {SIZE} from './world.mjs';
import {grapple,beginGrapple,startWrestler,updateWrestler,updateGrapples,updateThrows} from './throw.mjs';
import {roleFor,WIDTH,advanceAim} from './roles.mjs';
import {prepareRevives,advanceRevives} from './revive.mjs';
import {refreshEnemyActivity,enterRoom,updateRoomLocks,removeDefeatedEnemies,attack,stepCombat,stepHazards,PLAYER_HP} from './combat.mjs';
export const ROOM_SIZE=2,SPEED=.72/ROOM_SIZE,RADIUS=PLAYER_RADIUS,AIM_SPEED=3.6;
export function neighbors(i){const x=i%SIZE,y=Math.floor(i/SIZE);return [y>0?i-SIZE:-1,x<SIZE-1?i+1:-1,y<SIZE-1?i+SIZE:-1,x>0?i-1:-1].filter(n=>n>=0)}
export function distances(edges,starts){const d=Array(edges.length).fill(Infinity),q=[...starts];for(const n of q)d[n]=0;for(let k=0;k<q.length;k++)for(const n of edges[q[k]])if(d[n]===Infinity){d[n]=d[q[k]]+1;q.push(n)}return d}
export function generateDungeon(random=Math.random){
 for(let attempt=0;attempt<2000;attempt++){
  const startRoom=(SIZE-1)*SIZE+2*Math.floor(random()*Math.ceil(SIZE/2));
  const path=[startRoom],used=new Set(path),length=9+Math.floor(random()*4);
  for(let i=1;i<length;i++){
   const options=neighbors(path.at(-1)).filter(n=>!used.has(n));if(!options.length)break;
   const next=options[Math.floor(random()*options.length)];path.push(next);used.add(next);
  }
  if(path.length<9||Math.floor(path.at(-1)/SIZE)>=SIZE-1)continue;
  const edges=Array.from({length:SIZE*SIZE},()=>[]);
  const connect=(a,b)=>{edges[a].push(b);edges[b].push(a)};
  for(let i=1;i<path.length;i++)connect(path[i-1],path[i]);
  const branchParents=path.slice(1,-2).sort(()=>random()-.5);let branches=0;
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
  const obstacles=generateObstacles(edges,enemyRooms,startRoom,goal,random);
  return {edges,doors,startRoom,goal,mapRoom,enemyRooms,obstacles,mapCollected:false,minPathTiles:path.length};
 }
 throw Error('Could not generate a valid dungeon. Try again.');
}
export function doorKey(a,b){return `${Math.min(a,b)}:${Math.max(a,b)}`}
export function entrances(run,a,b){return run.edges[a]?.includes(b)?(run.doors?.[doorKey(a,b)]||[[.34,.66]]):[]}
export function passable(run,a,b,position){return !run.lockedRooms?.[a]&&entrances(run,a,b).some(([lo,hi])=>position>lo+RADIUS&&position<hi-RADIUS)}
export function routeToGoal(run,start){const previous=Array(run.edges.length).fill(-1),q=[start];previous[start]=start;for(let k=0;k<q.length;k++){const i=q[k];if(i===run.goal)break;for(const n of run.edges[i])if(previous[n]===-1){previous[n]=i;q.push(n)}}if(previous[run.goal]===-1)return [];const path=[run.goal];while(path[0]!==start)path.unshift(previous[path[0]]);return path}
export function navigationTarget(run,p){if(!run.mapCollected||p.hp<=0||p.arrived)return null;const start=Math.floor(p.y)*SIZE+Math.floor(p.x),path=routeToGoal(run,start);if(!path.length)return null;if(path.length===1)return {x:run.goal%SIZE+.5,y:Math.floor(run.goal/SIZE)+.5,nextRoom:run.goal};const next=path[1],horizontal=Math.abs(next-start)===1;const options=entrances(run,start,next).map(([lo,hi])=>{const t=(lo+hi)/2;return {x:horizontal?(next>start?start%SIZE+1:start%SIZE):start%SIZE+t,y:horizontal?Math.floor(start/SIZE)+t:(next>start?Math.floor(start/SIZE)+1:Math.floor(start/SIZE)),nextRoom:next}});return options.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||null}
export function collectMap(run,p){if(!run.mapCollected&&Math.hypot(p.x-(run.mapRoom%SIZE+.5),p.y-(Math.floor(run.mapRoom/SIZE)+.5))<.11){run.mapCollected=true;run.mapFoundBy=p.name;return true}return false}
export function createRun(players,random=Math.random){const dungeon=generateDungeon(random);const startRoom=dungeon.startRoom;const run={...dungeon,startRoom,tick:0,time:0,failed:false,players:players.map((p,i)=>{const angle=-Math.PI*(.2+random()*.6);return {...p,x:startRoom%SIZE+.5+(players.length>1?Math.cos(i*2*Math.PI/players.length)*.085:0),y:Math.floor(startRoom/SIZE)+.5+(players.length>1?Math.sin(i*2*Math.PI/players.length)*.085:0),vx:Math.cos(angle)*roleFor(p.color).speed*WIDTH,vy:Math.sin(angle)*roleFor(p.color).speed*WIDTH,angle,holding:false,shielding:false,hp:roleFor(p.color).hp,maxHp:roleFor(p.color).hp,shield:roleFor(p.color).shield,maxShield:roleFor(p.color).shield,invulnerableUntil:.8,arrived:false,inputSeq:0}})};run.enemies=[];run.spawnedEnemyRooms=Array(SIZE*SIZE).fill(false);run.lockedRooms=Array(SIZE*SIZE).fill(false);refreshEnemyActivity(run,random);return run}
export function applyInput(run,id,m){
 const p=run.players.find(p=>p.id===id);if(!p||p.hp<=0||p.arrived||p.throwing||run.time<(p.stunUntil||0)||run.failed||!Number.isSafeInteger(m.seq)||m.seq<=p.inputSeq||typeof m.holding!=='boolean')return false;
 p.inputSeq=m.seq;if(p.reviving){if(m.holding&&m.attack!==true){p.reviveAvoidTarget=p.reviving;p.reviving=null;p.shielding=false}else{p.holding=false;p.shielding=false;return true}}
 if(p.color==='teal'){
  if(p.wrestlerState){if(!m.holding||m.attack!==true){p.wrestlerReleased=true;if(m.cancel===true)p.wrestlerCancel=true}return true}
  if(m.holding&&m.attack===true){startWrestler(run,p);return true}
 }
 const wasAttacking=!!p.usingAttack;
 if(m.holding&&!p.holding){p.holding=true;p.holdStarted=run.time;p.angle=Math.atan2(p.vy,p.vx)}
 if(m.holding&&m.attack===true&&!wasAttacking){p.usingAttack=true;p.attackStarted=run.time;p.attackAngle=Math.atan2(p.vy,p.vx);p.angle=p.attackAngle}
 const attackingNow=m.holding&&m.attack===true;
 if(attackingNow){const wasShielding=p.shielding;p.shielding=p.color!=='teal'&&(p.shield||0)>0;if(!wasShielding&&p.shielding)p.shieldRaisedAt=run.time}
 else if(wasAttacking){p.shielding=false;p.angle=p.attackAngle;p.usingAttack=false;if(m.cancel!==true){if(p.color==='teal'&&run.time-(p.attackStarted??run.time)>=.4)grapple(run,p);else attack(run,p)}}
 if(!m.holding&&p.holding){if(!wasAttacking&&Number.isFinite(m.angle))p.angle=m.angle%(Math.PI*2);p.holding=false;p.shielding=false;p.usingAttack=false;p.vx=Math.cos(p.angle)*roleFor(p.color).speed*WIDTH;p.vy=Math.sin(p.angle)*roleFor(p.color).speed*WIDTH}
 return true;
}
function bounce(p,axis,random){let angle=Math.atan2(axis==='y'?-p.vy:p.vy,axis==='x'?-p.vx:p.vx)+(random()-.5)*.5;let vx=Math.cos(angle),vy=Math.sin(angle);if(axis==='x'&&Math.sign(vx)===Math.sign(p.vx))vx=-vx;if(axis==='y'&&Math.sign(vy)===Math.sign(p.vy))vy=-vy;const len=Math.hypot(vx,vy);p.vx=vx/len*roleFor(p.color).speed*WIDTH;p.vy=vy/len*roleFor(p.color).speed*WIDTH;p.angle=Math.atan2(p.vy,p.vx)}
export function step(run,dt,random=Math.random){run.time=(run.time||0)+dt;updateRoomLocks(run);refreshEnemyActivity(run,random);updateThrows(run,dt);updateGrapples(run);prepareRevives(run);for(const p of run.players){if(p.arrived||p.hp<=0||p.reviving||p.throwing||p.grabbedBy)continue;if(run.time<(p.stunUntil||0)){p.holding=false;p.shielding=false;p.usingAttack=false;p.wrestlerState=null;p.shieldTick=0;continue}if(p.color==='teal'&&p.wrestlerState)updateWrestler(run,p);if(!p.holding&&!p.shielding){p.shieldTick=(p.shieldTick||0)+dt;while(p.shieldTick>=1){p.shield=Math.min(p.maxShield,p.shield+1);p.shieldTick-=1}}else p.shieldTick=0;collectMap(run,p);if(p.holding&&p.wrestlerState!=='lunging'){if(!p.usingAttack)advanceAim(run,p,dt,AIM_SPEED);continue}if(run.time<(p.lungeUntil||0)){p.vx=Math.cos(p.lungeAngle);p.vy=Math.sin(p.lungeAngle)}const speed=roleFor(p.color).speed*WIDTH*((p.wrestlerState==='lunging'||run.time<(p.airUntil||0)||run.time<(p.lungeUntil||0))?2:1),magnitude=Math.hypot(p.vx,p.vy)||1;p.vx=p.vx/magnitude*speed;p.vy=p.vy/magnitude*speed;const substeps=Math.max(1,Math.ceil(dt*speed/.01)),h=dt/substeps;for(let s=0;s<substeps;s++){let cx=Math.min(SIZE-1,Math.max(0,Math.floor(p.x))),cy=Math.min(SIZE-1,Math.max(0,Math.floor(p.y))),cell=cy*SIZE+cx;const oldX=p.x,oldY=p.y,nx=p.x+p.vx*h,ny=p.y+p.vy*h,fx=p.x-cx,fy=p.y-cy;const left=cx>0&&passable(run,cell,cell-1,fy),right=cx<SIZE-1&&passable(run,cell,cell+1,fy);let hit=false;if(nx<cx+RADIUS&&!left){p.x=cx+RADIUS;hit=true}else if(nx>cx+1-RADIUS&&!right){p.x=cx+1-RADIUS;hit=true}else p.x=nx;if(hit){if(p.wrestlerState==='lunging')p.wrestlerUntil=run.time;else bounce(p,'x',random);}const afterX=Math.min(SIZE-1,Math.max(0,Math.floor(p.y)))*SIZE+Math.min(SIZE-1,Math.max(0,Math.floor(p.x)));if(afterX!==cell)enterRoom(run,cell,afterX,random);cx=Math.min(SIZE-1,Math.max(0,Math.floor(p.x)));cy=Math.min(SIZE-1,Math.max(0,Math.floor(p.y)));cell=cy*SIZE+cx;const f=p.x-cx,up=cy>0&&passable(run,cell,cell-SIZE,f),down=cy<SIZE-1&&passable(run,cell,cell+SIZE,f);hit=false;if(ny<cy+RADIUS&&!up){p.y=cy+RADIUS;hit=true}else if(ny>cy+1-RADIUS&&!down){p.y=cy+1-RADIUS;hit=true}else p.y=ny;if(hit){if(p.wrestlerState==='lunging')p.wrestlerUntil=run.time;else bounce(p,'y',random);}const afterY=Math.min(SIZE-1,Math.max(0,Math.floor(p.y)))*SIZE+Math.min(SIZE-1,Math.max(0,Math.floor(p.x)));if(afterY!==cell)enterRoom(run,cell,afterY,random);const obstacleHit=resolveWalls(run,p,oldX,oldY,RADIUS);if(obstacleHit.xHit){if(p.wrestlerState==='lunging')p.wrestlerUntil=run.time;else bounce(p,'x',random)}if(obstacleHit.yHit){if(p.wrestlerState==='lunging')p.wrestlerUntil=run.time;else bounce(p,'y',random)}if(p.wrestlerState==='lunging'){updateWrestler(run,p);if(p.wrestlerState!=='lunging')break}collectMap(run,p);const gx=run.goal%SIZE+.5,gy=Math.floor(run.goal/SIZE)+.5;if(Math.hypot(p.x-gx,p.y-gy)<.14){p.arrived=true;p.holding=false;p.shielding=false;p.poison=null;p.stunUntil=0;p.x=gx+(run.players.indexOf(p)%3-1)*.045;p.y=gy+(Math.floor(run.players.indexOf(p)/3)-1)*.045;break}}}stepHazards(run,random);stepCombat(run,dt,random);removeDefeatedEnemies(run);updateRoomLocks(run);advanceRevives(run,dt);run.failed=run.players.length>0&&run.players.every(p=>p.hp<=0);run.tick++;return !run.failed&&run.players.every(p=>p.hp<=0||p.arrived)}
