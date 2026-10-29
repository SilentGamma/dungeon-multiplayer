import assert from 'node:assert/strict';
import {createRun,routeToGoal,neighbors,navigationTarget,step,SIZE,MIN_PATH_ROOMS} from '../dist/dungeon.mjs';
for(let i=0;i<300;i++){
 const run=createRun([{id:'a',name:'A',color:'coral'},{id:'b',name:'B',color:'blue'}],Math.random,i%5+1);
 const path=routeToGoal(run,run.startRoom);
 assert(path.length>=MIN_PATH_ROOMS[i%5]&&path.length<=MIN_PATH_ROOMS[i%5]+2,'route follows the round minimum with at most two extra rooms');assert.equal(path.at(-1),run.goal);
 assert(run.enemyRooms[path.at(-2)],'last room before goal is always an encounter');assert(!run.enemyRooms[run.goal],'goal stays safe');
 assert(Math.floor(run.goal/SIZE)<SIZE-1,'goal is not on the starting row');
 for(const p of run.players)assert.equal(Math.floor(p.y)*SIZE+Math.floor(p.x),run.startRoom,'players start together');
 const used=run.edges.map((edges,id)=>edges.length?id:-1).filter(id=>id>=0);
 assert(used.length>=path.length+3,'at least three rooms branch off the main route');
 const pathSet=new Set(path),side=used.filter(id=>!pathSet.has(id));
 assert(side.every(id=>run.edges[id].length===1),'side rooms are dead ends');
 for(const room of used){for(const next of run.edges[room]){assert(neighbors(room).includes(next));assert(run.edges[next].includes(room));assert(run.doors[`${Math.min(room,next)}:${Math.max(room,next)}`]?.length)}}
 assert(routeToGoal(run,run.mapRoom).length>0,'map room is reachable');
 run.mapCollected=true;const guide=navigationTarget(run,run.players[0]);assert.equal(guide.nextRoom,path[1]);
}
// Rooms beyond the old 5x5 boundary must permit movement in both axes.
for(const axis of ['x','y']){
 const r=createRun([{id:'p',name:'P',color:'coral'}]);const p=r.players[0];
 r.keyRooms=[];r.keyItems=[];r.collectedKeys=0;r.mapRewardRoom=null;r.edges=Array.from({length:SIZE*SIZE},()=>[]);r.lockedRooms=Array(SIZE*SIZE).fill(false);r.spawnedEnemyRooms=Array(SIZE*SIZE).fill(false);r.enemies=[];r.goal=0;r.mapRoom=1;
 p.x=axis==='x'?4.985:6.5;p.y=axis==='x'?6.5:4.985;p.vx=axis==='x'?.28:0;p.vy=axis==='y'?.28:0;
 const room=Math.floor(p.y)*SIZE+Math.floor(p.x),next=room+(axis==='x'?1:SIZE);r.edges[room].push(next);r.edges[next].push(room);r.doors={[`${room}:${next}`]:[[.2,.8]]};
 for(let i=0;i<15&&Math.floor(p[axis])===4;i++)step(r,1/60);
 assert.equal(Math.floor(p[axis]),5,`player can cross ${axis} beyond original bounds`);
}
console.log('PASS: 300 branching dungeons, safe common start, reachable goal and map, doors and side rooms');
