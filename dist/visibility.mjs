import {arenaRoom} from './arena.mjs';
import {SIZE} from './world.mjs';
// Reveal the current room and each directly connected room in full.
export function visibilityPolygons(run,p){
  const x=Math.min(SIZE-1,Math.max(0,Math.floor(p.x)));
  const y=Math.min(SIZE-1,Math.max(0,Math.floor(p.y)));
  const room=y*SIZE+x;
  const rooms=arenaRoom(run,room)?run.edges.map((_,i)=>i).filter(i=>arenaRoom(run,i)):[room,...new Set(run.edges[room]||[])];
  return rooms.map(id=>{
    const rx=id%SIZE,ry=Math.floor(id/SIZE);
    return {room:id,points:[[rx,ry],[rx+1,ry],[rx+1,ry+1],[rx,ry+1]]};
  });
}
