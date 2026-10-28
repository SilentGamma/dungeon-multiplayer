import {SPEED_MULTIPLIER} from './world.mjs';
// Normal keeps the existing Walker/Sleeper size and movement baseline.
export const ENEMIES=Object.freeze({
 walker:{name:'Walker',hp:15,weight:'Normal',radius:.026,speed:.19*SPEED_MULTIPLIER,damage:3,rounds:[1,2,3,4,5]},
 sleeper:{name:'Sleeper',hp:12,weight:'Normal',radius:.026,speed:.13*SPEED_MULTIPLIER,damage:4,rounds:[2,4,5]},
 flapper:{name:'Flapper',hp:5,weight:'Light',radius:.026*.8,speed:.27*SPEED_MULTIPLIER,damage:2,rounds:[2,3,4,5]},
 creeper:{name:'Creeper',hp:20,weight:'Very Heavy',radius:.026*1.5,speed:.13*SPEED_MULTIPLIER,damage:5,rounds:[3,4,5]}
});
export const enemyFor=enemy=>ENEMIES[typeof enemy==='string'?enemy:enemy.type]||ENEMIES.walker;
export const enemyRadius=enemy=>enemyFor(enemy).radius;
export const eligibleEnemies=round=>Object.keys(ENEMIES).filter(type=>ENEMIES[type].rounds.includes(round));
export const SLAM_RADIUS=.07,SLAM_INTERVAL=3,SLAM_WINDUP=.6;
