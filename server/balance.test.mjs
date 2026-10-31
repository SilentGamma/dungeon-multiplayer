import assert from 'node:assert/strict';
import {SPEED_MULTIPLIER} from '../dist/world.mjs';
import {roleFor,WIDTH} from '../dist/roles.mjs';
import {ENEMIES} from '../dist/enemies.mjs';
import {createRun,applyInput,step,AIM_SPEED} from '../dist/dungeon.mjs';
import {grapple} from '../dist/throw.mjs';
import {attack,stepCombat,SHIELD_RADIUS,damagePlayer} from '../dist/combat.mjs';
import {applyPoison,tickPoison,healAlly} from '../dist/poison.mjs';
import {cameraScale,cameraFrame,DESKTOP_CAMERA,MOBILE_CAMERA} from './public/camera.mjs';
assert.equal(roleFor('purple').speed,6*.8);assert.equal(roleFor('blue').speed,8*.8);assert.equal(roleFor('teal').speed,10*.8);assert.equal(roleFor('purple').speedClass,'Slow');assert.equal(roleFor('blue').speedClass,'Normal');assert.equal(roleFor('teal').speedClass,'Fast');assert.equal(SPEED_MULTIPLIER,.8);assert.equal(roleFor('coral').speed,8*.8);assert.equal(ENEMIES.walker.speed,.19*.8);assert.equal(ENEMIES.flapper.speed,.27*.8);assert.equal(AIM_SPEED,3.6*.8);
assert(cameraScale(900,700)<Math.min(900/1.12,700/.97));assert(cameraScale(390,700)<390);assert.notEqual(DESKTOP_CAMERA,MOBILE_CAMERA);for(const [w,h,mobile] of [[390,700,true],[844,390,true],[900,700,false],[320,568,true]]){const f=cameraFrame(w,h,mobile),s=f.scale;assert(f.centerX-s/2>=f.side);assert(f.centerX+s/2<=w-f.side);assert(f.centerY-s/2>=f.top);assert(f.centerY+s/2<=h-f.bottom)}
const poison={id:'p',hp:20};assert(applyPoison(poison,0));for(const [time,hp] of [[1.49,20],[1.5,19],[3,18],[4.5,17],[6,16],[9,16]]){tickPoison(poison,time,d=>poison.hp-=d);assert.equal(poison.hp,hp)}assert.equal(poison.poisonTicks,0);
applyPoison(poison,10);const ally={id:'ally'};assert(healAlly(ally,poison,1));assert.equal(poison.poisonTicks,0);assert.equal(poison.poisonNext,0);tickPoison(poison,100,()=>assert.fail('cured poison must never tick'));assert(!healAlly(poison,poison,5));
function fixture(color='coral'){const r=createRun([{id:'p',name:'P',color}]);r.time=10;r.enemies=[];r.pots=[];r.obstacles=[];r.goal=0;r.mapRoom=0;const p=r.players[0];Object.assign(p,{x:1.5,y:2.5,vx:.2,vy:0,angle:0,invulnerableUntil:0});return [r,p]}
let [r,p]=fixture();for(const state of [{stunUntil:20},{throwing:{}},{grabbedBy:'holder'},{arrived:true},{hp:0}]){const copy={...p,...state};r.players=[copy];assert(!applyInput(r,copy.id,{seq:1,holding:true,attack:false}));assert(!copy.holding)}r.players=[p];p.nextAttack=12;assert(applyInput(r,p.id,{seq:1,holding:true,attack:true}));assert(p.holding,'cooldown permits starting a shield hold');assert(applyInput(r,p.id,{seq:2,holding:true,attack:false}),'attack cooldown does not block valid movement aim');
[r,p]=fixture();p.holding=true;p.holding=true;p.usingAttack=true;p.shielding=true;p.shield=1;p.shieldRaisedAt=0;const e={id:'w',type:'walker',room:15,x:p.x+.01,y:p.y,vx:-.1,vy:0,hp:15,active:true,mode:'walking',attackActiveUntil:20};r.enemies=[e];const hp=p.hp;stepCombat(r,0);assert.equal(p.hp,hp,'shield break absorbs all damage without overflow');assert.equal(p.shield,0);
[r,p]=fixture();p.holding=true;p.holding=true;p.usingAttack=true;p.shielding=true;p.shield=10;p.shieldRaisedAt=0;r.enemies=[{...e,x:p.x+.01,y:p.y}];stepCombat(r,0);assert(Math.hypot(r.enemies[0].x-p.x,r.enemies[0].y-p.y)>=SHIELD_RADIUS+ENEMIES.walker.radius-1e-9,'enemy is kept outside raised shield');
// The visible outer shield is the hurtbox, including exact boundary contact.
for(const type of ['walker','flapper','sleeper']){
 [r,p]=fixture('green');Object.assign(p,{holding:true,holding:true,usingAttack:true,shielding:true,shield:15,shieldRaisedAt:0});
 const radius=ENEMIES[type].radius;
 const enemy={...e,id:type,type,x:p.x+SHIELD_RADIUS+radius,y:p.y,vx:0,vy:0,mode:type==='sleeper'?'lunging':'walking',lungeUntil:20,attackActiveUntil:20};r.enemies=[enemy];
 stepCombat(r,0);assert.equal(p.hp,p.maxHp,type+' outer shield contact leaves HP untouched');assert.equal(p.shield,15-ENEMIES[type].damage,type+' outer shield takes attack damage');assert.equal(p.hurtUntil,undefined,'blocked hit flashes shield instead of player');assert(p.blockUntil>r.time);
}
// A Walker arriving at a raised shield must complete its windup there, not
// bounce out of range and make shield collisions appear to require body contact.
[r,p]=fixture('green');Object.assign(p,{holding:true,holding:true,usingAttack:true,shielding:true,shield:15,shieldRaisedAt:0});
r.enemies=[{...e,x:p.x+SHIELD_RADIUS+ENEMIES.walker.radius+.005,y:p.y,vx:-ENEMIES.walker.speed,vy:0,attackActiveUntil:0,nextContactAttack:0}];
for(let frame=0;frame<30;frame++){r.time+=1/60;stepCombat(r,1/60);}
assert.equal(p.hp,p.maxHp);assert.equal(p.shield,12,'approaching enemy attacks shield after its windup');
assert(Math.hypot(r.enemies[0].x-p.x,r.enemies[0].y-p.y)>=SHIELD_RADIUS+ENEMIES.walker.radius-1e-9);

