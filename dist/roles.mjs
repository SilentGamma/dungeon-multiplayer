// Initial values from the player role specification; distances use player diameter.
export const ROLES=Object.freeze({
 coral:{name:'Brawler',hp:12,shield:10,speed:8,damage:5,cooldown:.15,shape:'medium-circle'},
 purple:{name:'Perfumer',hp:10,shield:8,speed:8,damage:4,cooldown:.18,shape:'long-cone',single:true},
 pink:{name:'Dancer',hp:12,shield:5,speed:10,damage:7,cooldown:.25,shape:'rectangle'},
 gold:{name:'Brute',hp:16,shield:20,speed:6,damage:10,cooldown:.75,shape:'disjoint-circle'},
 green:{name:'Chef',hp:12,shield:15,speed:6,damage:3,cooldown:.3,shape:'curved-cone'},
 blue:{name:'Sniper',description:'Hold attack to stop and rotate your scope at half speed. Release to fire a narrow rectangular shot and resume moving.',hp:10,shield:4,speed:10,damage:10,cooldown:1,shape:'sniper-rectangle',single:true},
 teal:{name:'Wrestler',description:'Attack to lunge forward with your shield and grab on contact. A caught target circles you; release to throw in the direction of its spin. A missed lunge stops you and lowers your shield. Requires shield.',hp:14,shield:12,speed:12,damage:2,cooldown:.2,shape:'small-circle',single:true},
 lime:{name:'Joker',hp:8,shield:1,speed:12,damage:9,cooldown:.15,shape:'small-cone'}
});
export const roleFor=color=>ROLES[color]||ROLES.green;
export const WIDTH=.035;
export function inAttack(p,target){const r=roleFor(p.color),dx=(target.x-p.x)/WIDTH,dy=(target.y-p.y)/WIDTH,a=p.angle||0,f=dx*Math.cos(a)+dy*Math.sin(a),side=-dx*Math.sin(a)+dy*Math.cos(a),d=Math.hypot(dx,dy);switch(r.shape){case 'medium-circle':return d<=2;case 'small-circle':return d<=1;case 'disjoint-circle':return Math.hypot(f-3,side)<=2;case 'sniper-rectangle':return f>=0&&f<=10.8&&Math.abs(side)<=.5;case 'rectangle':return f>=0&&f<=4&&Math.abs(side)<=1;default:{const [range,angle]=r.shape==='long-cone'?[6,60]:r.shape==='skinny-cone'?[10,15]:r.shape==='curved-cone'?[4,90]:[2,45];return d<=range&&f>=0&&Math.abs(Math.atan2(side,f))<=angle*Math.PI/360}}}
// Attack aiming rotates at half the normal launch-aim speed for Sniper.
export function advanceAim(run,p,dt,rate=3.6){p.angle+=rate*dt*(p.color==='blue'&&p.usingAttack?.5:1)}
