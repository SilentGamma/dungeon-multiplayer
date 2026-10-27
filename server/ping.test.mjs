import assert from 'node:assert/strict';
import {pingSummary,createPingMonitor} from './public/ping.mjs';
const s=(ms,time)=>({ms,time});
assert.deepEqual(pingSummary([],0),{recent:[],peak:null,spike:false});
let result=pingSummary([s(80,0),s(90,2000),s(400,4000)],4000);
assert.equal(result.peak,400);assert(result.spike);
result=pingSummary([s(80,0),s(90,2000),s(400,4000),s(100,6000)],6000);
assert.equal(result.peak,400);assert(!result.spike);
result=pingSummary([s(400,0),s(100,32000)],32000);
assert.equal(result.peak,100);assert.equal(result.recent.length,1);
const originalFetch=globalThis.fetch;
try {
 let signal;
 globalThis.fetch=(_url,options)=>{signal=options.signal;return new Promise(()=>{})};
 const element={dataset:{},textContent:''};const monitor=createPingMonitor(element);
 assert.equal(element.textContent,'Ping: measuring…');monitor.stop();assert(signal.aborted);
} finally {globalThis.fetch=originalFetch}
console.log('PASS: ping peaks, spike detection, expiration and monitor cleanup');
