import {SIZE,THROW_SPEED} from './world.mjs';
import {roomBounds,arenaRoom,sameArea} from './arena.mjs';
import {touchesSquare} from './obstacles.mjs';
export const POT_RADIUS=.032;
export function generatePots(run,random=Math.random){
 const pots=[];let arenaDone=false;
 for(let room=0;room<run.edges.length;room++){
  // The shared starting room stays empty, regardless of player count.
  if(room===run.startRoom||!run.edges[room].length)continue;
  if(arenaRoom(run,room)){if(arenaDone)continue;arenaDone=true}
  const bounds=roomBounds(run,room),count=Math.floor(random()*5);
  for(let i=0;i<count;i++)for(let attempt=0;attempt<50;attempt++){
   const x=bounds.x+.16+random()*(bounds.width-.32),y=bounds.y+.16+random()*(bounds.height-.32),point={x,y};
   if(run.players.some(p=>Math.hypot(p.x-x,p.y-y)<.16)||pots.some(p=>Math.hypot(p.x-x,p.y-y)<POT_RADIUS*3))continue;
   if((run.obstacles||[]).some(o=>touchesSquare(point,POT_RADIUS+.02,o)))continue;
   if((run.keyItems||[]).some(k=>Math.hypot(k.x-x,k.y-y)<.13))continue;
   if([run.goal,run.mapRoom].some(r=>r>=0&&Math.hypot(r%SIZE+.5-x,Math.floor(r/SIZE)+.5-y)<.23))continue;
   pots.push({id:`pot-${room}-${i}`,kind:'pot',room:Math.floor(y)*SIZE+Math.floor(x),x,y,hp:1,vx:0,vy:0});break;
  }
 }
 return pots;
}
export function potsInArea(run,p){const room=Math.floor(p.y)*SIZE+Math.floor(p.x);return (run.pots||[]).filter(o=>o.hp>0&&(sameArea(run,o,p)||run.edges[room]?.includes(o.room)))}
export function launchPot(run,pot,source,angle){if(pot.hp<=0||pot.grabbedBy)return false;pot.angle=angle;pot.throwing={room:pot.room,vx:Math.cos(angle)*THROW_SPEED,vy:Math.sin(angle)*THROW_SPEED,contact:{},from:source.id};return true}
export function removeBrokenPots(run){if(!run.pots?.some(p=>p.hp<=0))return;const broken=new Set(run.pots.filter(p=>p.hp<=0).map(p=>p.id));run.pots=run.pots.filter(p=>p.hp>0);for(const player of run.players)if(broken.has(player.grappleTarget))player.grappleTarget=null}
