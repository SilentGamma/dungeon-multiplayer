import assert from 'node:assert/strict';
import {createRun} from '../dist/dungeon.mjs';
import {spawnEnemies,stepCombat} from '../dist/combat.mjs';
import {ENEMIES,enemyHealthMultiplier,scaledEnemyHealth,turnFlapper} from '../dist/enemies.mjs';
for(let size=1;size<=8;size++){
 assert(Math.abs(enemyHealthMultiplier(size)-(1+.3*Math.floor(size/2)))<1e-10);
 for(const [type,spec] of Object.entries(ENEMIES)){assert.equal(scaledEnemyHealth(type,size),Math.ceil(spec.hp*(1+.3*Math.floor(size/2))));}
 const players=Array.from({length:size},(_,i)=>({id:'p'+i,name:'P'+i,color:'coral'}));const run=createRun(players,Math.random,5);run.keyRooms=[];run.keyItems=[];run.collectedKeys=0;run.mapRewardRoom=null;run.edges=Array.from({length:49},()=>[]);run.edges[15]=[14];run.enemyRooms=Array(49).fill(false);run.enemyRooms[15]=true;run.startRoom=14;run.goal=0;run.obstacles=[];
 const enemies=spawnEnemies(run,()=>.5,15,14);assert(new Set(enemies.map(e=>e.spawnSlot)).size>=2&&new Set(enemies.map(e=>e.spawnSlot)).size<=5);for(const e of enemies){assert.equal(e.hp,scaledEnemyHealth(e.type,size));assert.equal(e.maxHp,e.hp);assert.equal(ENEMIES[e.type].damage,{walker:3,sleeper:4,flapper:2,creeper:5}[e.type])}
 run.players.at(-1).deceased=true;for(const e of spawnEnemies(run,()=>.5,15,14))assert.equal(e.hp,scaledEnemyHealth(e.type,size),'difficulty stays fixed for the current dungeon');
}
const f={vx:1,vy:0,nextDirectionAt:1,directionStep:0};turnFlapper(f,.99);assert.equal(f.vx,1);let forward=0,left=0,right=0;for(let i=1;i<=10;i++){const old={x:f.vx,y:f.vy};turnFlapper(f,i);const dot=old.x*f.vx+old.y*f.vy,cross=old.x*f.vy-old.y*f.vx;if(dot===1)forward++;else{assert.equal(dot,0,'turn is exactly 90 degrees');cross>0?left++:right++}assert.equal(Math.hypot(f.vx,f.vy),1)}assert.equal(forward,6);assert.equal(left,2);assert.equal(right,2);
const repeat={vx:1,vy:0,nextDirectionAt:1,directionStep:0};for(let i=1;i<=10;i++)turnFlapper(repeat,i);assert.equal(repeat.vx,f.vx);assert.equal(repeat.vy,f.vy,'direction sequence is deterministic');const before=repeat.directionStep;turnFlapper(repeat,100);assert.equal(repeat.directionStep,before+1,'a delayed tick never queues old turns');
console.log('PASS: additive per-pair enemy HP, ceiling health, unchanged damage and counts, and deterministic forward-biased 90-degree Flapper turns');
