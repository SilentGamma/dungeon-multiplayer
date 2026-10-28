import assert from 'node:assert/strict';
import {Session} from './session.mjs';
import {createRun,step,applyInput,distances,SIZE} from '../dist/dungeon.mjs';
import {prepareRevives} from '../dist/revive.mjs';
import {grapple} from '../dist/throw.mjs';
for(let k=0;k<200;k++){
 const r=createRun([{id:'p',name:'P',color:'coral'}]);const encounters=r.enemyRooms.map((x,i)=>x?i:-1).filter(i=>i>=0);assert(encounters.length>0);assert(!r.enemyRooms[r.goal]);assert(!r.enemyRooms[r.startRoom]);
 for(const a of encounters){const d=distances(r.edges,[a]);for(const b of encounters)if(a!==b)assert(d[b]>=2,'encounters must have a safe room between them')}
}
const s=new Session({code:'1'});for(const id of ['a','b','c'])s.join({id,name:id});s.start('a');assert.equal(s.run.round,1);s.leave('b');
let old=s.run;old.players.find(p=>p.id==='a').arrived=true;const downed=old.players.find(p=>p.id==='c');downed.hp=0;downed.shield=0;downed.poisonUntil=100;old.enemies.push({id:'old',room:0,hp:0});s.tick(.02);
assert.equal(s.run.round,2);assert.notEqual(s.run,old);assert(!s.run.players.some(p=>p.id==='b'));assert(!s.players.some(p=>p.id==='b'));let restored=s.run.players.find(p=>p.id==='c');assert.equal(restored.hp,restored.maxHp);assert.equal(restored.shield,restored.maxShield);assert(!restored.poisonUntil);assert.equal(s.run.enemies.length,0);assert(!s.run.mapCollected);
assert(!s.input('a',{seq:1,round:1,holding:true,attack:false}),'old-round inputs cannot affect the new dungeon');assert(s.input('a',{seq:2,round:2,holding:true,attack:false}));
for(let round=2;round<=5;round++){for(const p of s.run.players)p.arrived=true;s.tick(.02);if(round<5){assert.equal(s.run.round,round+1);assert.equal(s.phase,'playing')}else{assert.equal(s.phase,'completed');assert.equal(s.endReason,'won');assert.equal(s.closed,false)}}
assert(s.leave('a'));assert.equal(s.phase,'completed');assert.equal(s.closed,false,'one player leaving after victory does not eject the others');assert(s.leave('c'));assert(s.closed,'the completed session is cleaned up after the last player leaves');
const r=createRun([{id:'a',name:'A',color:'coral'},{id:'b',name:'B',color:'blue'}]);let [a,b]=r.players;b.hp=0;a.x=b.x=1.5;a.y=b.y=2.5;a.vx=.28;a.vy=0;r.time=1;prepareRevives(r);assert.equal(a.reviving,b.id);b.reviveProgress=3;
assert(applyInput(r,'a',{seq:1,holding:true,attack:false}));assert(!a.reviving);step(r,1/60);assert.equal(b.reviveProgress,0);assert(a.holding);assert(applyInput(r,'a',{seq:2,holding:false,attack:false,angle:0}));for(let i=0;i<60;i++)step(r,1/60);assert(a.x>1.55,'player can move away from a revive');
const g=createRun([{id:'p',name:'P',color:'teal'}]);const p=g.players[0];g.time=2;p.wrestlerState='orbit';p.wrestlerAngle=.2;p.wrestlerOrbitStarted=1.9;p.grappleTarget='e';const e={id:'e',x:p.x+.05,y:p.y,hp:7,room:Math.floor(p.y)*SIZE+Math.floor(p.x),grabbedBy:'p'};g.enemies=[e];assert(grapple(g,p));const expected=.2+(2-1.9)*8*.8+Math.PI/2;assert(Math.abs(Math.atan2(e.throwing.vy,e.throwing.vx)-expected)<1e-8,'throw follows tangent of orbit');
console.log('PASS: spaced encounters, five lazy-generated rounds, restores, deceased exclusion, revive escape and orbit throw');
