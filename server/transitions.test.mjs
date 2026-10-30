import assert from 'node:assert/strict';
import {createCastleEntrance} from './public/castle-entrance.mjs';
let animations=0;const curtain={style:{},classList:{toggle(){},remove(){}},animate(){animations++;return {finished:Promise.resolve(),cancel(){}}}};
globalThis.document={getElementById:()=>curtain,addEventListener(){}};globalThis.matchMedia=()=>({matches:true});globalThis.Audio=class{preload='';volume=0;duration=6;play(){return Promise.resolve()}pause(){}};
const c=createCastleEntrance(()=>false);let shown='home',reveals=0;
await c.change('navigation',()=>{shown='navigation';reveals++});assert.equal(shown,'navigation');assert.equal(curtain.style.opacity,'0');assert.equal(curtain.style.pointerEvents,'none');
const first=c.change('game',()=>{shown='old frame';reveals++});const second=c.change('game',()=>{shown='latest frame';reveals++});await Promise.all([first,second]);assert.equal(shown,'latest frame');assert.equal(reveals,2,'repeated frames update one pending reveal');
const count=animations;await c.change('game',()=>{});assert.equal(animations,count,'normal gameplay frames do not start loading fades');await c.change('game',()=>{}, {force:true});assert(animations>count,'new dungeon can force a reveal');await c.change('home',()=>{shown='home'});assert.equal(shown,'home');assert.equal(curtain.style.pointerEvents,'none');
console.log('PASS: page changes, final overlay cleanup, deduplicated live frames and dungeon transition');
