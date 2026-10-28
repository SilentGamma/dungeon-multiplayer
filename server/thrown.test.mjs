import assert from 'node:assert/strict';
import {createRun,applyInput} from '../dist/dungeon.mjs';
import {updateThrows,beginGrapple,startWrestler} from '../dist/throw.mjs';
import {attack,stepCombat} from '../dist/combat.mjs';
import {prepareRevives} from '../dist/revive.mjs';
const run=createRun([{id:'w',name:'W',color:'teal'},{id:'a',name:'A',color:'coral'},{id:'down',name:'D',color:'blue'}]);
run.time=10;run.obstacles=[];run.enemies=[];run.goal=0;
const [w,a,down]=run.players;for(const p of run.players){p.x=1.5;p.y=2.5;p.invulnerableUntil=0;p.shielding=false}down.hp=0;
a.throwing={room:15,vx:.1,vy:0,from:w.id,contact:{}};
assert(!applyInput(run,a.id,{seq:1,holding:true,attack:true}));assert(!attack(run,a));assert(!beginGrapple(run,a));assert(!startWrestler(run,a));prepareRevives(run);assert(!a.reviving,'thrown players cannot revive even after stun expires');
a.throwing=null;a.grabbedBy=w.id;assert(!applyInput(run,a.id,{seq:1,holding:true,attack:true}));assert(!attack(run,a));a.grabbedBy=null;
const enemy={id:'enemy',type:'walker',room:15,x:w.x,y:w.y,vx:0,vy:0,hp:100,maxHp:100,active:true,attackActiveUntil:99,throwing:{room:15,vx:.1,vy:0,from:w.id,contact:{}}};run.enemies=[enemy];a.x=1.9;down.x=1.9;
const hp=w.hp,shield=w.shield;updateThrows(run,.001);assert.equal(w.hp,hp);assert.equal(w.shield,shield);assert.equal(enemy.hp,100,'thrower overlap causes no reciprocal collision damage');
// A wall rebound returning the target to the thrower is also safe.
enemy.throwing.vx=-.1;enemy.x=w.x;updateThrows(run,.001);assert.equal(w.hp,hp);
a.x=enemy.x;a.y=enemy.y;const allyHp=a.hp;updateThrows(run,.001);assert.equal(a.hp,allyHp-5,'other entities retain throw collision damage');
// Recovery clears old attack activity before normal AI resumes.
a.x=1.9;enemy.x=w.x;enemy.y=w.y;enemy.throwing.vx=.00001;enemy.throwing.vy=0;updateThrows(run,.1);assert.equal(enemy.throwing,null);assert.equal(enemy.attackActiveUntil,0);assert(enemy.nextContactAttack>run.time);stepCombat(run,0);assert.equal(w.hp,hp);
console.log('PASS: thrown and grabbed action locks, thrower immunity, retained impact damage and safe enemy recovery');
