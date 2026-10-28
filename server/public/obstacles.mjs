import {SIZE} from './world.mjs';
export function generateObstacles(edges,enemyRooms,startRoom,goal,random=Math.random){
 const obstacles=[];
 for(let room=0;room<edges.length;room++){
  if(!edges[room].length||room===startRoom||room===goal)continue;
  const slots=[[.25,.25],[.75,.25],[.25,.75],[.75,.75]];
  for(let i=slots.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]]}
  const count=enemyRooms[room]?(random()<.4?0:1+Math.floor(random()*2)):3+Math.floor(random()*2);
  for(let i=0;i<count;i++){const [x,y]=slots[i],size=.13+random()*.025;obstacles.push({id:`obstacle-${room}-${i}`,room,type:random()<.5?'wall':'spikes',x:room%SIZE+x-size/2,y:Math.floor(room/SIZE)+y-size/2,size})}
 }
 return obstacles;
}
const indexes=new WeakMap();
export function obstaclesInRoom(run,room){const source=run.obstacles||[];let cache=indexes.get(run);if(!cache||cache.source!==source||cache.length!==source.length){const rooms=Array.from({length:SIZE*SIZE},()=>[]);for(const o of source)rooms[o.room]?.push(o);cache={source,length:source.length,rooms};indexes.set(run,cache)}return cache.rooms[room]||[]}
export function touchesSquare(entity,radius,o){const x=Math.max(o.x,Math.min(o.x+o.size,entity.x)),y=Math.max(o.y,Math.min(o.y+o.size,entity.y));return (entity.x-x)**2+(entity.y-y)**2<=radius*radius}
export function resolveWalls(run,entity,oldX,oldY,radius){
 let xHit=false,yHit=false;const room=Math.floor(entity.y)*SIZE+Math.floor(entity.x);
 for(const o of obstaclesInRoom(run,room)){
  if(o.type!=='wall'||!touchesSquare(entity,radius,o))continue;
  if(oldX<=o.x-radius){entity.x=o.x-radius;xHit=true}else if(oldX>=o.x+o.size+radius){entity.x=o.x+o.size+radius;xHit=true}
  else if(oldY<=o.y-radius){entity.y=o.y-radius;yHit=true}else if(oldY>=o.y+o.size+radius){entity.y=o.y+o.size+radius;yHit=true}
  else {const sides=[[Math.abs(entity.x-(o.x-radius)),'x',o.x-radius],[Math.abs(entity.x-(o.x+o.size+radius)),'x',o.x+o.size+radius],[Math.abs(entity.y-(o.y-radius)),'y',o.y-radius],[Math.abs(entity.y-(o.y+o.size+radius)),'y',o.y+o.size+radius]].sort((a,b)=>a[0]-b[0]);entity[sides[0][1]]=sides[0][2];if(sides[0][1]==='x')xHit=true;else yHit=true}
 }
 return {xHit,yHit};
}
export function wallBlocksLine(run,a,b){
 const rooms=new Set([Math.floor(a.y)*SIZE+Math.floor(a.x),Math.floor(b.y)*SIZE+Math.floor(b.x)]);
 for(const room of rooms)for(const o of obstaclesInRoom(run,room)){
  if(o.type!=='wall')continue;let low=0,high=1;
  for(const axis of ['x','y']){const delta=b[axis]-a[axis];if(Math.abs(delta)<1e-12){if(a[axis]<o[axis]||a[axis]>o[axis]+o.size){low=2;break}}else{const x=(o[axis]-a[axis])/delta,y=(o[axis]+o.size-a[axis])/delta;low=Math.max(low,Math.min(x,y));high=Math.min(high,Math.max(x,y))}}
  if(low<=high)return true;
 }
 return false;
}
