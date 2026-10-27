import {damagePlayer,enterRoom} from './combat.mjs';
import {WIDTH,roleFor} from './roles.mjs';
const roomOf=p=>Math.floor(p.y)*5+Math.floor(p.x);
export function beginGrapple(run,p){
 const now=run.time||0;if(now<(p.nextAttack||0)||p.grappleTarget)return false;
 const targets=[...(run.enemies||[]).filter(e=>e.hp>0),...run.players.filter(q=>q.id!==p.id&&!q.arrived)].filter(q=>!q.grabbedBy&&!q.throwing&&roomOf(q)===roomOf(p)&&Math.hypot(q.x-p.x,q.y-p.y)<=WIDTH*1.5).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
 const target=targets[0];if(!target)return false;p.grappleTarget=target.id;target.grabbedBy=p.id;target.holding=false;target.shielding=false;target.reviving=null;target.reviveProgress=0;return true;
}
export function grapple(run,p){
 const now=run.time||0;if(!p.grappleTarget&&!beginGrapple(run,p)){p.nextAttack=now+.2;return false;}
 const target=[...run.players,...run.enemies].find(q=>q.id===p.grappleTarget);p.grappleTarget=null;if(!target)return false;
 p.nextAttack=now+.2;target.grabbedBy=null;const a=p.angle||0;target.throwing={room:roomOf(target),vx:Math.cos(a)*12*WIDTH,vy:Math.sin(a)*12*WIDTH,contact:{},from:p.id};if(target.hp>0)target.stunUntil=now+1.5;return true;
}
export function updateGrapples(run){
 const all=[...run.players,...run.enemies];for(const target of all){if(!target.grabbedBy)continue;const holder=run.players.find(p=>p.id===target.grabbedBy);if(!holder||holder.hp<=0||holder.arrived||!holder.holding){target.grabbedBy=null;if(holder)holder.grappleTarget=null;continue}const cx=Math.floor(holder.x),cy=Math.floor(holder.y);target.x=Math.max(cx+.02,Math.min(cx+.98,holder.x+Math.cos(holder.angle)*WIDTH));target.y=Math.max(cy+.02,Math.min(cy+.98,holder.y+Math.sin(holder.angle)*WIDTH));target.reviveProgress=0}
}
export function updateThrows(run,dt){
 const now=run.time||0,entities=[...run.players,...run.enemies];
 for(const q of entities){const t=q.throwing;if(!t||q.active===false)continue;let speed=Math.hypot(t.vx,t.vy),next=Math.max(0,speed-6*WIDTH*dt);if(!speed||!next){q.throwing=null;if(q.hp<=0){q.vx=0;q.vy=0}else if('color' in q&&speed>0){const s=roleFor(q.color).speed*WIDTH;q.vx=-t.vx/speed*s;q.vy=-t.vy/speed*s}continue}t.vx*=next/speed;t.vy*=next/speed;q.x+=t.vx*dt;q.y+=t.vy*dt;const room=t.room,cx=room%5,cy=Math.floor(room/5),radius=.02;let hit=false;
 const canCross=(dest,pos)=>!q.type&&!run.lockedRooms?.[room]&&dest>=0&&dest<25&&run.edges[room]?.includes(dest)&&(run.doors?.[`${Math.min(room,dest)}:${Math.max(room,dest)}`]||[[.34,.66]]).some(([lo,hi])=>pos>lo+radius&&pos<hi-radius);
 const xdest=q.x<cx+radius?room-1:room+1,xd=q.x<cx+radius?cx>0:cx<4;if((q.x<cx+radius||q.x>cx+1-radius)&&!(xd&&canCross(xdest,q.y-cy))){q.x=Math.max(cx+radius,Math.min(cx+1-radius,q.x));t.vx=-t.vx*.75;t.vy*=.75;hit=true}
 const ydest=q.y<cy+radius?room-5:room+5,yd=q.y<cy+radius?cy>0:cy<4;if((q.y<cy+radius||q.y>cy+1-radius)&&!(yd&&canCross(yd,q.x-cx))){q.y=Math.max(cy+radius,Math.min(cy+1-radius,q.y));t.vy=-t.vy*.75;t.vx*=.75;hit=true}if(!q.type){const newRoom=roomOf(q);if(newRoom!==room)enterRoom(run,room,newRoom);t.room=newRoom}
 if(hit&&q.type)q.hp=Math.max(0,q.hp-5);
 for(const other of entities){if(other===q||other.arrived||other.hp<=0)continue;const touching=Math.abs(q.x-other.x)<WIDTH*1.2&&Math.abs(q.y-other.y)<WIDTH*1.2&&Math.hypot(q.x-other.x,q.y-other.y)<WIDTH*1.2,was=t.contact[other.id];t.contact[other.id]=touching;if(touching&&!was){if(other.type)other.hp=Math.max(0,other.hp-5);else if(!other.throwing)damagePlayer(run,other,5);if(q.type)q.hp=Math.max(0,q.hp-5);t.vx*=-.75;t.vy*=-.75}}
 }
}
