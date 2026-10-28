import assert from 'node:assert/strict';
import {createFramePacer} from './public/frame-pacer.mjs';
function feed(p,start,end,rate,cost){let draws=0;for(let now=start+1000/rate;now<=end+.001;now+=1000/rate)if(p.shouldDraw(now)){p.complete(cost);draws++}return draws}
let p=createFramePacer();p.reset(0);const draws=feed(p,0,2000,120,2);assert(draws>=119&&draws<=120);assert.equal(p.fps,60,'fast devices target 60');
p=createFramePacer();p.reset(0);feed(p,0,2500,60,16);assert.equal(p.fps,30,'high render cost lowers the cap');const capped=feed(p,2500,4500,60,16);assert(capped>=59&&capped<=61);assert.equal(p.fps,30);
feed(p,4500,10000,60,2);assert.equal(p.fps,30,'recovery has a cooldown');feed(p,10000,15000,60,2);assert.equal(p.fps,60,'sustained good device performance recovers 60');
p=createFramePacer();p.reset(0);feed(p,0,2500,30,2);assert.equal(p.fps,30,'missed display frames lower the cap even if JavaScript work is short');
p=createFramePacer();p.reset(0);feed(p,0,1000,60,2);p.shouldDraw(11000);feed(p,11000,12000,60,2);assert.equal(p.fps,60,'background pauses are ignored');
console.log('PASS: 60-FPS pacing, device-cost and missed-frame fallback to 30, recovery hysteresis and background pause handling');
