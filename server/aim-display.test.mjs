import assert from 'node:assert/strict';
import {createRun,RADIUS} from '../dist/dungeon.mjs';
import {gameView} from './public/game.mjs';
let now=0,frame,points=[],body=null;const handlers={},inputs=[];
const context=()=>new Proxy({arc(x,y,r){if(r===RADIUS)body={x,y}},moveTo(x,y){points.push([x,y])}},{get(o,k){return k in o?o[k]:(()=>{})},set(o,k,v){o[k]=v;return true}});
const elements=new Map();function element(id){if(!elements.has(id))elements.set(id,{hidden:false,style:{},textContent:'',disabled:false,addEventListener(){},setAttribute(){}});return elements.get(id)}
globalThis.document={getElementById:element,createElement(){return {getContext:context}},addEventListener(){},hidden:false};globalThis.addEventListener=()=>{};globalThis.requestAnimationFrame=f=>(frame=f,1);globalThis.cancelAnimationFrame=()=>{};globalThis.devicePixelRatio=1;Object.defineProperty(globalThis,'performance',{value:{now:()=>now},configurable:true});
const canvas={width:0,height:0,getContext:context,getBoundingClientRect:()=>({width:900,height:700}),addEventListener(name,fn){handlers[name]=fn},setPointerCapture(){}};const view=gameView({canvas,me:'p',onInput:m=>inputs.push(m)});const run=createRun([{id:'p',name:'P',color:'coral'}]);run.round=1;const p=run.players[0];p.vx=.28;p.vy=0;p.angle=0;view.set(run);
handlers.pointerdown({pointerId:1,preventDefault(){}});now=100;frame(now);handlers.pointerup({pointerId:1,type:'pointerup'});const released=inputs.at(-1);assert(!released.holding);assert(released.angle>0);
const stale=structuredClone(run);stale.players[0].vx=0;stale.players[0].vy=0;stale.players[0].angle=-2;stale.players[0].inputSeq=0;view.set(stale);points=[];now=140;frame(now);
const arrow=points.filter(([x,y])=>Math.abs(Math.hypot(x-body.x,y-body.y)-.075)<1e-6).at(-1);assert(arrow,'arrow drawn');assert(Math.abs(Math.atan2(arrow[1]-body.y,arrow[0]-body.x)-released.angle)<1e-6,'arrow holds released direction until acknowledged');
view.stop();console.log('PASS: aiming arrow retains released direction while old snapshots arrive');
