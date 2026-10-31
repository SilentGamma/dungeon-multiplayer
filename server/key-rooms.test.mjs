import assert from 'node:assert/strict';
import {generateDungeon,createRun,routeToGoal,distances,collectMap,SIZE} from '../dist/dungeon.mjs';
import {generateRoomLayouts} from './public/room-blueprints.mjs';
import {keyPending,mapReady,collectKey} from '../dist/keys.mjs';
import {enterRoom,updateRoomLocks} from '../dist/combat.mjs';
import {passable} from '../dist/doors.mjs';
import {touchesSquare} from '../dist/obstacles.mjs';
import {PLAYER_RADIUS} from '../dist/world.mjs';
import {frameFor,fullFor} from './protocol.mjs';
import {applyFrame} from './public/wire.mjs';
import {createPrediction} from './public/prediction.mjs';
let seed=20261029;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
let side=0,main=0,rewards=0,ordinary=0;const counts={};
for(let round=1;round<=5;round++)for(let i=0;i<2000;i++){
 const d=generateDungeon(random,round),path=routeToGoal(d,d.startRoom),pathSet=new Set(path),dist=distances(d.edges,[d.startRoom]);
 assert(d.keyRooms.length>=1&&d.keyRooms.length<=3);assert.equal(new Set(d.keyRooms).size,d.keyRooms.length);assert.equal(d.keyItems.length,d.keyRooms.length);counts[d.keyRooms.length]=(counts[d.keyRooms.length]||0)+1;
 for(const key of d.keyItems){assert(key.room!==d.startRoom&&key.room!==d.goal);assert(!d.enemyRooms[key.room]);assert(d.edges[key.room].length);assert(!d.obstacles.some(o=>o.type==='wall'&&touchesSquare(key,PLAYER_RADIUS,o)));pathSet.has(key.room)?main++:side++}
 assert(d.enemyRooms[path.at(-2)],'mandatory final enemy chamber remains an enemy chamber');assert(!d.keyRooms.includes(path.at(-2)));
 if(d.mapRewardRoom!=null){rewards++;assert.equal(d.mapRoom,d.mapRewardRoom);assert(d.keyRooms.includes(d.mapRoom));assert(!mapReady(d));}else{ordinary++;assert(dist[d.mapRoom]>3);assert(mapReady(d))}
 const near=d.keyRooms.filter(room=>dist[room]<=3);if(near.length)assert(near.includes(d.mapRoom),'nearby key rooms supply the map reward');assert(d.mapRoom!==d.startRoom&&d.mapRoom!==d.goal);assert(Number.isFinite(dist[d.mapRoom]));
}
assert(side>main*2,'side paths are strongly favored');assert(rewards>0&&ordinary>0);assert(counts[1]&&counts[2]&&counts[3]);
// Locks survive the regular enemy-lock cleanup, then open for the whole team.
let r=createRun([{id:'p',name:'P',color:'coral'},{id:'q',name:'Q',color:'blue'}],random),room=r.keyRooms[0],key=r.keyItems[0],from=r.edges[room][0];
assert(enterRoom(r,from,room));assert(r.lockedRooms[room]);updateRoomLocks(r);assert(r.lockedRooms[room]);const gap=r.doors[`${Math.min(room,from)}:${Math.max(room,from)}`][0],mid=(gap[0]+gap[1])/2;assert(!passable(r,room,from,mid));assert(passable(r,from,room,mid));
const p=r.players[0];Object.assign(p,{x:key.x,y:key.y});assert(collectKey(r,p));assert(!keyPending(r,room));const guards=r.enemies.filter(e=>e.room===room&&e.hp>0);assert.equal(r.lockedRooms[room],guards.length>0);for(const e of guards)e.hp=0;updateRoomLocks(r);assert(!r.lockedRooms[room]);assert(passable(r,room,from,mid));assert(!collectKey(r,p),'key can only be collected once');assert(!enterRoom(r,from,room),'reentry does not relock a cleared key room');
// A reward map cannot be collected or rendered until its key is collected.
r=createRun([{id:'p',name:'P',color:'coral'}],random);room=r.keyRooms[0];key=r.keyItems[0];r.mapRoom=room;r.mapRewardRoom=room;r.mapItem=generateRoomLayouts(r).mapItem;const player=r.players[0];Object.assign(player,{x:room%SIZE+.5,y:Math.floor(room/SIZE)+.5});assert(!collectMap(r,player));assert(!r.mapCollected);Object.assign(player,{x:key.x,y:key.y});assert(!collectMap(r,player));assert(mapReady(r));assert(!r.mapCollected);Object.assign(player,{x:r.mapItem.x,y:r.mapItem.y});assert(collectMap(r,player));assert(r.mapCollected);assert(!collectMap(r,player),'one map pickup per dungeon');
// Key pickup state is authoritative and travels in compact frames.
const container={run:r,snapshot:()=>structuredClone({phase:'playing',run:r})};r.collectedKeys=0;r.mapCollected=false;const cache=new Map();let state=fullFor(container,player.id);r.collectedKeys=1;state=applyFrame(state,frameFor(container,player.id,cache));assert.equal(state.run.collectedKeys,1);assert(!keyPending(state.run,room));
// Predicted entry also locks a key room, preventing an early predicted escape.
r=createRun([{id:'p',name:'P',color:'coral'}],random);r.goal=0;r.obstacles=[{id:'wall',room:15,type:'wall',x:1.055,y:2.4,size:.2}];r.enemies=[];r.time=10;r.round=1;r.edges=Array.from({length:49},()=>[]);r.edges[14]=[15];r.edges[15]=[14,16];r.edges[16]=[15];r.doors={'14:15':[[.2,.8]],'15:16':[[.2,.8]]};r.keyRooms=[15];r.keyItems=[{room:15,x:1.5,y:2.25}];r.collectedKeys=0;r.enemyRooms=Array(49).fill(false);Object.assign(r.players[0],{x:.99,y:2.5,vx:.224,vy:0,awaitingLaunch:false});const pred=createPrediction('p');pred.latency(0);pred.set(r,0);assert(pred.sample(500).x>=1,'predicted key-room lock prevents bouncing back through the entry');assert(!r.lockedRooms[15],'prediction does not mutate authoritative locks');
const boss=createRun([{id:'b',name:'B',color:'coral'}],random,6);assert(!boss.keyRooms);assert(!mapReady(boss));
console.log('PASS: 10,000 key-room layouts, side-path bias, map distance/rewards, one map, shared locks, pickups, compact frames and predicted entry');console.log(JSON.stringify({side,main,rewards,ordinary,counts}));
