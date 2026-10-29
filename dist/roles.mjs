import {SPEED_MULTIPLIER} from './world.mjs';
// Initial values from the player role specification; distances use player diameter.
export const ROLES=Object.freeze({
 coral:{name:'Brawler',hp:12,shield:10,speedClass:'Normal',speed:8*SPEED_MULTIPLIER,damage:5,cooldown:.15,shape:'medium-circle'},
 purple:{name:'Perfumer',hp:10,shield:8,speedClass:'Slow',speed:6*SPEED_MULTIPLIER,damage:4,cooldown:.18,shape:'long-cone',single:true},
 pink:{name:'Dancer',hp:12,shield:5,speedClass:'Fast',speed:10*SPEED_MULTIPLIER,damage:7,cooldown:.25,shape:'rectangle'},
 gold:{name:'Brute',hp:16,shield:20,speedClass:'Slow',speed:6*SPEED_MULTIPLIER,damage:10,cooldown:.75,shape:'disjoint-circle'},
 green:{name:'Chef',hp:12,shield:15,speedClass:'Slow',speed:6*SPEED_MULTIPLIER,damage:3,cooldown:.3,shape:'curved-cone'},
 blue:{name:'Sniper',description:'Hold attack to stop and rotate your scope at 20% speed. Release to fire a narrow rectangular shot and resume moving.',hp:10,shield:4,speedClass:'Normal',speed:8*SPEED_MULTIPLIER,damage:10,cooldown:1,shape:'sniper-rectangle',single:true},
 teal:{name:'Wrestler',description:'Attack to lunge forward with your shield and grab on contact. A caught target circles you; release to throw in the direction of its spin. A missed lunge stops you and lowers your shield. Requires shield.',hp:14,shield:12,speedClass:'Fast',speed:10*SPEED_MULTIPLIER,damage:2,cooldown:.2,shape:'small-circle',single:true},
 lime:{name:'Joker',hp:8,shield:1,speedClass:'Very Fast',speed:12*SPEED_MULTIPLIER,damage:9,cooldown:.15,shape:'small-cone'}
});
export const roleFor=color=>ROLES[color]||ROLES.green;
export const WIDTH=.035;
// Shared dimensions for both the visible indicator and collision checks.
export function attackGeometry(color){const shape=roleFor(color).shape;if(shape==='medium-circle')return {kind:'circle',x:0,radius:2*WIDTH};if(shape==='small-circle')return {kind:'circle',x:0,radius:WIDTH};if(shape==='disjoint-circle')return {kind:'circle',x:3*WIDTH,radius:2*WIDTH};if(shape==='rectangle'||shape==='sniper-rectangle')return {kind:'rectangle',length:(shape==='rectangle'?4:10.8)*WIDTH,halfWidth:(shape==='rectangle'?1:.5)*WIDTH};const [range,degrees]=shape==='long-cone'?[6,60]:shape==='curved-cone'?[4,90]:[2,45];return {kind:'cone',radius:range*WIDTH,halfAngle:degrees*Math.PI/360}}
export function inAttack(p,target,radius=0){const g=attackGeometry(p.color),dx=target.x-p.x,dy=target.y-p.y,a=p.angle||0,f=dx*Math.cos(a)+dy*Math.sin(a),side=-dx*Math.sin(a)+dy*Math.cos(a),d=Math.hypot(f,side);if(g.kind==='circle')return Math.hypot(f-g.x,side)<=g.radius+radius;if(g.kind==='rectangle')return Math.hypot(f-Math.max(0,Math.min(g.length,f)),Math.max(0,Math.abs(side)-g.halfWidth))<=radius;if(d<=radius)return true;const angle=Math.abs(Math.atan2(side,f));if(angle<=g.halfAngle)return d<=g.radius+radius;const x=Math.cos(g.halfAngle),y=Math.sin(g.halfAngle),projection=Math.max(0,Math.min(g.radius,f*x+Math.abs(side)*y));return Math.hypot(f-x*projection,Math.abs(side)-y*projection)<=radius}
// Attack aiming rotates at 20% of the normal launch-aim speed for Sniper.
export function advanceAim(run,p,dt,rate=3.6*SPEED_MULTIPLIER){p.angle+=(p.aimDirection===-1?-1:1)*rate*dt*(p.color==='blue'&&p.usingAttack?.2:1)}
