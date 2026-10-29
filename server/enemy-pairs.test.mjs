import assert from 'node:assert/strict';
import {generateDungeon,routeToGoal,SIZE} from '../dist/dungeon.mjs';
import {spawnEnemies,enterRoom,updateRoomLocks,removeDefeatedEnemies} from '../dist/combat.mjs';
import {passable} from '../dist/doors.mjs';
import {ENEMIES,turnFlapper,FLAPPER_TURN_INTERVAL} from '../dist/enemies.mjs';
import {stepWarden} from '../dist/warden.mjs';
import {createRun} from '../dist/dungeon.mjs';
const fixture=()=>({round:3,teamSize:2,time:10,startRoom:14,goal:0,players:[{id:'p',hp:12,x:.5,y:2.5}],enemies:[],obstacles:[],edges:Array.from({length:49},(_,i)=>i===15?[14]:i===14?[15]:[]),enemyRooms:Array.from({length:49},(_,i)=>i===15),lockedRooms:Array(49).fill(false),spawnedEnemyRooms:Array(49).fill(false)});
for(const slots of [2,5]){
 const r=fixture();let first=true;const random=()=>{if(first){first=false;return slots===5?.99:.5}return .5};
 assert(enterRoom(r,14,15,random));assert.equal(r.enemies.length,slots*2);assert.equal(new Set(r.enemies.map(e=>e.id)).size,slots*2);assert.equal(new Set(r.enemies.map(e=>e.spawnSlot)).size,slots);
 for(let slot=0;slot<slots;slot++){const pair=r.enemies.filter(e=>e.spawnSlot===slot);assert.equal(pair.length,2);assert(pair.every(e=>e.type==='flapper'&&e.hp===7&&e.nextDirectionAt===11));}
 for(const e of r.enemies.slice(0,-1))e.hp=0;removeDefeatedEnemies(r);updateRoomLocks(r);assert(r.lockedRooms[15],'one remaining pair member keeps the room locked');r.enemies[0].hp=0;removeDefeatedEnemies(r);updateRoomLocks(r);assert(!r.lockedRooms[15]);
}
assert.equal(FLAPPER_TURN_INTERVAL,1);const f={vx:1,vy:0,nextDirectionAt:1,directionStep:2};turnFlapper(f,.99);assert.equal(f.vx,1);turnFlapper(f,1);assert(Math.abs(f.vx)<1e-12);assert.equal(f.vy,1);assert.equal(f.nextDirectionAt,2);
assert.equal(ENEMIES.creeper.damage,7);assert(Math.abs(ENEMIES.creeper.radius-.026*1.5*1.2)<1e-12);
// Prove the final approach actually spawns and blocks the goal, not only its map flag.
let seed=20261029;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let round=1;round<=5;round++)for(let sample=0;sample<1000;sample++){
 const d=generateDungeon(random,round),path=routeToGoal(d,d.startRoom),final=path.at(-2),from=path.at(-3);
 assert(d.enemyRooms[final]);assert(!d.enemyRooms[d.goal]);assert.equal(d.edges[d.goal].length,1);
 const run={...d,round,time:0,teamSize:1,players:[{id:'p',hp:12,x:d.startRoom%SIZE+.5,y:Math.floor(d.startRoom/SIZE)+.5}],enemies:[],lockedRooms:Array(49).fill(false),spawnedEnemyRooms:Array(49).fill(false)};
 assert(enterRoom(run,from,final,random));assert(run.enemies.length>0);const key=`${Math.min(final,d.goal)}:${Math.max(final,d.goal)}`,gap=d.doors[key][0];assert(!passable(run,final,d.goal,(gap[0]+gap[1])/2));
}
const boss=createRun([{id:'p',name:'P',color:'coral'}],Math.random,6);Object.assign(boss.players[0],{x:1.5,y:4.8});stepWarden(boss,0);boss.time=15;stepWarden(boss,0);assert.equal(boss.enemies.filter(e=>e.type==='flapper').length,2,'Warden maintains its separately specified two-minion wave');assert(boss.enemies.filter(e=>e.type==='flapper').every(e=>e.nextDirectionAt===16));
console.log('PASS: Flapper pairs share 2–5 slots, individual HP and unique IDs, one-second turns, larger 7-damage Creepers, and 5,000 mandatory final encounters');
