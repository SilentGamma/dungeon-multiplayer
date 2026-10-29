import {createRun} from '../dist/dungeon.mjs';
import {frameFor} from './protocol.mjs';
const colors=['coral','purple','pink','gold','green','blue','teal','lime'];
const run=createRun(colors.map((color,i)=>({id:'p'+i,name:'Player '+i,color})));run.time=10;
run.players.forEach((p,i)=>Object.assign(p,{x:1.4+i*.01,y:2.5,vx:.123456789,vy:.0987654321}));
run.enemies=Array.from({length:12},(_,i)=>({id:'e'+i,type:'walker',room:15,hp:15,maxHp:15,mode:'walking',active:true,x:1.2+i*.02,y:2.3,vx:.123456789,vy:.0987654321}));
const cache=new Map(),room={run};let total=0;for(let i=0;i<30;i++){run.time+=.1;for(const e of [...run.players,...run.enemies]){e.x+=e.vx*.1;e.y+=e.vy*.1}total+=Buffer.byteLength(JSON.stringify(frameFor(room,'p0',cache)))}console.log(JSON.stringify({scenario:'8 nearby players, 12 enemies, 30 snapshots',averageBytes:total/30}));
