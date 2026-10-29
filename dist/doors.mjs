import {arenaRoom} from './arena.mjs';
import {SIZE,PLAYER_RADIUS as RADIUS} from './world.mjs';
export function doorKey(a,b){return `${Math.min(a,b)}:${Math.max(a,b)}`}
export function entrances(run,a,b){return run.edges[a]?.includes(b)?(run.doors?.[doorKey(a,b)]||[[.34,.66]]):[]}
export function passable(run,a,b,position){return (arenaRoom(run,a)&&arenaRoom(run,b))||(!run.lockedRooms?.[a]&&entrances(run,a,b).some(([lo,hi])=>position>lo+RADIUS&&position<hi-RADIUS))}
