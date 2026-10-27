import {roleFor,inAttack,WIDTH} from './roles.mjs';
export const PLAYER_HP=10,PLAYER_DAMAGE=5,ENEMY_DAMAGE=2,ATTACK_RADIUS=.18,ENEMY_RADIUS=.026,ATTACK_COOLDOWN=.65,HIT_COOLDOWN=.8,SLEEP_RADIUS=.27,ATTACK_IFRAMES=.35,SLEEP_WAKE=.65,SLEEP_REST=2;
export const roomOf=p=>Math.min(4,Math.max(0,Math.floor(p.y)))*5+Math.min(4,Math.max(0,Math.floor(p.x)));
export function isEnemyRoom(run,room){return room!==run.goal&&run.edges[room]?.length>0&&((room%5+Math.floor(room/5))%2===1)}
export function spawnEnemies(run,random=Math.random,onlyRoom=null,fromRoom=null){const enemies=[];for(let room=0;room<25;room++){if((onlyRoom!==null&&room!==onlyRoom)||!isEnemyRoom(run,room))continue;const roll=random(),count=roll<.6?2:roll<.82?3:roll<.94?4:5;for(let i=0;i<count;i++){const type=random()<.5?'walker':'sleeper',angle=random()*Math.PI*2;let x,y;for(let j=0;j<30;j++){const dx=fromRoom===null?0:(room%5)-(fromRoom%5),dy=fromRoom===null?0:Math.floor(room/5)-Math.floor(fromRoom/5);x=room%5+(dx>0?.64+random()*.2:dx<0?.16+random()*.2:.15+random()*.7);y=Math.floor(room/5)+(dy>0?.64+random()*.2:dy<0?.16+random()*.2:.15+random()*.7);if(!run.players.some(p=>Math.hypot(p.x-x,p.y-y)<.16))break}enemies.push({id:`${room}-${i}`,room,type,x,y,vx:Math.cos(angle)*.19,vy:Math.sin(angle)*.19,hp:type==='walker'?7:12,maxHp:type==='walker'?7:12,mode:type==='walker'?'walking':'sleeping',lungeUntil:0,nextLunge:0,hitUntil:0})}}return enemies}
// Derived room index is kept outside the networked game state.
const roomIndexes=new WeakMap();
export function enemiesInRoom(run,room){
 const enemies=run.enemies||[];let cache=roomIndexes.get(run);
 if(!cache||cache.source!==enemies||cache.length!==enemies.length){const rooms=Array.from({length:25},()=>[]);for(const enemy of enemies)if(rooms[enemy.room])rooms[enemy.room].push(enemy);cache={source:enemies,length:enemies.length,rooms};roomIndexes.set(run,cache)}
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
 const nearby=new Set();for(const p of run.players){const room=roomOf(p),x=room%5,y=Math.floor(room/5);nearby.add(room);if(x>0)nearby.add(room-1);if(x<4)nearby.add(room+1);if(y>0)nearby.add(room-5);if(y<4)nearby.add(room+5)}
 run.spawnedEnemyRooms??=Array(25).fill(false);run.enemies??=[];
  for(const e of run.enemies){const active=nearby.has(e.room);if(e.active===false&&active){const pause=Math.max(0,(run.time||0)-(e.inactiveSince??(run.time||0)));for(const key of ['wakeUntil','lungeUntil','nextLunge','poisonUntil','poisonNext','stunUntil','hitUntil','attackWindupUntil','attackActiveUntil','nextContactAttack'])if(e[key]>0)e[key]+=pause;delete e.inactiveSince}else if(e.active!==false&&!active)e.inactiveSince=run.time||0;e.active=active}
 return nearby;
}
// Spawn an encounter only on first entry; the approach side selects the opposite spawn zone.
export function enterRoom(run,fromRoom,toRoom,random=Math.random){
 if(fromRoom===toRoom||!isEnemyRoom(run,toRoom))return false;
 run.spawnedEnemyRooms??=Array(25).fill(false);run.lockedRooms??=Array(25).fill(false);run.enemies??=[];
 if(run.spawnedEnemyRooms[toRoom])return false;
 run.spawnedEnemyRooms[toRoom]=true;const enemies=spawnEnemies(run,random,toRoom,fromRoom);run.enemies.push(...enemies);run.lockedRooms[toRoom]=enemies.some(e=>e.hp>0);return true;
}
export function updateRoomLocks(run){if(!run.lockedRooms)return;for(let room=0;room<25;room++)if(run.lockedRooms[room]&&!enemiesInRoom(run,room).some(e=>e.hp>0))run.lockedRooms[room]=false}
function clearPath(run,a,b){
 const ar=roomOf(a),br=roomOf(b);if(ar===br)return true;
 if(!run.edges[ar]?.includes(br))return false;
 const ax=ar%5,ay=Math.floor(ar/5),bx=br%5,by=Math.floor(br/5),horizontal=ay===by;
 const border=horizontal?(bx>ax?ax+1:ax):(by>ay?ay+1:ay),denom=horizontal?b.x-a.x:b.y-a.y;if(!denom)return false;
 const t=(border-(horizontal?a.x:a.y))/denom;if(t<0||t>1)return false;
 const pos=horizontal?(a.y+(b.y-a.y)*t-ay):(a.x+(b.x-a.x)*t-ax),key=`${Math.min(ar,br)}:${Math.max(ar,br)}`;
 return (run.doors?.[key]||[[.34,.66]]).some(([lo,hi])=>pos>=lo&&pos<=hi);
}
function guarded(run,p){return run.players.some(b=>b!==p&&b.hp>0&&!b.arrived&&b.color==='gold'&&b.shielding&&b.shield>0&&clearPath(run,b,p)&&Math.hypot(b.x-p.x,b.y-p.y)<=3*WIDTH)}
function down(p){p.hp=0;p.holding=false;p.shielding=false;p.arrived=false;p.reviving=null;p.attackUntil=0;p.poisonUntil=0;p.poisonNext=0;p.stunUntil=0}
export function damagePlayer(run,p,damage,random=Math.random){
 const now=run.time||0;if(p.hp<=0||p.arrived||guarded(run,p))return false;
 if(p.shielding&&p.shield>0){p.shield=Math.max(0,p.shield-damage);p.blockUntil=now+.16;if(!p.shield){p.shielding=false;if(p.color==='lime')jokerGambit(run,p,random);else p.stunUntil=now+5}return true}
 p.hp=Math.max(0,p.hp-damage);p.hurtUntil=now+.22;p.reviving=null;p.reviveInterruptedUntil=now+.01;if(p.hp===0)down(p);return true;
}
function jokerGambit(run,p,random){
 const now=run.time||0,outcome=Math.floor(random()*6);p.gambit=outcome;p.gambitUntil=now+1;
 const near=(x,n)=>clearPath(run,p,x)&&Math.hypot(p.x-x.x,p.y-x.y)<=n*WIDTH;
 if(outcome===0){for(const q of run.players)if(q!==p&&q.hp>0&&!q.arrived&&!guarded(run,q)&&near(q,6))damagePlayer(run,q,20,random);for(const e of run.enemies||[])if(e.hp>0&&near(e,6))e.hp=Math.max(0,e.hp-20);down(p)}
 else if(outcome===1)p.invisibleUntil=now+7;
 else if(outcome===2){for(const q of run.players)if(q!==p&&q.hp>0&&!q.arrived&&near(q,2))q.hp=Math.min(q.maxHp,q.hp+10)}
 else if(outcome===3){for(const q of run.players)if(q!==p&&q.hp>0&&!q.arrived&&!guarded(run,q)&&near(q,2)){q.stunUntil=now+1.5;q.reviving=null;q.reviveInterruptedUntil=now+1.5}for(const e of run.enemies||[])if(e.hp>0&&near(e,2))e.stunUntil=now+1.5}
 else if(outcome===4)p.airUntil=now+5;
 else p.finalDrawUntil=now+1;
}
function finalDraw(run,p){if(!p.finalDrawUntil||p.hp<=0||p.arrived)return;const now=run.time||0;if(now>p.finalDrawUntil){p.finalDrawUntil=0;return}const targets=[...run.players.filter(q=>q!==p&&q.hp>0&&!q.arrived&&!guarded(run,q)),...(run.enemies||[]).filter(e=>e.hp>0)].filter(q=>clearPath(run,p,q)).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y));const target=targets[0];if(target){if(run.players.includes(target))down(target);else target.hp=0;p.finalDrawUntil=0}}
export function attack(run,p){
 const now=run.time||0,role=roleFor(p.color);if(p.hp<=0||p.arrived||p.reviving||now<(p.stunUntil||0)||now<(p.nextAttack||0))return false;
 p.nextAttack=now+role.cooldown;p.attackUntil=now+.24;p.invulnerableUntil=Math.max(p.invulnerableUntil||0,now+ATTACK_IFRAMES);p.attackGraceUntil=now+ATTACK_IFRAMES;
 let enemies=(run.enemies||[]).filter(e=>e.hp>0&&clearPath(run,p,e)&&inAttack(p,e)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));if(role.single)enemies=enemies.slice(0,1);
 let damage=role.damage;if(p.color==='pink'&&now>=(p.lungeReadyAt||15)){damage=12;p.lungeReadyAt=now+15;p.lungeUntil=now+.2;p.lungeAngle=p.angle;p.invulnerableUntil=Math.max(p.invulnerableUntil,now+.2)}
 for(const e of enemies){e.hp=Math.max(0,e.hp-damage);e.hitUntil=now+.2;if(p.color==='green'){if(!e.poisonUntil||e.poisonUntil<=now)e.poisonNext=now+1;e.poisonUntil=now+5}}
 if(p.color==='purple'&&enemies.length)for(const q of run.players)if(q!==p&&q.hp>0&&!q.arrived&&clearPath(run,p,q)&&Math.hypot(q.x-p.x,q.y-p.y)<=2*WIDTH)q.hp=Math.min(q.maxHp,q.hp+3);
 if(p.color==='green')for(const q of run.players)if(q!==p&&q.hp>0&&!q.arrived&&clearPath(run,p,q)&&inAttack(p,q)&&Math.hypot(q.x-p.x,q.y-p.y)<=2*WIDTH)q.hp=Math.min(q.maxHp,q.hp+5);
 return true;
}
export function stepCombat(run,dt,random=Math.random){const now=run.time||0;for(const p of run.players)finalDraw(run,p);for(const room of new Set(run.players.map(roomOf).flatMap(r=>[r,...(r%5?[r-1]:[]),...(r%5<4?[r+1]:[]),...(r>=5?[r-5]:[]),...(r<20?[r+5]:[])])))for(const e of enemiesInRoom(run,room)){if(e.active===false||e.hp<=0)continue;while(e.poisonNext&&e.poisonNext<=now&&e.poisonNext<=e.poisonUntil){e.hp=Math.max(0,e.hp-2);e.poisonNext+=1}if(e.hp<=0||e.throwing||e.grabbedBy||now<(e.stunUntil||0))continue;const targets=run.players.filter(p=>p.hp>0&&!p.arrived&&roomOf(p)===e.room);const visibleTargets=targets.filter(p=>now>=(p.invisibleUntil||0));if(e.type==='sleeper'){const nearest=visibleTargets.reduce((best,p)=>!best||Math.hypot(p.x-e.x,p.y-e.y)<Math.hypot(best.x-e.x,best.y-e.y)?p:best,null);if(e.mode==='lunging'&&now>=e.lungeUntil){e.mode='resting';e.nextLunge=now+SLEEP_REST}if(e.mode==='resting'&&now>=e.nextLunge)e.mode='sleeping';if(e.mode==='waking'&&now>=e.wakeUntil){e.mode='lunging';e.lungeUntil=now+.32;e.vx=Math.cos(e.lungeAngle)*.82;e.vy=Math.sin(e.lungeAngle)*.82}else if(e.mode==='sleeping'&&nearest&&now>=(e.nextLunge||0)&&Math.hypot(nearest.x-e.x,nearest.y-e.y)<=SLEEP_RADIUS){e.mode='waking';e.wakeUntil=now+SLEEP_WAKE;e.lungeAngle=Math.atan2(nearest.y-e.y,nearest.x-e.x)}}if(e.type==='walker'||e.mode==='lunging'){const loX=e.room%5+ENEMY_RADIUS,hiX=e.room%5+1-ENEMY_RADIUS,loY=Math.floor(e.room/5)+ENEMY_RADIUS,hiY=Math.floor(e.room/5)+1-ENEMY_RADIUS;e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.x<loX||e.x>hiX){e.x=Math.max(loX,Math.min(hiX,e.x));e.vx=-e.vx;if(e.type==='walker'){const a=Math.atan2(e.vy,e.vx)+(random()-.5)*.2;e.vy=Math.sin(a)*.19;e.vx=Math.sign(e.vx)*Math.sqrt(Math.max(0,.19**2-e.vy**2))}}if(e.y<loY||e.y>hiY){e.y=Math.max(loY,Math.min(hiY,e.y));e.vy=-e.vy}}if(e.type==='walker'){
 if(e.attackWindupUntil&&now>=e.attackWindupUntil){e.attackWindupUntil=0;e.attackActiveUntil=now+.25;e.nextContactAttack=now+1.1}
 if(!e.attackWindupUntil&&now>=(e.attackActiveUntil||0)&&now>=(e.nextContactAttack||0)&&visibleTargets.some(p=>Math.hypot(e.x-p.x,e.y-p.y)<.09))e.attackWindupUntil=now+.2;
 }
 const attacking=e.type==='walker'?now<(e.attackActiveUntil||0):e.mode==='lunging';
 if(attacking)for(const p of targets){if(Math.abs(e.x-p.x)>ENEMY_RADIUS+.0175||Math.abs(e.y-p.y)>ENEMY_RADIUS+.0175||Math.hypot(e.x-p.x,e.y-p.y)>ENEMY_RADIUS+.0175)continue;if(guarded(run,p))continue;if(p.shielding&&p.shield>0){if(now<(p.invulnerableUntil||0))continue;p.blockUntil=now+.16;if(p.color==='coral'&&now-(p.shieldRaisedAt||0)<=.3){e.hp=Math.max(0,e.hp-2);e.vx*=-1;e.vy*=-1}p.shield=Math.max(0,p.shield-ENEMY_DAMAGE);p.invulnerableUntil=now+HIT_COOLDOWN;if(!p.shield){p.shielding=false;if(p.color==='lime')jokerGambit(run,p,random);else p.stunUntil=now+5}continue}if(now<(p.invulnerableUntil||0))continue;p.hp=Math.max(0,p.hp-ENEMY_DAMAGE);p.reviving=null;p.reviveInterruptedUntil=now+HIT_COOLDOWN;p.invulnerableUntil=now+HIT_COOLDOWN;p.hurtUntil=now+.22;if(p.hp===0)down(p)}}run.failed=run.players.length>0&&run.players.every(p=>p.hp<=0)}
