// Sketch-derived prototypes. Coordinates are cells in a 9×9 room; doors are separate ports.
export const ROOM_GRID=9,POT_DOTS=5,DIRECTIONS=['N','E','S','W'];
const rect=(x,y,w,h)=>Array.from({length:h},(_,j)=>Array.from({length:w},(_,i)=>[x+i,y+j])).flat();
const unique=cells=>[...new Map(cells.map(p=>[p.join(','),p])).values()];
export const ROOM_BLUEPRINTS=[
 {id:'key-chamber',kind:'key',name:'Walled chamber',sketch:1,ports:[['W',4]],walls:unique([...rect(2,1,1,7),...rect(3,4,2,1),...rect(4,1,3,1),...rect(6,2,1,5),...rect(4,7,3,1)]),spikes:[],walkers:[],key:[5,4]},
 {id:'key-thorn-lane',kind:'key',name:'Thorn lane',sketch:2,ports:[['W',4],['E',4],['S',4]],walls:[...rect(1,3,1,3),...rect(7,3,1,3),...rect(3,7,3,1)],spikes:[...rect(3,1,1,6),...rect(5,1,1,6)],walkers:[],key:[4,6]},
 {id:'key-diagonal',kind:'key',name:'Broken diagonal',sketch:3,ports:[['W',4],['E',4]],walls:[[1,1],[2,2],[3,3],[5,5],[6,6],[7,7]],spikes:[[4,4]],walkers:[[7,1],[1,7]],key:[4,6]},
 {id:'key-corners',kind:'key',name:'Divided corners',sketch:4,ports:[['N',4],['E',4],['S',4],['W',4]],walls:[[6,1],[7,1],[7,2],[1,6],[2,6],[2,7]],spikes:[[1,1],[2,1],[1,2],[2,2],[6,5],[7,5],[6,6],[7,6]],walkers:[[6,2],[1,7]],key:[4,4]},
 {id:'regular-barricade',kind:'regular',name:'Wall and thorns',sketch:1,ports:[['W',3],['E',3]],walls:rect(1,2,7,1),spikes:rect(1,6,7,1),walkers:[],key:null},
 {id:'regular-pillar',kind:'regular',name:'Lone pillar',sketch:2,ports:[['W',4]],walls:rect(4,2,1,5),spikes:[],walkers:[],key:null},
 {id:'regular-elbow',kind:'regular',name:'Stone elbow',sketch:3,ports:[['N',4],['W',4],['S',5]],walls:unique([...rect(6,2,1,5),...rect(2,6,5,1)]),spikes:[[2,2]],walkers:[],key:null},
 {id:'regular-corners',kind:'regular',name:'Opposed corners',sketch:4,ports:[['N',4],['E',4],['S',4],['W',4]],walls:[[6,2],[2,6]],spikes:[[2,2],[6,6]],walkers:[],key:null}
];
export function rotateCell([x,y],turns=1){for(let n=0;n<((turns%4)+4)%4;n++)[x,y]=[8-y,x];return [x,y]}
export function rotatePort([side,slot],turns=1){for(let n=0;n<((turns%4)+4)%4;n++){if(side==='E'||side==='W')slot=8-slot;side=DIRECTIONS[(DIRECTIONS.indexOf(side)+1)%4]}return [side,slot]}
export function orientBlueprint(source,turns=0){return {...source,turns:((turns%4)+4)%4,walls:source.walls.map(p=>rotateCell(p,turns)),spikes:source.spikes.map(p=>rotateCell(p,turns)),walkers:source.walkers.map(p=>rotateCell(p,turns)),key:source.key?rotateCell(source.key,turns):null,ports:source.ports.map(p=>rotatePort(p,turns)),adapted:false}}
export function fitBlueprint(kind,sides,entry='W',preferredId=null){const set=[...new Set(sides)].filter(s=>DIRECTIONS.includes(s));if(!set.length||!set.includes(entry))throw Error('Entry must be an actual room door.');const source=ROOM_BLUEPRINTS.find(b=>b.id===preferredId&&b.kind===kind&&b.ports.length===set.length)||ROOM_BLUEPRINTS.find(b=>b.kind===kind&&b.ports.length===set.length);if(!source)throw Error('No room for this door count.');const desired=(DIRECTIONS.indexOf(entry)-DIRECTIONS.indexOf('W')+4)%4;const matches=[];for(let t=0;t<4;t++){const b=orientBlueprint(source,t);if(b.ports.every(([s])=>set.includes(s)))matches.push(b)}if(matches.length)return matches.find(b=>b.turns===desired)||matches[0];const b=orientBlueprint(source,desired);b.ports=set.map(side=>[side,b.ports.find(p=>p[0]===side)?.[1]??4]);b.adapted=true;return b}
export function portPoint([side,slot],inset=0){const t=(slot+.5)/ROOM_GRID;return side==='N'?{x:t,y:inset}:side==='E'?{x:1-inset,y:t}:side==='S'?{x:t,y:1-inset}:{x:inset,y:t}}
export function blueprintObstacles(b,room=0,width=7){const x=room%width,y=Math.floor(room/width);return [...b.walls.map(p=>[p,'wall']),...b.spikes.map(p=>[p,'spikes'])].map(([[col,row],type],i)=>({id:`${b.id}-${room}-${i}`,room,type,x:x+col/9,y:y+row/9,size:1/9,col,row}))}
export function circleTouchesBox(p,r,o){const x=Math.max(o.x,Math.min(o.x+o.size,p.x)),y=Math.max(o.y,Math.min(o.y+o.size,p.y));return (p.x-x)**2+(p.y-y)**2<=(r*r)+1e-12}
export function potAnchors(bounds={x:0,y:0,width:1,height:1}){return Array.from({length:25},(_,i)=>({slot:i,row:Math.floor(i/5),col:i%5,x:bounds.x+(i%5+1)*bounds.width/6,y:bounds.y+(Math.floor(i/5)+1)*bounds.height/6}))}
export function placeGridPots({bounds={x:0,y:0,width:1,height:1},obstacles=[],avoid=[],doors=[],existing=[],clusters=3,radius=.032,random=Math.random,room=0,idPrefix='grid-pot'}={}){const candidates=potAnchors(bounds),result=[],slots=[];const buffer=.02,offset=.038;
 const safe=p=>p.x-radius>bounds.x+.025&&p.x+radius<bounds.x+bounds.width-.025&&p.y-radius>bounds.y+.025&&p.y+radius<bounds.y+bounds.height-.025&&!obstacles.some(o=>circleTouchesBox(p,radius+buffer,o))&&!avoid.some(a=>Math.hypot(a.x-p.x,a.y-p.y)<radius+(a.radius??.1))&&!doors.some(a=>Math.hypot(a.x-p.x,a.y-p.y)<.14)&&![...existing,...result].some(o=>Math.hypot(o.x-p.x,o.y-p.y)<radius*2+.012);
 for(let i=candidates.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]]}
 for(const anchor of candidates){if(slots.length>=clusters)break;const horizontal=[{x:anchor.x-offset,y:anchor.y},{x:anchor.x+offset,y:anchor.y}],vertical=[{x:anchor.x,y:anchor.y-offset},{x:anchor.x,y:anchor.y+offset}],variants=random()<.5?[horizontal,vertical]:[vertical,horizontal];let group=null;if(random()<.45)group=variants.find(pair=>pair.every(safe));if(!group&&safe(anchor))group=[{x:anchor.x,y:anchor.y}];if(!group)continue;slots.push(anchor.slot);for(const [i,p] of group.entries())result.push({id:`${idPrefix}-${room}-${anchor.slot}-${i}`,kind:'pot',room,x:p.x,y:p.y,hp:1,vx:0,vy:0,potSlot:anchor.slot,potCount:group.length,anchorX:anchor.x,anchorY:anchor.y})}
 return result;
}
export function previewPots(b,seed=Math.floor(Math.random()*4294967296),clusters=null){let state=seed>>>0;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);const avoid=[...(b.key?[{x:(b.key[0]+.5)/9,y:(b.key[1]+.5)/9,radius:.08}]:[]),...b.walkers.map(([x,y])=>({x:(x+.5)/9,y:(y+.5)/9,radius:.05}))];return placeGridPots({obstacles:blueprintObstacles(b),avoid,doors:b.ports.map(p=>portPoint(p,.03)),random,clusters:clusters??Math.floor(random()*4)})}

