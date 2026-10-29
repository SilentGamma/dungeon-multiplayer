import assert from 'node:assert/strict';
import {createRun} from '../dist/dungeon.mjs';
import {damagePlayer,stepCombat} from '../dist/combat.mjs';
import {GAMBIT_NAMES} from '../dist/gambit.mjs';
import {frameFor,fullFor} from './protocol.mjs';
import {applyFrame} from './public/wire.mjs';
import {createGambitAnnouncement} from './public/gambit-announcement.mjs';
for(let outcome=0;outcome<6;outcome++){
 const run=createRun([{id:'j',name:'J',color:'lime'},{id:'a',name:'A',color:'coral'}]);run.time=10;run.enemies=[];run.obstacles=[];
 const [j,a]=run.players;Object.assign(j,{shielding:true,shield:1,awaitingLaunch:false});Object.assign(a,{x:j.x+.03,y:j.y,hp:1,awaitingLaunch:false});let rolls=0;const random=()=>{rolls++;return (outcome+.5)/6};
 assert(damagePlayer(run,j,2,random));assert.equal(rolls,0);assert.equal(run.gambitCue.outcome,null);assert.equal(j.hp,8);assert(!j.stunUntil);
 run.time=10.199;stepCombat(run,0,random);assert.equal(rolls,0);assert.equal(a.hp,1);
 run.time=10.2;stepCombat(run,0,random);assert.equal(rolls,1);assert.equal(run.gambitCue.outcome,GAMBIT_NAMES[outcome]);assert(!j.gambitPending);
 if(outcome===0){assert.equal(j.hp,0);assert.equal(a.hp,0)}
 if(outcome===1)assert.equal(j.invisibleUntil,17.2);
 if(outcome===2)assert.equal(a.hp,11);
 if(outcome===3)assert.equal(a.stunUntil,14.2);
 if(outcome===4)assert.equal(j.airUntil,15.2);
 if(outcome===5)assert.equal(a.hp,0);
 run.time+=.01;stepCombat(run,0,random);assert.equal(rolls,1,'effect resolves only once');
 // A distant viewer receives the same announcement despite entity culling.
 a.x=0;a.y=0;const room={run,snapshot:()=>({phase:'playing',run:structuredClone(run)})};const f=frameFor(room,a.id,new Map());assert.deepEqual(f.gambitCue,run.gambitCue);assert.deepEqual(applyFrame(fullFor(room,a.id),f).run.gambitCue,run.gambitCue);
}
let clock=0,serial=0;const jobs=new Map();const el={hidden:true,textContent:''};
const hud=createGambitAnnouncement(el,{now:()=>clock,schedule:(fn,delay)=>{jobs.set(++serial,{fn,at:clock+delay});return serial},cancel:id=>jobs.delete(id)});
const advance=dt=>{clock+=dt;for(const [id,j] of [...jobs])if(j.at<=clock){jobs.delete(id);j.fn()}};
const cue={id:'1:1',expiresAt:2,outcome:null};hud.set(cue,0);assert.equal(el.textContent,'GAMBIT');
advance(100);hud.set({...cue,outcome:'SHOCK'},.2);assert.equal(el.textContent,'GAMBIT');advance(99);assert.equal(el.textContent,'GAMBIT');advance(1);assert.equal(el.textContent,'SHOCK');hud.set({...cue,outcome:'SHOCK'},.3);assert.equal(jobs.size,1,'snapshots do not replay or stack announcements');advance(1200);assert(el.hidden);
// Even when the first packet already has the result, show the brief GAMBIT cue first.
hud.set({id:'1:2',expiresAt:4,outcome:'AIR RELEASE'},2);assert.equal(el.textContent,'GAMBIT');advance(200);assert.equal(el.textContent,'AIR RELEASE');hud.clear();advance(2000);assert(el.hidden);assert.equal(jobs.size,0);
console.log('PASS: delayed Gambit selection, six effects, global compact announcements, 200-ms presentation, no duplicate timers and reset cleanup');
