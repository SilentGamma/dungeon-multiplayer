import assert from 'node:assert/strict';
import {createDiagnostics} from './diagnostics.mjs';
let t=0,used={user:0,system:0};const d=createDiagnostics({now:()=>t,cpu:()=>used});
d.observe(100,116.6666667,3.2);t=100;assert.equal(d.snapshot().tickDelayPeakMs,100);assert.equal(d.snapshot().tickWorkPeakMs,3);assert.equal(d.snapshot().cpuCorePercent,null);
t=5000;used={user:400000,system:100000};d.observe(t,16,1);assert.equal(d.snapshot().cpuCorePercent,10);
t=35001;d.observe(t,16,1);assert.equal(d.snapshot().tickDelayPeakMs,0,'old spikes expire');
console.log('PASS: server timing peaks, rolling window, and CPU calculation');
