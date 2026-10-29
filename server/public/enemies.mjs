import {SPEED_MULTIPLIER} from './world.mjs';
// Normal keeps the existing Walker/Sleeper size and movement baseline.
export const ENEMIES=Object.freeze({
 warden:{name:'The Warden',hp:60,weight:'Boss',radius:.1,speed:.06*SPEED_MULTIPLIER,damage:7,rounds:[]},
 walker:{name:'Walker',hp:15,weight:'Normal',radius:.026,speed:.19*SPEED_MULTIPLIER,damage:3,rounds:[1,2,3,4,5]},
 sleeper:{name:'Sleeper',hp:12,weight:'Normal',radius:.026,speed:.13*SPEED_MULTIPLIER,damage:4,rounds:[2,4,5]},
 flapper:{name:'Flapper',hp:5,weight:'Light',radius:.026*.8,speed:.27*SPEED_MULTIPLIER,damage:2,rounds:[2,3,4,5]},
 creeper:{name:'Creeper',hp:20,weight:'Very Heavy',radius:.026*1.8,speed:.13*SPEED_MULTIPLIER,damage:5,rounds:[3,4,5]}
});
export const enemyFor=enemy=>ENEMIES[typeof enemy==='string'?enemy:enemy.type]||ENEMIES.walker;
export const enemyRadius=enemy=>enemyFor(enemy).radius;
export const eligibleEnemies=round=>Object.keys(ENEMIES).filter(type=>ENEMIES[type].rounds.includes(round));
export const SLAM_RADIUS=.084,SLAM_INTERVAL=3,SLAM_WINDUP=.6;
// Difficulty is fixed when a dungeon is created, so disconnects cannot heal enemies.
export const enemyHealthMultiplier=teamSize=>1+.3*Math.floor(Math.max(1,teamSize)/2);
export const scaledEnemyHealth=(type,teamSize)=>Math.ceil(enemyFor(type).hp*enemyHealthMultiplier(teamSize));
export const FLAPPER_TURN_INTERVAL=1;
const FLAPPER_PATTERN=[0,0,1,0,-1];
export function turnFlapper(enemy,now){
 enemy.nextDirectionAt??=now+FLAPPER_TURN_INTERVAL;
 if(now+1e-9<enemy.nextDirectionAt)return;
 enemy.nextDirectionAt=now+FLAPPER_TURN_INTERVAL;
 const turn=FLAPPER_PATTERN[(enemy.directionStep||0)%FLAPPER_PATTERN.length];enemy.directionStep=(enemy.directionStep||0)+1;
 if(turn){const vx=enemy.vx;enemy.vx=-enemy.vy*turn;enemy.vy=vx*turn}
}
