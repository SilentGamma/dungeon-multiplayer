import {SIZE} from './world.mjs';
const tileBounds=Array.from({length:SIZE*SIZE},(_,room)=>({x:room%SIZE,y:Math.floor(room/SIZE),width:1,height:1}));
export const tileOf=p=>Math.floor(p.y)*SIZE+Math.floor(p.x);
export function arenaRoom(run,room){const a=run.arena;if(!a)return false;const x=room%SIZE,y=Math.floor(room/SIZE);return x>=a.x&&x<a.x+a.width&&y>=a.y&&y<a.y+a.height}
export const inArena=(run,p)=>arenaRoom(run,tileOf(p));
export function roomBounds(run,room){return arenaRoom(run,room)?run.arena:tileBounds[room]}
export const sameArea=(run,a,b)=>tileOf(a)===tileOf(b)||(inArena(run,a)&&inArena(run,b));
export function bossLayout(){
 const arena={x:1,y:1,width:4,height:4},startRoom=36,edges=Array.from({length:SIZE*SIZE},()=>[]),doors={};
 const connect=(a,b,gap)=>{edges[a].push(b);edges[b].push(a);doors[`${Math.min(a,b)}:${Math.max(a,b)}`]=gap};
 for(let y=1;y<5;y++)for(let x=1;x<5;x++){const r=y*SIZE+x;if(x<4)connect(r,r+1,[[0,1]]);if(y<4)connect(r,r+SIZE,[[0,1]])}
 connect(startRoom,29,[[.25,.75]]);
 return {kind:'boss',arena,startRoom,edges,doors,goal:-1,mapRoom:-1,mapCollected:false,enemyRooms:Array(SIZE*SIZE).fill(false),obstacles:[],minPathTiles:0};
}
