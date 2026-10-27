// Reveal the current room and each directly connected room in full.
export function visibilityPolygons(run,p){
  const x=Math.min(4,Math.max(0,Math.floor(p.x)));
  const y=Math.min(4,Math.max(0,Math.floor(p.y)));
  const room=y*5+x;
  return [room,...new Set(run.edges[room]||[])].map(id=>{
    const rx=id%5,ry=Math.floor(id/5);
    return {room:id,points:[[rx,ry],[rx+1,ry],[rx+1,ry+1],[rx,ry+1]]};
  });
}
