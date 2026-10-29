import assert from 'node:assert/strict';
import {createRun,navigationTarget,collectMap,SIZE} from '../dist/dungeon.mjs';
import {keyVisible,keyPending} from '../dist/keys.mjs';
import {enterRoom,attack} from '../dist/combat.mjs';
import {POT_RADIUS,generatePots,launchPot,removeBrokenPots} from '../dist/pots.mjs';
import {grapple,updateThrows,startWrestler,updateWrestler,updateGrapples} from '../dist/throw.mjs';
import {frameFor,fullFor} from './protocol.mjs';
import {applyFrame} from './public/wire.mjs';
import {touchesSquare} from '../dist/obstacles.mjs';
let seed=2209;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
// Pots are separate props, not encounter slots, and spawn clear of protected areas.
for(let n=0;n<500;n++){
 const r=createRun([{id:'p',name:'P',color:'coral'}],random,n%5+1),counts=new Map();
 assert.notEqual(r.mapRoom,r.startRoom);assert(!r.enemyRooms[r.startRoom]);assert(!r.keyRooms.includes(r.startRoom));assert(!r.obstacles.some(o=>o.room===r.startRoom));
 for(const o of r.pots){assert.notEqual(o.room,r.startRoom);counts.set(o.room,(counts.get(o.room)||0)+1);assert(o.hp>0);assert(!r.players.some(p=>Math.hypot(p.x-o.x,p.y-o.y)<.16));assert(!r.obstacles.some(w=>touchesSquare(o,POT_RADIUS+.02,w)));assert(!r.keyItems.some(k=>Math.hypot(k.x-o.x,k.y-o.y)<.13));assert(![r.goal,r.mapRoom].some(room=>Math.hypot(room%SIZE+.5-o.x,Math.floor(room/SIZE)+.5-o.y)<.23))}
 assert([...counts.values()].every(count=>count<=4));assert(r.pots.length<=60);assert(!r.enemies.some(e=>e.kind==='pot'));
 const keyRoom=r.keyRooms[0];assert(!keyVisible(r,keyRoom));assert(keyPending(r,keyRoom));assert(enterRoom(r,r.edges[keyRoom][0],keyRoom));assert(keyVisible(r,keyRoom));
 r.mapCollected=true;const expected={x:r.goal%SIZE+.5,y:Math.floor(r.goal/SIZE)+.5};for(const p of [{hp:12,x:1.01,y:2.5},{hp:12,x:1.99,y:2.5},{hp:12,x:2.01,y:2.5}]){const target=navigationTarget(r,p);assert.equal(target.x,expected.x);assert.equal(target.y,expected.y);assert.equal(target.nextRoom,r.goal)}
}
// Boss-stage spawns obey the same empty-start-room rule.
for(let n=0;n<100;n++){const r=createRun([{id:'p',name:'P',color:'coral'}],random,6);assert(r.pots.every(o=>o.room!==r.startRoom));assert(r.enemies.every(e=>e.room!==r.startRoom));assert.equal(r.mapRoom,-1)}
function fixture(color='coral'){const r=createRun([{id:'p',name:'P',color}]);r.time=10;r.goal=0;r.obstacles=[];r.enemies=[];r.keyRooms=[];r.keyItems=[];r.pots=[];r.edges=Array.from({length:49},()=>[]);r.lockedRooms=Array(49).fill(false);const p=r.players[0];Object.assign(p,{x:1.2,y:2.5,angle:0,vx:0,vy:0,awaitingLaunch:false,invulnerableUntil:0});return [r,p]}
const pot=(id,x=1.25,y=2.5)=>({id,kind:'pot',room:15,x,y,hp:1,vx:0,vy:0});
let [r,p]=fixture();r.pots=[pot('pot')];assert(attack(r,p));assert.equal(r.pots[0].hp,1,'attacks launch rather than shatter pots');assert(r.pots[0].throwing);assert.equal(r.pots[0].throwing.from,p.id);
const heldHp=p.hp;updateThrows(r,.01);assert.equal(p.hp,heldHp,'throw owner cannot be hurt by their pot');
// Closest-target roles spend the hit on the pot, and props do not grant enemy-hit healing.
[r,p]=fixture('blue');r.pots=[pot('front',1.25)];r.enemies=[{id:'behind',type:'walker',room:15,x:1.4,y:2.5,hp:15}];assert(attack(r,p));assert(r.pots[0].throwing);assert.equal(r.enemies[0].hp,15);
[r,p]=fixture('purple');r.pots=[pot('heal-test',1.25)];r.players.push({...p,id:'ally',x:1.21,hp:1,maxHp:12});assert(attack(r,p));assert.equal(r.players[1].hp,1,'hitting a prop does not trigger enemy-hit healing');
// A pot stays intact when it runs out of momentum without any impact.
[r,p]=fixture();r.pots=[pot('rest',1.3)];launchPot(r,r.pots[0],p,0);for(let i=0;i<150;i++){r.time+=1/60;updateThrows(r,1/60)}assert.equal(r.pots[0].hp,1);assert(!r.pots[0].throwing);assert(r.pots[0].x>1.75);
// Wall and entity impacts break pots immediately and keep standard impact damage.
[r,p]=fixture();r.pots=[pot('wall',1.96)];launchPot(r,r.pots[0],p,0);updateThrows(r,.1);assert.equal(r.pots[0].hp,0);removeBrokenPots(r);assert.equal(r.pots.length,0);
[r,p]=fixture();r.pots=[pot('enemy',1.45)];r.enemies=[{id:'e',type:'walker',room:15,x:1.51,y:2.5,hp:15}];launchPot(r,r.pots[0],p,0);updateThrows(r,.05);assert.equal(r.pots[0].hp,0);assert.equal(r.enemies[0].hp,10);
[r,p]=fixture();const q={...p,id:'q',x:1.51,shielding:true,shield:1};r.players.push(q);r.pots=[pot('shield',1.4)];launchPot(r,r.pots[0],p,0);updateThrows(r,.05);assert.equal(r.pots[0].hp,0);assert.equal(q.shield,0);assert.equal(q.hp,q.maxHp,'shield absorbs pot impact without overflow');
[r,p]=fixture();r.pots=[pot('a',1.4),pot('b',1.47)];launchPot(r,r.pots[0],p,0);updateThrows(r,.05);assert(r.pots.every(o=>o.hp===0),'pots break against each other');
[r,p]=fixture();r.obstacles=[{id:'block',room:15,type:'wall',x:1.45,y:2.4,size:.2}];r.pots=[pot('obstacle',1.4)];launchPot(r,r.pots[0],p,0);updateThrows(r,.05);assert.equal(r.pots[0].hp,0,'obstacle walls also break thrown pots');
// Props can fly into another room without spawning its encounter or revealing its key.
[r,p]=fixture();r.edges[15]=[16];r.edges[16]=[15];r.doors={'15:16':[[.2,.8]]};r.enemyRooms[16]=true;r.keyRooms=[16];r.keyItems=[{room:16,x:2.5,y:2.25}];r.enteredKeyRooms=0;r.pots=[pot('door',1.98)];launchPot(r,r.pots[0],p,0);updateThrows(r,.1);assert(r.pots[0].x>2);assert.equal(r.pots[0].hp,1);assert.equal(r.enemies.length,0);assert(!r.spawnedEnemyRooms[16]);assert(!keyVisible(r,16));
// Wrestler catches, revolves and throws a pot using the same controls as an enemy.
[r,p]=fixture('teal');r.pots=[pot('grab',1.25)];p.vx=.2;assert(startWrestler(r,p));assert(updateWrestler(r,p));assert.equal(p.grappleTarget,'grab');updateGrapples(r);assert.equal(r.pots[0].grabbedBy,p.id);assert(grapple(r,p));assert(r.pots[0].throwing);assert(!r.pots[0].stunUntil);
// Compact prop frames preserve kind and movement; removed props disappear.
[r,p]=fixture();r.pots=[pot('network')];const container={run:r,snapshot:()=>structuredClone({phase:'playing',run:r})},cache=new Map();let state=fullFor(container,p.id);state=applyFrame(state,frameFor(container,p.id,cache));launchPot(r,r.pots[0],p,0);r.time+=.1;updateThrows(r,.1);let f=frameFor(container,p.id,cache);assert(f.pots[0].vx>0);state=applyFrame(state,f);assert.equal(state.run.pots[0].kind,'pot');r.pots=[];state=applyFrame(state,frameFor(container,p.id,cache));assert.equal(state.run.pots.length,0);
console.log('PASS: hidden keys until entry, direct goal compass, bounded clear pot spawns, attack/grab throws, impact-only breaking, owner immunity, shared shields and compact prop updates');
