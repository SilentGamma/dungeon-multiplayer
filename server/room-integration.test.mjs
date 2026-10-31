import assert from 'node:assert/strict';
import {createRun,SIZE} from '../dist/dungeon.mjs';
import {generateRoomLayouts,ROOM_BLUEPRINTS,orientBlueprint,circleTouchesBox} from '../dist/room-blueprints.mjs';
import {enterRoom,updateRoomLocks} from '../dist/combat.mjs';
import {collectKey} from '../dist/keys.mjs';
import {enemyRadius} from '../dist/enemies.mjs';
import {PLAYER_RADIUS} from '../dist/world.mjs';
let seed=9039;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const seen=new Set(),potPatterns=new Set();let openings=0,guards=0;
for(let i=0;i<1000;i++){
 const r=createRun([{id:'p',name:'P',color:'coral'}],random,i%5+1),doors=JSON.stringify(r.doors);
 const again=generateRoomLayouts(r);assert.equal(JSON.stringify(r.doors),doors,'shared column openings stay unchanged');assert.deepEqual(again.obstacles,r.obstacles);
 assert(r.mapItem?.room===r.mapRoom);assert(!r.obstacles.some(o=>circleTouchesBox(r.mapItem,.065,o)),'map pickup avoids walls and spikes');
 for(const [roomString,layout] of Object.entries(r.roomLayouts)){
  const room=Number(roomString),b=orientBlueprint(ROOM_BLUEPRINTS.find(b=>b.id===layout.id),layout.turns);seen.add(layout.id);
  assert.equal(b.kind,r.keyRooms.includes(room)?'key':'regular');assert.equal(r.edges[room].length,b.ports.length);
  const obstacles=r.obstacles.filter(o=>o.room===room);assert.equal(obstacles.length,b.walls.length+b.spikes.length);
  const blocked=new Set([...b.walls,...b.spikes].map(p=>p.join(','))),queue=[[0,0]],reachable=new Set(['0,0']);
  for(let k=0;k<queue.length;k++){const [x,y]=queue[k];for(const [a,c] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]])if(a>=0&&a<9&&c>=0&&c<9&&!blocked.has(`${a},${c}`)&&!reachable.has(`${a},${c}`)){reachable.add(`${a},${c}`);queue.push([a,c])}}
  const localCell=p=>`${Math.floor((p.x-room%SIZE)*9+1e-9)},${Math.floor((p.y-Math.floor(room/SIZE))*9+1e-9)}`;
  if(b.key){const key=r.keyItems.find(k=>k.room===room);assert(reachable.has(localCell(key)),'key has a safe route');assert(!obstacles.some(o=>circleTouchesBox(key,PLAYER_RADIUS,o)))}
  if(room===r.mapRoom)assert(reachable.has(localCell(r.mapItem)),'map has a safe route');
  for(const next of r.edges[room])for(const [lo,hi] of r.doors[`${Math.min(room,next)}:${Math.max(room,next)}`]){
   const t=(lo+hi)/2,x=room%SIZE,y=Math.floor(room/SIZE),p=next===room-SIZE?{x:x+t,y:y+.03}:next===room+1?{x:x+.97,y:y+t}:next===room+SIZE?{x:x+t,y:y+.97}:{x:x+.03,y:y+t};
   assert(!obstacles.some(o=>circleTouchesBox(p,PLAYER_RADIUS,o)));assert(reachable.has(localCell(p)),'every existing opening reaches safe floor');openings++;
  }
  for(const p of layout.walkers){assert(!obstacles.some(o=>circleTouchesBox(p,.026,o)));assert(!r.pots.some(o=>Math.hypot(o.x-p.x,o.y-p.y)<.082))}
 }
 // First-entry spawning uses the reviewed Walker positions and does not duplicate.
 for(const room of r.keyRooms){const expected=r.roomLayouts[room].walkers,from=r.edges[room][0];enterRoom(r,from,room,random);const actual=r.enemies.filter(e=>e.room===room);assert.equal(actual.length,expected.length);guards+=actual.length;enterRoom(r,from,room,random);assert.equal(r.enemies.filter(e=>e.room===room).length,actual.length);Object.assign(r.players[0],r.keyItems.find(k=>k.room===room));assert(collectKey(r,r.players[0]));updateRoomLocks(r);assert.equal(r.lockedRooms[room],actual.length>0);for(const e of actual)e.hp=0;updateRoomLocks(r);assert(!r.lockedRooms[room])}
 // Even dense wall layouts never accept an unsafe enemy-spawn retry.
 for(let room=0;room<r.edges.length;room++)if(r.enemyRooms[room]){enterRoom(r,r.edges[room][0],room,random);for(const e of r.enemies.filter(e=>e.room===room))assert(!r.obstacles.some(o=>o.room===room&&circleTouchesBox(e,enemyRadius(e)+.0149,o)))}
 potPatterns.add(r.pots.map(p=>`${p.room}:${p.potSlot}:${p.potCount}`).join('|'));
}
assert.equal(seen.size,8,'all eight approved templates appear in generated runs');assert(guards>0);assert(potPatterns.size>990,'pot layouts vary across runs');
console.log(`PASS: 1,000 integrated floors, all eight templates, ${openings} unchanged door openings, safe maps/keys/enemy spawns, ${guards} first-entry guards and random pot layouts`);
