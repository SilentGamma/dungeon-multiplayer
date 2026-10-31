import {startReadyParty} from './test-party.mjs';
import assert from 'node:assert/strict';
import {createRun,applyInput,step,SIZE} from '../dist/dungeon.mjs';
import {stepWarden} from '../dist/warden.mjs';
import {scaledEnemyHealth} from '../dist/enemies.mjs';
import {stepCombat} from '../dist/combat.mjs';
import {movePlayer} from '../dist/movement.mjs';
import {passable} from '../dist/doors.mjs';
import {Session} from './session.mjs';
import {frameFor,fullFor} from './protocol.mjs';
import {applyFrame} from './public/wire.mjs';
// The eight fixed octagon slots do not move when the party size changes.
let first;
for(let count=1;count<=8;count++){
 const r=createRun(Array.from({length:count},(_,i)=>({id:'p'+i,name:'P',color:'coral'})));const cx=r.startRoom%SIZE+.5,cy=Math.floor(r.startRoom/SIZE)+.5;
 for(let i=0;i<count;i++){const p=r.players[i],angle=-Math.PI/2+i*Math.PI/4;assert(Math.abs(p.x-cx-Math.cos(angle)*.14)<1e-9);assert(Math.abs(p.y-cy-Math.sin(angle)*.14)<1e-9);assert.equal(p.vx,0);assert.equal(p.vy,0)}
 const p=r.players[0],before={x:p.x,y:p.y};step(r,.1);assert.equal(p.x,before.x);assert.equal(p.y,before.y);assert(applyInput(r,p.id,{holding:true,attack:true,seq:1}));assert(!p.usingAttack,'first press is launch aiming for every role');step(r,.1);assert(applyInput(r,p.id,{holding:false,seq:2,angle:0}));assert(p.vx>0);assert(!p.awaitingLaunch);
}
function bossRun(size=1){return createRun(Array.from({length:size},(_,i)=>({id:'p'+i,name:'P',color:'coral'})),Math.random,6)}
const cancelled=createRun([{id:'cancel',name:'C',color:'teal'}]);applyInput(cancelled,'cancel',{seq:1,holding:true,attack:true});applyInput(cancelled,'cancel',{seq:2,holding:false,cancel:true});assert(cancelled.players[0].awaitingLaunch);assert.equal(cancelled.players[0].vx,0);
let r=bossRun(4),boss=r.enemies[0],p=r.players[0];assert.equal(r.kind,'boss');assert.equal(r.arena.width,4);assert.equal(r.arena.height,4);assert.equal(boss.hp,scaledEnemyHealth('warden',4));assert(boss.hp>50);assert.equal(boss.x,3);assert.equal(boss.y,3);assert(!r.bossActive);
Object.assign(p,{x:1.5,y:4.8,invulnerableUntil:0});stepWarden(r,0);assert(r.bossActive);assert(!passable(r,29,36,.5),'cannot escape to start');assert(passable(r,29,30,.01),'internal grid lines stay open even near tile corners');
r.time=14.99;stepWarden(r,0);assert.equal(r.enemies.filter(e=>e.type==='flapper').length,0);r.time=15;stepWarden(r,0);assert.equal(r.enemies.filter(e=>e.type==='flapper').length,4);
for(const t of [30,45,60,75]){r.time=t;stepWarden(r,0)}assert.equal(r.enemies.filter(e=>e.type==='flapper').length,6);
r.enemies.find(e=>e.type==='flapper').hp=0;r.time=90;stepWarden(r,0);assert.equal(r.enemies.filter(e=>e.type==='flapper'&&e.hp>0).length,6,'dead minions release a spawn slot');
// Four cardinal shots, then four diagonal shots; no queued burst after a delay.
r=bossRun();p=r.players[0];Object.assign(p,{x:1.5,y:4.8});stepWarden(r,0);r.time=8;stepWarden(r,0);assert.equal(r.projectiles.length,4);assert(r.projectiles.every(b=>b.vx===0||b.vy===0||Math.min(Math.abs(b.vx),Math.abs(b.vy))<1e-9));
r.projectiles=[];r.time=16;stepWarden(r,0);assert.equal(r.projectiles.length,4);assert(r.projectiles.every(b=>Math.abs(Math.abs(b.vx)-Math.abs(b.vy))<1e-9));r.time=100;stepWarden(r,0);assert(r.projectiles.length<=8,'missed attacks never accumulate a backlog');
// Shield interception, no overflow, and swept hits across a frame.
r=bossRun();p=r.players[0];Object.assign(p,{x:2.5,y:2.5,shielding:true,shield:1,invulnerableUntil:0});stepWarden(r,0);r.projectiles=[{id:'hit',x:2.3,y:2.5,vx:2,vy:0,expires:10}];const hp=p.hp;r.time=1;stepWarden(r,.2);assert.equal(p.hp,hp);assert.equal(p.shield,0);assert.equal(r.projectiles.length,0);
p.shielding=false;p.stunUntil=0;p.invulnerableUntil=0;r.projectiles=[{id:'hit2',x:2.3,y:2.5,vx:2,vy:0,expires:10}];stepWarden(r,.2);assert.equal(p.hp,hp-7);
// Enemies cross internal tile boundaries and remain confined to the 4x4 arena.
r=bossRun();p=r.players[0];Object.assign(p,{x:3,y:3.5});stepWarden(r,0);boss=r.enemies[0];Object.assign(boss,{x:2.99,y:3,vx:.048,vy:0,active:true,room:23});stepCombat(r,1,()=>.5);assert(boss.x>3,'boss crosses an internal tile line');assert.equal(boss.room,24);assert(boss.x<3.1,'arena room index must not simulate a boss more than once per tick');
Object.assign(boss,{x:4.99,y:3,vx:.048,vy:0,room:25});stepCombat(r,1,()=>.5);assert(boss.x<=4.9+1e-9);assert(boss.vx<0);
// Compact frames restore stable metadata and carry boss/projectile state.
r=bossRun();p=r.players[0];Object.assign(p,{x:3,y:3.5});r.bossActive=true;r.enemies[0].active=true;r.projectiles=[{id:'b',x:3,y:3,vx:.55,vy:0,expires:8}];const room={run:r,snapshot:()=>structuredClone({phase:'playing',run:r})},cache=new Map();let state=fullFor(room,p.id);state=applyFrame(state,frameFor(room,p.id,cache));r.time=.1;const frame=frameFor(room,p.id,cache);assert(!('name' in frame.players[0]));state=applyFrame(state,frame);assert.equal(state.run.players[0].name,'P');assert.equal(state.run.enemies[0].type,'warden');assert.equal(state.run.projectiles.length,1);
// The fifth dungeon advances into the finale; only boss defeat completes the run.
const s=new Session({code:'boss'});s.join({id:'p',name:'P'});startReadyParty(s,'p');s.run.round=5;s.run.players[0].arrived=true;s.tick(.02);assert.equal(s.phase,'playing');assert.equal(s.run.kind,'boss');s.run.enemies[0].hp=0;s.tick(.02);assert.equal(s.phase,'completed');assert(!s.closed);
console.log('PASS: fixed stationary octagon slots, launch input, separate Warden finale, team HP, spawn caps, alternating blasts, shield hits, arena bounds and network state');
