import assert from 'node:assert/strict';
import {createRun,applyInput,step} from '../dist/dungeon.mjs';
import {ACTION_HOLD_SECONDS} from '../dist/action.mjs';
import {createPrediction} from './public/prediction.mjs';
function fixture(color='coral'){const r=createRun([{id:'p',name:'P',color}]);r.time=10;r.enemies=[];r.pots=[];r.obstacles=[];r.goal=0;r.keyRooms=[];r.keyItems=[];const p=r.players[0];Object.assign(p,{x:1.5,y:2.5,vx:.224,vy:0,awaitingLaunch:false,invulnerableUntil:0});return [r,p]}
for(const color of ['coral','purple','pink','gold','green','blue','lime']){
 let [r,p]=fixture(color);assert(applyInput(r,'p',{seq:1,holding:true,attack:true}));assert(!p.shielding);assert(!p.attackUntil);r.time+=.05;assert(applyInput(r,'p',{seq:2,holding:false,attack:false,heldFor:.05}));assert(p.attackUntil>r.time,color+' tap attacks');assert(!p.shielding);assert(p.nextAttack>r.time);
 [r,p]=fixture(color);applyInput(r,'p',{seq:1,holding:true,attack:true});step(r,.19);assert(!p.shielding);step(r,.01);assert(p.shielding,color+' hold shields at .2');assert(!p.attackUntil);applyInput(r,'p',{seq:2,holding:false,attack:false,heldFor:.2});assert(!p.shielding);assert(!p.attackUntil,color+' shield release never attacks');
 [r,p]=fixture(color);applyInput(r,'p',{seq:1,holding:true,attack:true});applyInput(r,'p',{seq:2,holding:false,attack:false,cancel:true});assert(!p.attackUntil,color+' cancellation never attacks');
 // A delayed press arriving immediately before release cannot turn a long physical hold into an attack.
 [r,p]=fixture(color);applyInput(r,'p',{seq:1,holding:true,attack:true});applyInput(r,'p',{seq:2,holding:false,attack:false,heldFor:.5});assert(!p.attackUntil);
}
let [r,p]=fixture('teal');applyInput(r,'p',{seq:1,holding:true,attack:true});assert.equal(p.wrestlerState,'lunging');assert(!p.shielding);const start=p.x;step(r,.1);assert(p.x>start);assert(!p.shielding);step(r,.1);assert(p.shielding);applyInput(r,'p',{seq:2,holding:false,attack:false});assert(!p.shielding,'releasing Wrestler lowers shield immediately');
// Client prediction raises the same delayed shield, never one on the initial press.
[r,p]=fixture();const prediction=createPrediction('p');prediction.latency(0);prediction.set(r,0);prediction.input({seq:1,holding:true,attack:true},0);assert(!prediction.sample(100).shielding);assert(prediction.sample(201).shielding);prediction.input({seq:2,holding:false,attack:false},220);assert(!prediction.sample(230).shielding);
assert.equal(ACTION_HOLD_SECONDS,.2);
console.log('PASS: tap-only attack, hold-only shield, threshold, cancellation, delayed packets, unchanged role attacks, Wrestler launch and predicted shield timing');
