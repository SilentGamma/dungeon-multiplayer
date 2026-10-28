import assert from 'node:assert/strict';
import {createRun,applyInput} from '../dist/dungeon.mjs';
import {gameView} from './public/game.mjs';
function events(target={}){const handlers=new Map();target.addEventListener=(type,fn)=>{if(!handlers.has(type))handlers.set(type,new Set());handlers.get(type).add(fn)};target.removeEventListener=(type,fn)=>handlers.get(type)?.delete(fn);target.fire=(type,props={})=>{const e={type,preventDefault(){},...props};for(const fn of [...(handlers.get(type)||[])])fn(e)};target.listenerCount=()=>[...handlers.values()].reduce((n,set)=>n+set.size,0);return target}
const windowEvents=events();globalThis.addEventListener=windowEvents.addEventListener;globalThis.removeEventListener=windowEvents.removeEventListener;
const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});const elements=new Map();const element=id=>{if(!elements.has(id))elements.set(id,events({style:{},setAttribute(){}}));return elements.get(id)};
globalThis.document=events({getElementById:element,createElement:()=>({getContext:()=>ctx}),hidden:false});globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
// Match mobile webviews with no PointerEvent or pointer capture support.
delete globalThis.PointerEvent;
const canvas=events({getContext:()=>ctx,setPointerCapture(){throw Error('Not supported')}});
const inputs=[];const run=createRun([{id:'p',name:'P',color:'coral'}]);run.round=1;const p=run.players[0];p.vx=.28;p.vy=0;
const view=gameView({canvas,me:'p',onInput:m=>{inputs.push(m);applyInput(run,'p',m)}});view.set(run);const button=element('attack');
canvas.fire('pointerdown',{pointerId:1});assert(p.holding,'capture failure must not prevent movement aiming');
windowEvents.fire('pointerup',{pointerId:1});assert(!p.holding,'release outside canvas still launches');
button.fire('pointerdown',{pointerId:2});assert(p.shielding,'attack touch raises shield');button.fire('pointerup',{pointerId:2});assert(!p.shielding);assert(p.attackUntil>run.time,'release fires attack');
const touch=(target,type,id)=>target.fire(type,{changedTouches:[{identifier:id}]});
run.time=1;touch(canvas,'touchstart',3);assert(p.holding);touch(canvas,'touchend',3);assert(!p.holding);
run.time=2;touch(button,'touchstart',4);assert(p.shielding);touch(button,'touchend',4);assert(!p.shielding);assert(p.attackUntil>run.time);
// Independent fingers may hold movement and attack without losing the release.
run.time=3;touch(canvas,'touchstart',5);touch(button,'touchstart',6);assert(p.shielding);touch(button,'touchend',6);assert(p.holding);assert(!p.shielding);touch(canvas,'touchend',5);assert(!p.holding);
run.time=4;touch(button,'touchstart',7);touch(button,'touchcancel',7);assert(!p.holding);assert(inputs.at(-1).cancel);
const count=inputs.length;button.fire('click',{detail:0,pointerType:'touch'});assert.equal(inputs.length,count,'no synthetic duplicate touch attack');button.fire('click',{detail:0});assert.equal(inputs.length,count,'older webview touch click cannot trigger a second attack');
view.stop();assert.equal(canvas.listenerCount(),0);assert.equal(button.listenerCount(),0);assert.equal(windowEvents.listenerCount(),0);assert.equal(document.listenerCount(),0);
console.log('PASS: mobile shield, attacks and launch; unsupported capture, touch fallback, multitouch, cancellation and listener cleanup');
