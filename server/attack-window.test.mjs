import assert from 'node:assert/strict';
import {createRun,step,regenerateShield} from '../dist/dungeon.mjs';
import {attack,stepCombat,ATTACK_DURATION,ENEMY_RADIUS} from '../dist/combat.mjs';
import {attackGeometry,inAttack,WIDTH} from '../dist/roles.mjs';
function fixture(color='coral'){const r=createRun([{id:'p',name:'P',color}]);r.time=10;r.obstacles=[];r.enemies=[];r.pots=[];r.goal=0;r.mapRoom=0;const p=r.players[0];Object.assign(p,{x:1.5,y:2.5,vx:0,vy:0,invulnerableUntil:0,angle:0});return [r,p]}
let [r,p]=fixture('teal');p.shield=0;for(let i=0;i<120;i++)step(r,1/60);assert.equal(p.shield,0,'stationary Wrestler cannot regenerate');p.vx=.42;for(let i=0;i<60;i++)step(r,1/60);assert.equal(p.shield,1,'one full second of movement restores one point');
p.shieldTick=.9;regenerateShield(r,p,.1,false);assert.equal(p.shieldTick,0);regenerateShield(r,p,.2,true);assert.equal(p.shield,1,'standing still resets incomplete movement tick');
for(const state of ['holding','shielding','throwing','grabbedBy','reviving','arrived']){const q={...p,[state]:true,shield:0,shieldTick:.9};regenerateShield(r,q,.2,true);assert.equal(q.shield,0,state+' cannot regenerate');assert.equal(q.shieldTick,0)}
const stunned={...p,shield:0,stunUntil:r.time+1};regenerateShield(r,stunned,2,true);assert.equal(stunned.shield,0);
[r,p]=fixture();assert(attack(r,p));assert.equal(p.attackUntil,r.time+ATTACK_DURATION);
const enemy={id:'e',type:'walker',room:15,x:1.8,y:2.5,vx:0,vy:0,hp:50,maxHp:50,active:true,stunUntil:100};r.enemies=[enemy];
r.time+=.1;enemy.x=p.x+.06;stepCombat(r,0);assert.equal(enemy.hp,45,'enemy entering active indicator gets hit');stepCombat(r,0);assert.equal(enemy.hp,45,'one hit per enemy per swing');
const late={...enemy,id:'late',hp:50,x:p.x+.05};r.enemies.push(late);r.time=10+ATTACK_DURATION+.001;stepCombat(r,0);assert.equal(late.hp,50,'no damage after expiry');
[r,p]=fixture('blue');assert(attack(r,p));p.angle=Math.PI;const target={...enemy,id:'s',hp:50,x:p.x+.3,y:p.y};r.enemies=[target];r.time+=.1;stepCombat(r,0);assert.equal(target.hp,38,'shot keeps release direction after player turns');
const second={...target,id:'second',hp:50};r.enemies.push(second);stepCombat(r,0);assert.equal(second.hp,50,'single-target roles hit only one entity throughout the window');
const geom=attackGeometry('blue');assert.equal(geom.length,10.8*WIDTH);const aim={color:'blue',x:0,y:0,angle:0};assert(inAttack(aim,{x:geom.length+.02,y:0},ENEMY_RADIUS),'enemy edge touching rectangle counts');assert(!inAttack(aim,{x:geom.length+.03,y:0},ENEMY_RADIUS));
for(const color of ['coral','teal','gold','pink','blue','purple','green','lime']){const g=attackGeometry(color);const a={color,x:0,y:0,angle:0};if(g.kind==='circle'){assert(inAttack(a,{x:g.x+g.radius,y:0}));assert(!inAttack(a,{x:g.x+g.radius+.001,y:0}))}else if(g.kind==='rectangle'){assert(inAttack(a,{x:g.length,y:g.halfWidth}));assert(!inAttack(a,{x:g.length+.001,y:0}))}else{assert(inAttack(a,{x:g.radius,y:0}));assert(!inAttack(a,{x:g.radius+.001,y:0}))}}
console.log('PASS: actual-movement shield regeneration, persistent attacks, one hit per target, fixed facing and shared indicator geometry');
