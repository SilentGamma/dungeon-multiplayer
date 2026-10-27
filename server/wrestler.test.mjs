import assert from 'node:assert/strict';
import {createRun,applyInput,step,SIZE} from '../dist/dungeon.mjs';
import {damagePlayer} from '../dist/combat.mjs';
import {roleFor} from '../dist/roles.mjs';
function fixture(){const run=createRun([{id:'p',name:'Wrestler',color:'teal'}]);const p=run.players[0];p.x=1.4;p.y=2.5;p.vx=.42;p.vy=0;p.invulnerableUntil=0;run.edges=Array.from({length:SIZE*SIZE},()=>[]);run.goal=0;run.mapRoom=0;run.enemies=[];run.time=1;return [run,p]}
const tick=(run,n)=>{for(let i=0;i<n;i++)step(run,1/60,()=>.5)};
let [run,p]=fixture();
assert(applyInput(run,p.id,{seq:1,holding:true,attack:true}));assert.equal(p.wrestlerState,'lunging');assert(p.shielding);const x=p.x;
tick(run,4);assert(p.x>x,'lunge moves forward');const health=p.hp;damagePlayer(run,p,2);assert.equal(p.hp,health,'shield protects during the lunge');assert.equal(p.shield,p.maxShield-2);
tick(run,30);assert.equal(p.wrestlerState,null);assert.equal(p.shielding,false);assert.equal(p.holding,false);const stopped=p.x;tick(run,8);assert.equal(p.x,stopped,'miss leaves wrestler stationary');
[run,p]=fixture();const enemy={id:'e',type:'walker',room:15,mode:'walking',x:1.54,y:2.5,vx:0,vy:0,hp:7,maxHp:7,active:true};run.enemies=[enemy];
assert(applyInput(run,p.id,{seq:1,holding:true,attack:true}));tick(run,15);assert.equal(p.wrestlerState,'orbit');assert.equal(enemy.grabbedBy,p.id);assert(p.shielding);
const first={x:enemy.x,y:enemy.y};tick(run,4);assert(Math.hypot(enemy.x-first.x,enemy.y-first.y)>.01,'grabbed target revolves around wrestler');
assert(applyInput(run,p.id,{seq:2,holding:false,attack:false}));tick(run,12);assert.equal(enemy.grabbedBy,null);assert(enemy.throwing,'release throws the captured target');assert.equal(p.shielding,false);
[run,p]=fixture();p.shield=0;applyInput(run,p.id,{seq:1,holding:true,attack:true});assert(!p.wrestlerState,'lunge requires shield');
[run,p]=fixture();p.shield=1;applyInput(run,p.id,{seq:1,holding:true,attack:true});damagePlayer(run,p,2);assert(p.shieldBreakUntil>run.time);tick(run,1);assert(!p.wrestlerState);assert(!p.shielding);assert(p.stunUntil>run.time);
assert(roleFor('teal').description.includes('lunge'));
console.log('PASS: shielded wrestler lunge, missing, revolving grab, throw, and shield break');
