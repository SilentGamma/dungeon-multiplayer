import assert from 'node:assert/strict';
import {createRun} from '../dist/dungeon.mjs';
import {attack} from '../dist/combat.mjs';
import {ROLES,attackGeometry} from '../dist/roles.mjs';
for(const [color,cooldown] of Object.entries({coral:.7,purple:1,pink:1.25,gold:1.7,green:1.4,blue:2.45,teal:.6,lime:.9}))assert.equal(ROLES[color].cooldown,cooldown);
for(const angle of [0,Math.PI/2,Math.PI])for(const [fraction,damage] of [[.1,3],[.5,10],[.9,12],[1.02,12]]){
 const run=createRun([{id:'p',name:'P',color:'blue'}]);run.time=10;run.obstacles=[];run.pots=[];const p=run.players[0];Object.assign(p,{x:3.5,y:3.5,angle,vx:0,vy:0});const distance=attackGeometry('blue').length*fraction;
 const e={id:'target',type:'walker',room:24,x:p.x+Math.cos(angle)*distance,y:p.y+Math.sin(angle)*distance,hp:50,active:true};run.enemies=[e];assert(attack(run,p));assert.equal(e.hp,50-damage);assert.equal(p.nextAttack,12.45);assert(!attack(run,p),'cooldown prevents another shot');
}
console.log('PASS: all requested cooldowns and authoritative Ratio damage at close, middle, tip and edge overlap in three directions');
