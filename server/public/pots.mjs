import {placeGridPots,portPoint} from './room-blueprints.mjs';
import {dropPotLoot} from './loot.mjs';
import {emitAttackSound} from './audio-events.mjs';
import {SIZE,THROW_SPEED} from './world.mjs';
import {roomBounds,arenaRoom,sameArea} from './arena.mjs';
export const POT_RADIUS=.032;
export const canThrowPot=player=>player?.color==='teal'||player?.color==='lime';
export function generatePots(run,random=Math.random){
 const pots=[];let arenaDone=false;
 for(let room=0;room<run.edges.length;room++){
  // The shared starting room stays empty, regardless of player count.
  if(room===run.startRoom||room===run.goal||!run.edges[room].length)continue;
  if(arenaRoom(run,room)){if(arenaDone)continue;arenaDone=true}
  const bounds=roomBounds(run,room),clusters=Math.floor(random()*4),avoid=[...run.players.map(p=>({...p,radius:.128})),...(run.keyItems||[]).map(k=>({...k,radius:.098})),...Object.values(run.roomLayouts||{}).flatMap(b=>b.walkers||[]).map(p=>({...p,radius:.05})),...(run.mapItem?[{...run.mapItem,radius:.198}]:[]),...[run.goal,run.mapItem?-1:run.mapRoom].filter(r=>r>=0).map(r=>({x:r%SIZE+.5,y:Math.floor(r/SIZE)+.5,radius:.198}))];
  const doors=[];for(const n of run.edges[room]){const side=n===room-SIZE?'N':n===room+1?'E':n===room+SIZE?'S':'W',key=`${Math.min(room,n)}:${Math.max(room,n)}`;for(const [lo,hi] of run.doors?.[key]||[[.34,.66]]){const p=portPoint([side,(lo+hi)/2*9-.5]);doors.push({x:bounds.x+p.x*bounds.width,y:bounds.y+p.y*bounds.height})}}
  const placed=placeGridPots({bounds,obstacles:run.obstacles||[],avoid,doors,existing:pots,clusters,radius:POT_RADIUS,random,room,idPrefix:'pot'});for(const pot of placed)pot.room=Math.floor(pot.y)*SIZE+Math.floor(pot.x);pots.push(...placed);
 }
 return pots;
}
export function potsInArea(run,p){const room=Math.floor(p.y)*SIZE+Math.floor(p.x);return (run.pots||[]).filter(o=>o.hp>0&&(sameArea(run,o,p)||run.edges[room]?.includes(o.room)))}
export function launchPot(run,pot,source,angle){if(!canThrowPot(source)||pot.hp<=0||pot.grabbedBy)return false;pot.angle=angle;pot.throwing={room:pot.room,vx:Math.cos(angle)*THROW_SPEED,vy:Math.sin(angle)*THROW_SPEED,contact:{},from:source.id};return true}
export function removeBrokenPots(run,random=Math.random){if(!run.pots?.some(p=>p.hp<=0))return;const broken=run.pots.filter(p=>p.hp<=0),ids=new Set(broken.map(p=>p.id));for(const p of broken){emitAttackSound(run,p,'pot-break');dropPotLoot(run,p,random)}run.pots=run.pots.filter(p=>p.hp>0);for(const player of run.players)if(ids.has(player.grappleTarget))player.grappleTarget=null}