// Chef and Perfumer healing both remove poison, including at full HP.
for(const color of ['green','purple']){[r,p]=fixture(color);const q={...p,id:'ally',x:p.x+.04,hp:p.maxHp,maxHp:p.maxHp};r.players.push(q);applyPoison(q,10);r.enemies=[{...e,x:p.x+.06,y:p.y,hp:100,maxHp:100,attackActiveUntil:0}];assert(attack(r,p));assert.equal(q.poisonTicks,0,color+' allied heal clears poison at full HP')}
[r,p]=fixture('teal');const target={...e,x:p.x+.04,y:p.y};r.enemies=[target];p.grappleTarget=target.id;assert(grapple(r,p));assert(Math.abs(Math.hypot(target.throwing.vx,target.throwing.vy)-0.5)<1e-10);
[r,p]=fixture('lime');p.shield=1;p.holding=true;p.usingAttack=true;p.shielding=true;const friend={...p,id:'friend',x:p.x+.02,shielding:false,hp:8,maxHp:12};r.players.push(friend);applyPoison(friend,10);damagePlayer(r,p,2,()=>.4);r.time+=.2;stepCombat(r,0,()=>.4);assert.equal(friend.poisonTicks,0,'Joker healing effect clears allied poison');

[r,p]=fixture();assert(applyInput(r,p.id,{seq:1,holding:true,attack:false,aimDirection:-1}));step(r,.1);assert(p.angle<0,'server rotates toward selected side');const before=p.angle;assert(applyInput(r,p.id,{seq:2,holding:true,attack:false,aimDirection:1}));step(r,.1);assert(p.angle>before,'steering can reverse during a hold');
console.log('PASS: universal speed scaling, independent camera settings, poison timing and cure, aim lockouts, shield interception and healing integrations');
