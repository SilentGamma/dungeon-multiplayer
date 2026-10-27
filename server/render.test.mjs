import assert from 'node:assert/strict';
import {createRun} from '../dist/dungeon.mjs';
import {gameView} from './public/game.mjs';
let now=0,frame=null,offscreen=0,draws=0;
const context=()=>new Proxy({drawImage(){draws++}},{get(o,k){return k in o?o[k]:(()=>{})},set(o,k,v){o[k]=v;return true}});
const els=new Map();function element(id){if(!els.has(id))els.set(id,{hidden:false,style:{},textContent:'',disabled:false,addEventListener(){},setAttribute(){}});return els.get(id)}
globalThis.document={getElementById:element,createElement(type){assert.equal(type,'canvas');offscreen++;return {width:0,height:0,getContext:context}},addEventListener(){},hidden:false};globalThis.addEventListener=()=>{};globalThis.requestAnimationFrame=fn=>(frame=fn,1);globalThis.cancelAnimationFrame=()=>{};globalThis.devicePixelRatio=3;Object.defineProperty(globalThis,'performance',{value:{now:()=>now},configurable:true});
const canvas={width:0,height:0,getContext:context,getBoundingClientRect:()=>({width:900,height:700}),addEventListener(){}};const view=gameView({canvas,me:'a',onInput(){}});const run=createRun([{id:'a',name:'A',color:'coral'}]);view.set(run);
for(let n=1;n<=120;n++){now=n*1000/60;const f=frame;f(now)}assert.equal(offscreen,1);assert(draws>=48&&draws<=60,`expected ~30 frames/sec, got ${draws/2}`);assert.equal(canvas.width,1350);view.stop();console.log('PASS: cached static map, 30-FPS rendering cap, and 1.5 device-pixel-ratio cap');
