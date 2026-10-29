import {emitAttackSound} from './audio-events.mjs';
import {GAMBIT_DELAY,GAMBIT_NAMES} from './gambit.mjs';
import {POT_RADIUS,potsInArea,launchPot,canThrowPot} from './pots.mjs';
import {keyPending,enterKeyRoom} from './keys.mjs';
import {arenaRoom,inArena,roomBounds,sameArea,tileOf} from './arena.mjs';
import {applyPoison,tickPoison,clearPoison,healAlly} from './poison.mjs';
import {enemyFor,enemyRadius,eligibleEnemies,scaledEnemyHealth,turnFlapper,FLAPPER_TURN_INTERVAL,SLAM_RADIUS,SLAM_INTERVAL,SLAM_WINDUP} from './enemies.mjs';
import {obstaclesInRoom,touchesSquare,resolveWalls,wallBlocksLine} from './obstacles.mjs';
import {SIZE,PLAYER_RADIUS,SPEED_MULTIPLIER} from './world.mjs';
import {roleFor,inAttack,WIDTH} from './roles.mjs';
export const PLAYER_HP=10,PLAYER_DAMAGE=5,ENEMY_DAMAGE=2,ATTACK_RADIUS=.18,SHIELD_RADIUS=.075,ENEMY_RADIUS=.026,ATTACK_COOLDOWN=.65,HIT_COOLDOWN=.8,SLEEP_RADIUS=.27,ATTACK_IFRAMES=.35,SLEEP_WAKE=.65,SLEEP_REST=2;
export const roomOf=p=>Math.min(SIZE-1,Math.max(0,Math.floor(p.y)))*SIZE+Math.min(SIZE-1,Math.max(0,Math.floor(p.x)));
export function isEnemyRoom(run,room){return room!==run.goal&&room!==run.startRoom&&run.edges[room]?.length>0&&(run.enemyRooms?!!run.enemyRooms[room]:((room%SIZE+Math.floor(room/SIZE))%2===1))}
export function spawnEnemies(run,random=Math.random,onlyRoom=null,fromRoom=null){
 const enemies=[];
 for(let room=0;room<SIZE*SIZE;room++){
  if((onlyRoom!==null&&room!==onlyRoom)||!isEnemyRoom(run,room))continue;
  // Room budgets count encounter slots; a Flapper pair shares one slot.
  const roll=random(),slots=roll<.6?2:roll<.82?3:roll<.94?4:5,pool=eligibleEnemies(run.round||1);
  for(let slot=0;slot<slots;slot++){
   const type=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))],spec=enemyFor(type);
   for(let member=0;member<(type==='flapper'?2:1);member++){
    const angle=random()*Math.PI*2;let x,y;
    for(let j=0;j<30;j++){
     const dx=fromRoom===null?0:(room%SIZE)-(fromRoom%SIZE),dy=fromRoom===null?0:Math.floor(room/SIZE)-Math.floor(fromRoom/SIZE);
     x=room%SIZE+(dx>0?.64+random()*.2:dx<0?.16+random()*.2:.15+random()*.7);y=Math.floor(room/SIZE)+(dy>0?.64+random()*.2:dy<0?.16+random()*.2:.15+random()*.7);
     if(!run.players.some(p=>Math.hypot(p.x-x,p.y-y)<.16)&&!obstaclesInRoom(run,room).some(o=>touchesSquare({x,y},spec.radius+.015,o)))break;
    }
    const hp=scaledEnemyHealth(type,run.teamSize??run.players.filter(p=>!p.deceased).length);
    enemies.push({id:`${room}-${slot}${member?'-pair':''}`,spawnSlot:slot,room,type,x,y,vx:Math.cos(angle)*spec.speed,vy:Math.sin(angle)*spec.speed,hp,maxHp:hp,directionStep:(slot+member)%5,nextDirectionAt:(run.time||0)+FLAPPER_TURN_INTERVAL,mode:type==='sleeper'?'sleeping':'walking',nextSlam:(run.time||0)+SLAM_INTERVAL,lungeUntil:0,nextLunge:0,hitUntil:0});
   }
  }
 }
 return enemies;
}
// Derived room index is kept outside the networked game state.
const roomIndexes=new WeakMap();
export function enemiesInRoom(run,room){
 if(arenaRoom(run,room))return run.enemies||[];
 const enemies=run.enemies||[];let cache=roomIndexes.get(run);
 if(!cache||cache.source!==enemies||cache.length!==enemies.length){const rooms=Array.from({length:SIZE*SIZE},()=>[]);for(const enemy of enemies)if(rooms[enemy.room])rooms[enemy.room].push(enemy);cache={source:enemies,length:enemies.length,rooms};roomIndexes.set(run,cache)}
 return cache.rooms[room]||[];
}
export function removeDefeatedEnemies(run){
 if(!(run.enemies||[]).some(e=>e.hp<=0))return;
 const defeated=new Set(run.enemies.filter(e=>e.hp<=0).map(e=>e.id));
 run.enemies=run.enemies.filter(e=>e.hp>0);
 for(const p of run.players)if(defeated.has(p.grappleTarget))p.grappleTarget=null;
}
// Distant encounters retain their state but do not simulate.
export function refreshEnemyActivity(run,random=Math.random){
 const nearby=new Set();for(const p of run.players){const room=roomOf(p),x=room%SIZE,y=Math.floor(room/SIZE);nearby.add(room);if(x>0)nearby.add(room-1);if(x<SIZE-1)nearby.add(room+1);if(y>0)nearby.add(room-SIZE);if(y<SIZE-1)nearby.add(room+SIZE)}
 run.spawnedEnemyRooms??=Array(SIZE*SIZE).fill(false);run.enemies??=[];
  for(const e of run.enemies){const active=run.kind==='boss'?!!run.bossActive:nearby.has(e.room);if(e.active===false&&active){const pause=Math.max(0,(run.time||0)-(e.inactiveSince??(run.time||0)));for(const key of ['wakeUntil','lungeUntil','nextLunge','poisonUntil','poisonNext','stunUntil','hitUntil','attackWindupUntil','attackActiveUntil','nextContactAttack','nextDirectionAt','nextSlam','slamWindupUntil','slamUntil'])if(e[key]>0)e[key]+=pause;delete e.inactiveSince}else if(e.active!==false&&!active)e.inactiveSince=run.time||0;e.active=active}
 return nearby;
}
// Spawn an encounter only on first entry; the approach side selects the opposite spawn zone.
export function enterRoom(run,fromRoom,toRoom,random=Math.random){
 if(fromRoom===toRoom)return false;
 if(keyPending(run,toRoom)){enterKeyRoom(run,toRoom);run.lockedRooms??=Array(SIZE*SIZE).fill(false);run.lockedRooms[toRoom]=true;return true}
 if(!isEnemyRoom(run,toRoom))return false;
 run.spawnedEnemyRooms??=Array(SIZE*SIZE).fill(false);run.lockedRooms??=Array(SIZE*SIZE).fill(false);run.enemies??=[];
 if(run.spawnedEnemyRooms[toRoom])return false;
 run.spawnedEnemyRooms[toRoom]=true;const enemies=spawnEnemies(run,random,toRoom,fromRoom);run.enemies.push(...enemies);run.lockedRooms[toRoom]=enemies.some(e=>e.hp>0);return true;
}
export function updateRoomLocks(run){if(!run.lockedRooms)return;for(let room=0;room<SIZE*SIZE;room++)if(run.lockedRooms[room]&&!keyPending(run,room)&&!enemiesInRoom(run,room).some(e=>e.hp>0))run.lockedRooms[room]=false}
function clearPath(run,a,b){
 if(wallBlocksLine(run,a,b))return false;const ar=roomOf(a),br=roomOf(b);if(ar===br)return true;
 if(inArena(run,a)&&inArena(run,b))return true;if(!run.edges[ar]?.includes(br))return false;
 const ax=ar%SIZE,ay=Math.floor(ar/SIZE),bx=br%SIZE,by=Math.floor(br/SIZE),horizontal=ay===by;
 const border=horizontal?(bx>ax?ax+1:ax):(by>ay?ay+1:ay),denom=horizontal?b.x-a.x:b.y-a.y;if(!denom)return false;
 const t=(border-(horizontal?a.x:a.y))/denom;if(t<0||t>1)return false;
 const pos=horizontal?(a.y+(b.y-a.y)*t-ay):(a.x+(b.x-a.x)*t-ax),key=`${Math.min(ar,br)}:${Math.max(ar,br)}`;
 return (run.doors?.[key]||[[.34,.66]]).some(([lo,hi])=>pos>=lo&&pos<=hi);
}
function guarded(run,p){return run.players.some(b=>b!==p&&b.hp>0&&!b.arrived&&b.color==='gold'&&b.shielding&&b.shield>0&&clearPath(run,b,p)&&Math.hypot(b.x-p.x,b.y-p.y)<=3*WIDTH)}
function down(p){p.hp=0;p.holding=false;p.shielding=false;p.arrived=false;p.reviving=null;p.attackUntil=0;clearPoison(p);p.stunUntil=0}
export function damagePlayer(run,p,damage,random=Math.random){
 const now=run.time||0;if(p.hp<=0||p.arrived||guarded(run,p))return false;
 if(p.shielding&&p.shield>0){p.shield=Math.max(0,p.shield-damage);p.blockUntil=now+.16;if(!p.shield){p.shieldBreakUntil=now+.45;p.shielding=false;if(p.color==='lime')jokerGambit(run,p,random);else p.stunUntil=now+5}return true}
 p.hp=Math.max(0,p.hp-damage);p.hurtUntil=now+.22;p.reviving=null;p.reviveInterruptedUntil=now+.01;if(p.hp===0)down(p);return true;
}
function jokerGambit(run,p){
 const now=run.time||0;if(p.gambitPending)return;
 const id=`${run.round||1}:${run.gambitSerial=(run.gambitSerial||0)+1}`;
 p.gambitPending={id,revealAt:now+GAMBIT_DELAY};
 run.gambitCue={id,startedAt:now,revealAt:now+GAMBIT_DELAY,outcome:null,expiresAt:now+1.4};
}
function resolveGambit(run,p,random){
 const pending=p.gambitPending,now=run.time||0;if(!pending||now+1e-9<pending.revealAt)return;
 p.gambitPending=null;if(p.hp<=0||p.arrived||p.deceased)return;
 const outcome=Math.floor(random()*6);p.gambit=outcome;p.gambitUntil=now+1;
 run.gambitCue={...run.gambitCue,id:pending.id,outcome:GAMBIT_NAMES[outcome],expiresAt:now+1.2};
 const near=(x,n)=>clearPath(run,p,x)&&Math.hypot(p.x-x.x,p.y-x.y)<=n*WIDTH;
 if(outcome===0){emitAttackSound(run,p,'explosion');for(const q of run.players)if(q!==p&&q.hp>0&&!q.arrived&&!guarded(run,q)&&near(q,6))damagePlayer(run,q,20,random);for(const e of run.enemies||[])if(e.hp>0&&near(e,6)){e.hp=Math.max(0,e.hp-20);e.hitUntil=now+.2;}down(p)}
 else if(outcome===1)p.invisibleUntil=now+7;
 else if(outcome===2){for(const q of run.players)if(q!==p&&q.hp>0&&!q.arrived&&near(q,2))healAlly(p,q,10)}
 else if(outcome===3){emitAttackSound(run,p,'shock');for(const q of run.players)if(q!==p&&q.hp>0&&!q.arrived&&!guarded(run,q)&&near(q,2)){q.stunUntil=now+4;q.reviving=null;q.reviveInterruptedUntil=now+4}for(const e of run.enemies||[])if(e.hp>0&&near(e,2))e.stunUntil=now+4}
 else if(outcome===4)p.airUntil=now+5;
 else p.finalDrawUntil=now+1;
}
function finalDraw(run,p){if(!p.finalDrawUntil||p.hp<=0||p.arrived||p.throwing||p.grabbedBy)return;const now=run.time||0;if(now>p.finalDrawUntil){p.finalDrawUntil=0;return}const targets=[...run.players.filter(q=>q!==p&&q.hp>0&&!q.arrived&&!guarded(run,q)),...(run.enemies||[]).filter(e=>e.hp>0)].filter(q=>clearPath(run,p,q)).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y));const target=targets[0];if(target){emitAttackSound(run,p,'blue');if(run.players.includes(target))down(target);else target.hp=0;p.finalDrawUntil=0}}
export const ATTACK_DURATION=.28;
const swings=new WeakMap();
function resolveSwing(run,p){
 const swing=swings.get(p),now=run.time||0;if(!swing)return;
 if(now>=p.attackUntil||p.hp<=0||p.arrived||p.reviving||p.throwing||p.grabbedBy||now<(p.stunUntil||0)){swings.delete(p);p.attackUntil=0;return}
 const role=roleFor(p.color),aim={...p,angle:swing.angle};
 let targets=[...(run.enemies||[]).filter(e=>e.hp>0),...(canThrowPot(p)?potsInArea(run,p).filter(o=>!o.grabbedBy):[])].filter(e=>!swing.hits.has(e.id)&&clearPath(run,p,e)&&inAttack(aim,e,e.kind==='pot'?POT_RADIUS:enemyRadius(e))).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
 if(role.single)targets=swing.hits.size?[]:targets.slice(0,1);
 for(const e of targets){swing.hits.add(e.id);if(e.kind==='pot'){launchPot(run,e,p,swing.angle);continue}e.hp=Math.max(0,e.hp-swing.damage);e.hitUntil=now+.2;swing.enemyHit=true;if(p.color==='green')applyPoison(e,now,{refresh:true})}
 for(const q of run.players){if(q===p||q.hp<=0||q.arrived||swing.healed.has(q.id)||!clearPath(run,p,q)||Math.hypot(q.x-p.x,q.y-p.y)>2*WIDTH)continue;const heal=p.color==='purple'&&swing.enemyHit?3:p.color==='green'&&inAttack(aim,q)?5:0;if(heal){healAlly(p,q,heal);swing.healed.add(q.id)}}
}
export function attack(run,p){
 const now=run.time||0,role=roleFor(p.color);if(p.hp<=0||p.arrived||p.reviving||p.throwing||p.grabbedBy||now<(p.stunUntil||0)||now<(p.nextAttack||0))return false;
 emitAttackSound(run,p,p.color);p.nextAttack=now+role.cooldown;p.attackUntil=now+ATTACK_DURATION;p.attackFacing=p.angle||0;p.invulnerableUntil=Math.max(p.invulnerableUntil||0,now+ATTACK_IFRAMES);p.attackGraceUntil=now+ATTACK_IFRAMES;
 let damage=role.damage;if(p.color==='pink'&&now>=(p.lungeReadyAt||15)){damage=12;p.lungeReadyAt=now+15;p.lungeUntil=now+.2;p.lungeAngle=p.angle;p.invulnerableUntil=Math.max(p.invulnerableUntil,now+.2)}
 swings.set(p,{angle:p.attackFacing,damage,hits:new Set(),healed:new Set()});resolveSwing(run,p);return true;
}
function enemyHit(run,e,p,random,{poison=false,stun=0}={}){
 const now=run.time||0;if(p.hp<=0||p.arrived||guarded(run,p)||now<(p.invulnerableUntil||0)||!clearPath(run,e,p))return false;
 const shielded=p.shielding&&p.shield>0;
 if(shielded&&p.color==='coral'&&now-(p.shieldRaisedAt||0)<=.3){e.hp=Math.max(0,e.hp-2);e.hitUntil=now+.2;e.vx*=-1;e.vy*=-1}
 damagePlayer(run,p,enemyFor(e).damage,random);p.invulnerableUntil=now+HIT_COOLDOWN;p.reviving=null;p.reviveInterruptedUntil=now+HIT_COOLDOWN;
 if(p.hp>0&&stun){p.stunUntil=Math.max(p.stunUntil||0,now+stun);p.holding=false;p.shielding=false;p.usingAttack=false;p.wrestlerState=null;}
 if(poison&&p.hp>0)applyPoison(p,now)
 return true;
}
function tickPlayerPoison(run,p){const now=run.time||0;if(p.hp<=0||p.arrived){clearPoison(p);return}tickPoison(p,now,damage=>{if(guarded(run,p))return;p.hp=Math.max(0,p.hp-damage);p.hurtUntil=now+.22;p.reviving=null;p.reviveInterruptedUntil=now+.01;if(p.hp===0)down(p)})}
// Hold non-attacking enemies at the shield boundary through their windup.
// Bouncing them away before an attack activates makes shield contact miss.
function repelFromShields(run,e){for(const p of run.players){if(p.hp<=0||p.arrived||!p.shielding||p.shield<=0||!sameArea(run,p,e)||!clearPath(run,e,p))continue;const bounds=roomBounds(run,e.room),r=enemyRadius(e),reach=SHIELD_RADIUS+r,dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);if(d>=reach)continue;const nx=d>1e-8?dx/d:1,ny=d>1e-8?dy/d:0,oldX=e.x,oldY=e.y;e.x=Math.max(bounds.x+r,Math.min(bounds.x+bounds.width-r,p.x+nx*reach));e.y=Math.max(bounds.y+r,Math.min(bounds.y+bounds.height-r,p.y+ny*reach));resolveWalls(run,e,oldX,oldY,r);const dot=e.vx*nx+e.vy*ny;const attacking=e.type==='sleeper'?e.mode==='lunging':run.time<(e.attackActiveUntil||0);if(attacking&&dot<0){e.vx-=2*dot*nx;e.vy-=2*dot*ny}}}
function moveEnemy(run,e,dt,random){
 const bounds=roomBounds(run,e.room),r=enemyRadius(e),spec=enemyFor(e),loX=bounds.x+r,hiX=bounds.x+bounds.width-r,loY=bounds.y+r,hiY=bounds.y+bounds.height-r,oldX=e.x,oldY=e.y;
 e.x+=e.vx*dt;e.y+=e.vy*dt;
 if(e.x<loX||e.x>hiX){e.x=Math.max(loX,Math.min(hiX,e.x));e.vx=-e.vx;if(e.type!=='sleeper'&&e.type!=='flapper'&&e.mode!=='lunging'){const a=Math.atan2(e.vy,e.vx)+(random()-.5)*.2;e.vy=Math.sin(a)*spec.speed;e.vx=Math.sign(e.vx)*Math.sqrt(Math.max(0,spec.speed**2-e.vy**2))}}
 if(e.y<loY||e.y>hiY){e.y=Math.max(loY,Math.min(hiY,e.y));e.vy=-e.vy}
 if(inArena(run,e))e.room=tileOf(e);const wall=resolveWalls(run,e,oldX,oldY,r);if(wall.xHit)e.vx=-e.vx;if(wall.yHit)e.vy=-e.vy;
}
export function stepCombat(run,dt,random=Math.random){
 const now=run.time||0;for(const p of run.players){tickPlayerPoison(run,p);resolveGambit(run,p,random);finalDraw(run,p)}
 const rooms=new Set(run.players.map(roomOf).flatMap(r=>[r,...(r%SIZE?[r-1]:[]),...(r%SIZE<SIZE-1?[r+1]:[]),...(r>=SIZE?[r-SIZE]:[]),...(r<SIZE*(SIZE-1)?[r+SIZE]:[])]));
 const processed=new Set();for(const room of rooms)for(const e of enemiesInRoom(run,room)){
  if(processed.has(e.id))continue;processed.add(e.id);
  if(e.active===false||e.hp<=0)continue;
  tickPoison(e,now,damage=>{e.hp=Math.max(0,e.hp-damage);e.hitUntil=now+.2})
  if(e.hp<=0||e.throwing||e.grabbedBy||now<(e.stunUntil||0))continue;
  const targets=run.players.filter(p=>p.hp>0&&!p.arrived&&(sameArea(run,p,e)||(p.shielding&&p.shield>0&&run.edges[e.room]?.includes(roomOf(p))))),visible=targets.filter(p=>now>=(p.invisibleUntil||0));
  if(e.type==='warden'){moveEnemy(run,e,dt,random);repelFromShields(run,e);continue}
  if(e.type==='sleeper'){
   const nearest=visible.reduce((best,p)=>!best||Math.hypot(p.x-e.x,p.y-e.y)<Math.hypot(best.x-e.x,best.y-e.y)?p:best,null);
   if(e.mode==='lunging'&&now>=e.lungeUntil){e.mode='resting';e.nextLunge=now+SLEEP_REST}
   if(e.mode==='resting'&&now>=e.nextLunge)e.mode='sleeping';
   if(e.mode==='waking'&&now>=e.wakeUntil){e.mode='lunging';emitAttackSound(run,e,'sleeper');e.lungeUntil=now+.32;e.vx=Math.cos(e.lungeAngle)*.82*SPEED_MULTIPLIER;e.vy=Math.sin(e.lungeAngle)*.82*SPEED_MULTIPLIER}
   else if(e.mode==='sleeping'&&nearest&&now>=(e.nextLunge||0)&&Math.hypot(nearest.x-e.x,nearest.y-e.y)<=SLEEP_RADIUS&&clearPath(run,e,nearest)){e.mode='waking';e.wakeUntil=now+SLEEP_WAKE;e.lungeAngle=Math.atan2(nearest.y-e.y,nearest.x-e.x)}
  }
  if(e.type==='creeper'){
   e.nextSlam??=now+SLAM_INTERVAL;
   if(!e.slamWindupUntil&&now>=e.nextSlam-SLAM_WINDUP){e.slamWindupUntil=e.nextSlam;e.mode='winding'}
   if(e.slamWindupUntil&&now>=e.slamWindupUntil){e.slamWindupUntil=0;e.nextSlam=now+SLAM_INTERVAL;e.slamUntil=now+.25;emitAttackSound(run,e,'creeper');e.mode='walking';for(const p of targets){const reach=SLAM_RADIUS+(p.shielding&&p.shield>0?SHIELD_RADIUS:PLAYER_RADIUS);if(Math.hypot(p.x-e.x,p.y-e.y)<=reach)enemyHit(run,e,p,random,{stun:1.5})}}
   if(!e.slamWindupUntil)moveEnemy(run,e,dt,random);
   repelFromShields(run,e);continue;
  }
  if(e.type==='flapper')turnFlapper(e,now);
  if(e.type==='walker'||e.type==='flapper'||e.mode==='lunging')moveEnemy(run,e,dt,random);
  if(e.type==='walker'||e.type==='flapper'){
   if(e.attackWindupUntil&&now>=e.attackWindupUntil){e.attackWindupUntil=0;e.attackActiveUntil=now+.25;emitAttackSound(run,e,e.type);e.nextContactAttack=now+1.1}
   if(!e.attackWindupUntil&&now>=(e.attackActiveUntil||0)&&now>=(e.nextContactAttack||0)&&visible.some(p=>clearPath(run,e,p)&&Math.hypot(e.x-p.x,e.y-p.y)<(p.shielding&&p.shield>0?SHIELD_RADIUS+enemyRadius(e)+.02:.09)))e.attackWindupUntil=now+.2;
  }
  const attacking=e.type==='sleeper'?e.mode==='lunging':now<(e.attackActiveUntil||0);
  if(attacking)for(const p of targets){const reach=enemyRadius(e)+(p.shielding&&p.shield>0?SHIELD_RADIUS:PLAYER_RADIUS)+1e-7;if(Math.abs(e.x-p.x)<=reach&&Math.abs(e.y-p.y)<=reach&&Math.hypot(e.x-p.x,e.y-p.y)<=reach)enemyHit(run,e,p,random,{poison:e.type==='flapper'})}
  repelFromShields(run,e);
 }
 for(const p of run.players)resolveSwing(run,p);run.failed=run.players.length>0&&run.players.every(p=>p.hp<=0);
}

export function stepHazards(run,random=Math.random){
 for(const p of run.players){
  if(p.hp<=0||p.arrived||p.deceased)continue;
  const contact=[];for(const o of obstaclesInRoom(run,roomOf(p))){if(o.type!=='spikes'||!touchesSquare(p,p.shielding&&p.shield>0?SHIELD_RADIUS:PLAYER_RADIUS,o)||wallBlocksLine(run,p,{x:o.x+o.size/2,y:o.y+o.size/2}))continue;contact.push(o.id);if(!(p.spikeContacts||[]).includes(o.id)&&run.time>=(p.invulnerableUntil||0)){damagePlayer(run,p,1,random);p.reviveInterruptedUntil=run.time+.1}}
  p.spikeContacts=contact;
 }
}
