import assert from 'node:assert/strict';
import {SPEED_MULTIPLIER} from '../dist/world.mjs';
import {roleFor,WIDTH} from '../dist/roles.mjs';
import {ENEMIES} from '../dist/enemies.mjs';
import {createRun,applyInput,AIM_SPEED} from '../dist/dungeon.mjs';
import {grapple} from '../dist/throw.mjs';
import {attack,stepCombat,SHIELD_RADIUS,damagePlayer} from '../dist/combat.mjs';
import {applyPoison,tickPoison,healAlly} from '../dist/poison.mjs';
import {cameraScale,DESKTOP_CAMERA,MOBILE_CAMERA} from './public/camera.mjs';
assert.equal(SPEED_MULTIPLIER,.8);assert.equal(roleFor('coral').speed,8*.8);assert.equal(ENEMIES.walker.speed,.19*.8);assert.equal(ENEMIES.flapper.speed,.27*.8);assert.equal(AIM_SPEED,3.6*.8);
assert(cameraScale(900,700)>Math.min(900/1.25,700/1.08));assert.equal(cameraScale(390,700),Math.min(390/.74,700/1.02));assert.notEqual(DESKTOP_CAMERA,MOBILE_CAMERA);assert.equal(cameraScale(844,390,true),Math.min(844/.74,390/1.02));
const poison={id:'p',hp:20};assert(applyPoison(poison,0));for(const [time,hp] of [[1.49,20],[1.5,19],[3,18],[4.5,17],[6,16],[9,16]]){tickPoison(poison,time,d=>poison.hp-=d);assert.equal(poison.hp,hp)}assert.equal(poison.poisonTicks,0);
applyPoison(poison,10);const ally={id:'ally'};assert(healAlly(ally,poison,1));assert.equal(poison.poisonTicks,0);assert.equal(poison.poisonNext,0);tickPoison(poison,100,()=>assert.fail('cured poison must never tick'));assert(!healAlly(poison,poison,5));
function fixture(color='coral'){const r=createRun([{id:'p',name:'P',color}]);r.time=10;r.enemies=[];r.obstacles=[];r.goal=0;r.mapRoom=0;const p=r.players[0];Object.assign(p,{x:1.5,y:2.5,vx:.2,vy:0,angle:0,invulnerableUntil:0});return [r,p]}
let [r,p]=fixture();for(const state of [{stunUntil:20},{throwing:{}},{grabbedBy:'holder'},{arrived:true},{hp:0}]){const copy={...p,...state};r.players=[copy];assert(!applyInput(r,copy.id,{seq:1,holding:true,attack:false}));assert(!copy.holding)}r.players=[p];p.nextAttack=12;assert(!applyInput(r,p.id,{seq:1,holding:true,attack:true}));assert(!p.holding);assert(applyInput(r,p.id,{seq:2,holding:true,attack:false}),'attack cooldown does not block valid movement aim');
[r,p]=fixture();p.holding=true;p.shielding=true;p.shield=1;p.shieldRaisedAt=0;const e={id:'w',type:'walker',room:15,x:p.x+.01,y:p.y,vx:-.1,vy:0,hp:15,active:true,mode:'walking',attackActiveUntil:20};r.enemies=[e];const hp=p.hp;stepCombat(r,0);assert.equal(p.hp,hp,'shield break absorbs all damage without overflow');assert.equal(p.shield,0);
[r,p]=fixture();p.holding=true;p.shielding=true;p.shield=10;p.shieldRaisedAt=0;r.enemies=[{...e,x:p.x+.01,y:p.y}];stepCombat(r,0);assert(Math.hypot(r.enemies[0].x-p.x,r.enemies[0].y-p.y)>=SHIELD_RADIUS+ENEMIES.walker.radius-1e-9,'enemy is kept outside raised shield');
// Chef and Perfumer healing both remove poison, including at full HP.
for(const color of ['green','purple']){[r,p]=fixture(color);const q={...p,id:'ally',x:p.x+.04,hp:p.maxHp,maxHp:p.maxHp};r.players.push(q);applyPoison(q,10);r.enemies=[{...e,x:p.x+.06,y:p.y,hp:100,maxHp:100,attackActiveUntil:0}];assert(attack(r,p));assert.equal(q.poisonTicks,0,color+' allied heal clears poison at full HP')}
[r,p]=fixture('teal');const target={...e,x:p.x+.04,y:p.y};r.enemies=[target];p.grappleTarget=target.id;assert(grapple(r,p));assert(Math.abs(Math.hypot(target.throwing.vx,target.throwing.vy)-12*WIDTH*.8)<1e-10);
[r,p]=fixture('lime');p.shield=1;p.shielding=true;const friend={...p,id:'friend',x:p.x+.02,shielding:false,hp:8,maxHp:12};r.players.push(friend);applyPoison(friend,10);damagePlayer(r,p,2,()=>.4);assert.equal(friend.poisonTicks,0,'Joker healing effect clears allied poison');
console.log('PASS: universal speed scaling, independent camera settings, poison timing and cure, aim lockouts, shield interception and healing integrations');
