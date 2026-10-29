import assert from 'node:assert/strict';
import {createPrediction} from './public/prediction.mjs';
import {movePlayer} from '../dist/movement.mjs';
import {createRun} from '../dist/dungeon.mjs';
import {roleFor,WIDTH} from '../dist/roles.mjs';
function fixture(){const run=createRun([{id:'p',name:'P',color:'coral'}]);run.time=10;run.round=1;run.goal=0;run.enemies=[];run.obstacles=[];run.edges=Array.from({length:49},()=>[]);run.lockedRooms=Array(49).fill(false);run.enemyRooms=Array(49).fill(false);Object.assign(run.players[0],{x:1.5,y:2.5,vx:roleFor('coral').speed*WIDTH,vy:0,angle:0});return run}
let run=fixture(),pred=createPrediction('p');pred.latency(0);pred.set(run,0);const speed=run.players[0].vx;
assert(Math.abs(pred.sample(500).x-(1.5+speed*.5))<1e-9,'local movement advances without a new snapshot');
pred.reset();pred.set(run,0);pred.input({seq:1,holding:true,attack:false,angle:0},0);assert.equal(pred.sample(100).x,1.5,'hold stops movement immediately');pred.input({seq:2,holding:false,attack:false,angle:0},100);assert(Math.abs(pred.sample(200).x-(1.5+speed*.1))<1e-9,'release launches before server acknowledgment');assert.equal(run.players[0].x,1.5,'prediction never mutates server snapshots');
pred.reject(1);pred.reject(2);assert(pred.sample(200).x>1.5);
// Shared deterministic bounces match authoritative movement exactly.
run=fixture();run.players[0].x=1.97;pred.reset();pred.latency(0);pred.set(run,0);const serverP={...run.players[0]};for(let i=0;i<30;i++)movePlayer(run,serverP,1/60);const predicted=pred.sample(500);assert(Math.abs(predicted.x-serverP.x)<1e-9&&Math.abs(predicted.y-serverP.y)<1e-9);assert.equal(predicted.bounceCount,serverP.bounceCount);
run=fixture();run.lockedRooms[15]=true;run.edges[15]=[16];run.edges[16]=[15];run.doors={'15:16':[[.2,.8]]};run.players[0].x=1.98;pred.reset();pred.set(run,0);assert(pred.sample(500).x<2,'locked rooms prevent predicted exits');
run=fixture();run.obstacles=[{id:'wall',type:'wall',room:15,x:1.55,y:2.4,size:.1}];pred.reset();pred.set(run,0);assert(pred.sample(500).x<1.55,'prediction respects obstacle walls');
for(const lock of [{hp:0},{arrived:true},{stunUntil:20},{throwing:true},{grabbedBy:'w'},{wrestlerState:'orbit'}]){run=fixture();Object.assign(run.players[0],lock);pred.reset();pred.set(run,0);pred.input({seq:1,holding:false,angle:2},0);assert.equal(pred.sample(300).x,run.players[0].x,'authoritative lock disables prediction')}
run=fixture();pred.reset();pred.set(run,0);pred.input({seq:1,holding:true,attack:false},0);assert(pred.sample(1000).x>1.5,'expired inputs are dropped rather than replayed');
run=fixture();pred.reset();pred.set(run,0);pred.input({seq:1,holding:true,attack:false},0);const next=structuredClone(run);next.time=10.1;next.players[0].lastProcessedInputSeq=1;next.players[0].inputSeq=0;pred.set(next,100);assert(!pred.sample(300).holding,'server rejection removes pending hold');
next.round=2;next.players[0].x=3.5;pred.set(next,400);assert(pred.sample(400).x>=3.5,'new dungeon resets old predicted coordinates');
console.log('PASS: immediate local movement, shared wall/bounce physics, authoritative locks, stale/rejected inputs and round resets');
// Exercise delayed uplink/downlink separately: 400 ms RTT, 10 Hz snapshots.
run=fixture();const delayed=createPrediction('p');delayed.latency(400);const initial=structuredClone(run);initial.time-=.2;initial.players[0].x-=speed*.2;delayed.set(initial,0);const uplink=[],downlink=[];let maxError=0;
for(let frame=1;frame<=120;frame++){
 const now=frame*1000/60;
 if(frame===15||frame===33){const msg={seq:frame===15?1:2,holding:frame===15,attack:false,angle:0};delayed.input(msg,now);uplink.push({at:frame+12,msg});assert.equal(delayed.sample(now).holding,msg.holding,'controls respond before the delayed server receives input')}
 for(const item of uplink.filter(x=>x.at===frame)){const p=run.players[0];p.inputSeq=item.msg.seq;p.lastProcessedInputSeq=item.msg.seq;p.holding=item.msg.holding;if(!p.holding){p.vx=speed;p.vy=0}}
 run.time+=1/60;if(!run.players[0].holding)movePlayer(run,run.players[0],1/60);
 if(frame%6===0)downlink.push({at:frame+12,run:structuredClone(run)});
 for(const item of downlink.filter(x=>x.at===frame))delayed.set(item.run,now);
 const local=delayed.sample(now);maxError=Math.max(maxError,Math.hypot(local.x-run.players[0].x,local.y-run.players[0].y));
}
assert(maxError<.12,'prediction remains bounded while delayed actions reconcile');assert(Math.abs(delayed.sample(2000).x-run.players[0].x)<.03,'position converges after acknowledgments');assert.equal(run.players[0].hp,run.players[0].maxHp);
console.log('PASS: 400-ms simulated round trip with 10-Hz state updates, immediate controls and bounded reconciliation');

run=fixture();pred.reset();pred.latency(0);pred.set(run,0);pred.input({seq:1,holding:true,attack:false,aimDirection:-1},0);assert(pred.sample(100).angle<0,'prediction immediately follows counterclockwise steering');
const acknowledged=structuredClone(run);acknowledged.time=10.1;Object.assign(acknowledged.players[0],{holding:true,aimDirection:-1,angle:-.288,inputSeq:1,lastProcessedInputSeq:1});pred.set(acknowledged,100);assert(pred.sample(200).angle<-.288,'acknowledged steering persists after pending input is removed');
