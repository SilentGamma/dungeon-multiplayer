import {SIZE} from './world.mjs';
export function keyPending(run,room){const index=run.keyRooms?.indexOf(room)??-1;return index>=0&&!((run.collectedKeys||0)&(1<<index))}
export function mapReady(run){return run.kind!=='boss'&&run.mapRoom>=0&&(run.mapRewardRoom==null||!keyPending(run,run.mapRewardRoom))}
export function collectKey(run,p){
 if(p.hp<=0||p.arrived||p.deceased||p.throwing||p.grabbedBy)return false;
 const room=Math.floor(p.y)*SIZE+Math.floor(p.x),index=run.keyRooms?.indexOf(room)??-1;
 if(index<0||!keyPending(run,room))return false;const key=run.keyItems[index];
 if(Math.hypot(p.x-key.x,p.y-key.y)>.075)return false;
 run.collectedKeys=(run.collectedKeys||0)|(1<<index);
 if(run.lockedRooms&&!run.enemies?.some(e=>e.room===room&&e.hp>0))run.lockedRooms[room]=false;
 return true;
}