// Orient from the spawn-rooted approach. Shared edge openings remain authoritative:
// their sides, widths and one/two/three-column gaps are never rewritten here.
export function generateRoomLayouts({edges,startRoom,goal,keyRooms=[],mapRoom},width=7){
 const parents=new Map([[startRoom,null]]),queue=[startRoom];
 for(let i=0;i<queue.length;i++)for(const next of edges[queue[i]])if(!parents.has(next)){parents.set(next,queue[i]);queue.push(next)}
 const side=(room,next)=>next===room-width?'N':next===room+1?'E':next===room+width?'S':'W';
 const roomLayouts={},obstacles=[],keys=new Map();
 for(const room of queue){if(room===startRoom||room===goal)continue;
  const entry=side(room,parents.get(room)),b=fitBlueprint(keyRooms.includes(room)?'key':'regular',edges[room].map(n=>side(room,n)),entry);
  const point=([x,y])=>({x:room%width+(x+.5)/9,y:Math.floor(room/width)+(y+.5)/9});
  roomLayouts[room]={id:b.id,turns:b.turns,entry,adapted:b.adapted,walkers:b.walkers.map(point)};
  obstacles.push(...blueprintObstacles(b,room,width));if(b.key)keys.set(room,{room,...point(b.key)});
 }
 const keyItems=keyRooms.map(room=>keys.get(room));let mapItem=null;
 if(mapRoom>=0){const origin={x:mapRoom%width,y:Math.floor(mapRoom/width)},key=keys.get(mapRoom);
  const candidates=Array.from({length:81},(_,i)=>({room:mapRoom,x:origin.x+(i%9+.5)/9,y:origin.y+(Math.floor(i/9)+.5)/9}));
  candidates.sort((a,b)=>Math.hypot(a.x-origin.x-.5,a.y-origin.y-.5)-Math.hypot(b.x-origin.x-.5,b.y-origin.y-.5));
  mapItem=candidates.find(p=>!obstacles.some(o=>o.room===mapRoom&&circleTouchesBox(p,.065,o))&&(!key||Math.hypot(p.x-key.x,p.y-key.y)>.16));
  if(!mapItem)throw Error('Room layout needs a safe map pickup space');
 }
 return {roomLayouts,obstacles,keyItems,mapItem};
}
