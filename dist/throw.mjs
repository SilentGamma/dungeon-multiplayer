import {roomBounds,sameArea,inArena,tileOf} from './arena.mjs';
import {enemyRadius} from './enemies.mjs';
import {resolveWalls,wallBlocksLine} from './obstacles.mjs';
import {SIZE,PLAYER_RADIUS,SPEED_MULTIPLIER} from './world.mjs';
import {damagePlayer,enterRoom,enemiesInRoom,SHIELD_RADIUS} from './combat.mjs';
import {WIDTH,roleFor} from './roles.mjs';
// Effective launch: .5 room units/s, decelerating to rest after 2 s (~.5 room travel).
export const THROW_SPEED=.625*SPEED_MULTIPLIER,THROW_DECELERATION=.3125*SPEED_MULTIPLIER;
const roomOf=p=>Math.floor(p.y)*SIZE+Math.floor(p.x);
export function beginGrapple(run,p){
 const now=run.time||0;if(p.throwing||p.grabbedBy||now<(p.stunUntil||0)||now<(p.nextAttack||0)||p.grappleTarget)return false;
 const targets=[...enemiesInRoom(run,roomOf(p)).filter(e=>e.hp>0),...run.players.filter(q=>q.id!==p.id&&!q.arrived&&!q.deceased)].filter(q=>!q.grabbedBy&&!q.throwing&&!wallBlocksLine(run,p,q)&&sameArea(run,q,p)&&Math.hypot(q.x-p.x,q.y-p.y)<=Math.max(WIDTH*1.5,(p.wrestlerState==='lunging'?SHIELD_RADIUS:PLAYER_RADIUS)+(q.type?enemyRadius(q):PLAYER_RADIUS))).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
 const target=targets[0];if(!target)return false;p.grappleTarget=target.id;target.grabbedBy=p.id;target.holding=false;target.usingAttack=false;target.attackUntil=0;target.wrestlerState=null;target.shielding=false;target.reviving=null;target.reviveProgress=0;return true;
}
// Wrestler charges in the travel direction and catches on contact.
export function startWrestler(run,p){
 const now=run.time||0;if(p.throwing||p.grabbedBy||now<(p.stunUntil||0)||now<(p.nextAttack||0)||p.wrestlerState||!(p.shield>0))return false;
 p.wrestlerState='lunging';p.wrestlerUntil=now+.32;p.wrestlerReleased=false;p.wrestlerCancel=false;p.wrestlerAngle=(p.vx||p.vy)?Math.atan2(p.vy,p.vx):(p.angle||0);p.angle=p.wrestlerAngle;
 p.holding=true;p.usingAttack=true;p.shielding=true;p.shieldRaisedAt=now;
 return true;
}
export function updateWrestler(run,p){
 const now=run.time||0;if(!p.wrestlerState)return false;
 if(p.wrestlerState==='lunging'){
  if(beginGrapple(run,p)){p.wrestlerState='orbit';p.wrestlerOrbitStarted=now;p.vx=0;p.vy=0;return true}
  if(now>=p.wrestlerUntil){p.wrestlerState=null;p.usingAttack=false;p.holding=false;p.shielding=false;p.vx=0;p.vy=0;p.nextAttack=now+.2;return false}
  p.vx=Math.cos(p.wrestlerAngle);p.vy=Math.sin(p.wrestlerAngle);return true;
 }
 if(p.wrestlerState==='orbit'){
  const target=[...run.players,...run.enemies].find(q=>q.id===p.grappleTarget);
  if(!target||target.hp<=0&&target.type){p.grappleTarget=null;p.wrestlerState=null;p.holding=false;p.usingAttack=false;p.shielding=false;p.nextAttack=now+.2;return false}
  if(p.wrestlerReleased&&now>=p.wrestlerOrbitStarted+.35){p.angle=p.wrestlerAngle;if(p.wrestlerCancel){target.grabbedBy=null;p.grappleTarget=null;p.nextAttack=now+.2}else grapple(run,p);p.wrestlerState=null;p.holding=false;p.usingAttack=false;p.shielding=false;p.vx=Math.cos(p.angle)*roleFor(p.color).speed*WIDTH;p.vy=Math.sin(p.angle)*roleFor(p.color).speed*WIDTH;return false}
  return true;
 }
 return false;
}
export function grapple(run,p){
 const now=run.time||0;if(!p.grappleTarget&&!beginGrapple(run,p)){p.nextAttack=now+.2;return false;}
 const target=[...run.players,...run.enemies].find(q=>q.id===p.grappleTarget);p.grappleTarget=null;if(!target)return false;
 p.nextAttack=now+.2;target.grabbedBy=null;target.holding=false;target.usingAttack=false;target.attackUntil=0;target.shielding=false;target.reviving=null;const a=p.wrestlerState==='orbit'?p.wrestlerAngle+(now-p.wrestlerOrbitStarted)*8*SPEED_MULTIPLIER+Math.PI/2:(p.angle||0);target.angle=a;target.throwing={room:roomOf(target),vx:Math.cos(a)*THROW_SPEED,vy:Math.sin(a)*THROW_SPEED,contact:{},from:p.id};if(target.hp>0)target.stunUntil=now+1.5;return true;
}
export function updateGrapples(run){
 const all=[...run.players,...run.enemies];for(const target of all){if(!target.grabbedBy)continue;const holder=run.players.find(p=>p.id===target.grabbedBy);if(!holder||holder.hp<=0||holder.arrived||!holder.holding){target.grabbedBy=null;if(holder)holder.grappleTarget=null;continue}const oldTargetX=target.x,oldTargetY=target.y,bounds=roomBounds(run,roomOf(holder)),cx=bounds.x,cy=bounds.y;const orbit=holder.wrestlerState==='orbit'?(run.time-holder.wrestlerOrbitStarted)*8*SPEED_MULTIPLIER+holder.wrestlerAngle:holder.angle;const radius=target.type?enemyRadius(target):PLAYER_RADIUS,distance=Math.max(WIDTH*1.5,PLAYER_RADIUS+radius+.005);target.angle=orbit+Math.PI/2;target.x=Math.max(cx+radius,Math.min(cx+bounds.width-radius,holder.x+Math.cos(orbit)*distance));target.y=Math.max(cy+radius,Math.min(cy+bounds.height-radius,holder.y+Math.sin(orbit)*distance));resolveWalls(run,target,oldTargetX,oldTargetY,target.type ? enemyRadius(target) : PLAYER_RADIUS);target.reviveProgress=0}
}
export function updateThrows(run,dt){
 const now=run.time||0,entities=[...run.players,...run.enemies];
 for(const q of entities){const t=q.throwing;if(!t||q.active===false)continue;let speed=Math.hypot(t.vx,t.vy),next=Math.max(0,speed-THROW_DECELERATION*dt);if(!speed||!next){q.throwing=null;if(q.type){q.attackWindupUntil=0;q.attackActiveUntil=0;q.nextContactAttack=now+.3;q.nextDirectionAt=now+2;q.slamWindupUntil=0;q.slamUntil=0;q.nextSlam=now+3;if(q.type==='creeper')q.mode='walking';if(q.type==='sleeper'){q.mode='resting';q.nextLunge=now+2;q.lungeUntil=0}}if(q.hp<=0){q.vx=0;q.vy=0}else if('color' in q&&speed>0){const s=roleFor(q.color).speed*WIDTH;q.vx=-t.vx/speed*s;q.vy=-t.vy/speed*s}continue}t.vx*=next/speed;t.vy*=next/speed;const oldX=q.x,oldY=q.y;q.x+=t.vx*dt;q.y+=t.vy*dt;const room=t.room,bounds=roomBounds(run,room),cx=bounds.x,cy=bounds.y,radius=q.type ? enemyRadius(q) : PLAYER_RADIUS;let hit=false;
 const canCross=(dest,pos)=>!q.type&&!run.lockedRooms?.[room]&&dest>=0&&dest<SIZE*SIZE&&run.edges[room]?.includes(dest)&&(run.doors?.[`${Math.min(room,dest)}:${Math.max(room,dest)}`]||[[.34,.66]]).some(([lo,hi])=>pos>lo+radius&&pos<hi-radius);
 const xdest=q.x<cx+radius?room-1:room+1,xd=q.x<cx+radius?cx>0:cx<SIZE-1;if((q.x<cx+radius||q.x>cx+bounds.width-radius)&&!(xd&&canCross(xdest,q.y-cy))){q.x=Math.max(cx+radius,Math.min(cx+bounds.width-radius,q.x));t.vx=-t.vx*.75;t.vy*=.75;hit=true}
 const ydest=q.y<cy+radius?room-SIZE:room+SIZE,yd=q.y<cy+radius?cy>0:cy<SIZE-1;if((q.y<cy+radius||q.y>cy+bounds.height-radius)&&!(yd&&canCross(yd,q.x-cx))){q.y=Math.max(cy+radius,Math.min(cy+bounds.height-radius,q.y));t.vy=-t.vy*.75;t.vx*=.75;hit=true}if(!q.type){const newRoom=roomOf(q);if(newRoom!==room)enterRoom(run,room,newRoom);t.room=newRoom}
 if(q.type&&inArena(run,q))q.room=tileOf(q);
 const obstacleHit=resolveWalls(run,q,oldX,oldY,radius);if(obstacleHit.xHit){t.vx=-t.vx*.75;t.vy*=.75;hit=true}if(obstacleHit.yHit){t.vy=-t.vy*.75;t.vx*=.75;hit=true}if(hit&&q.type){q.hp=Math.max(0,q.hp-5);q.hitUntil=now+.2;}
 for(const other of entities){if(other===q||other.id===t.from||other.arrived||other.hp<=0||!sameArea(run,other,q))continue;const reach=other.shielding&&other.shield>0?SHIELD_RADIUS+radius:(other.type ? enemyRadius(other) : PLAYER_RADIUS)+radius;const touching=Math.abs(q.x-other.x)<reach&&Math.abs(q.y-other.y)<reach&&Math.hypot(q.x-other.x,q.y-other.y)<reach&&!wallBlocksLine(run,q,other),was=t.contact[other.id];t.contact[other.id]=touching;if(touching&&!was){if(other.type){other.hp=Math.max(0,other.hp-5);other.hitUntil=now+.2;}else if(!other.throwing)damagePlayer(run,other,5);if(q.type){q.hp=Math.max(0,q.hp-5);q.hitUntil=now+.2;}t.vx*=-.75;t.vy*=-.75}}
 }
}
