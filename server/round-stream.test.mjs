import assert from 'node:assert/strict';
import {createGameServer} from './http.mjs';
let room;const server=createGameServer({onSessionCreated:r=>room=r});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;const controller=new AbortController();
async function post(path,body={},token=''){const res=await fetch(base+'/api/'+path,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});assert(res.ok);return res.json()}
try {
 const host=await post('create',{name:'A'});const response=await fetch(base+'/api/events',{headers:{authorization:'Bearer '+host.token},signal:controller.signal});const reader=response.body.getReader(),decoder=new TextDecoder();let pending='';
 async function nextEvent(){for(;;){const i=pending.indexOf('\n\n');if(i>=0){const line=pending.slice(0,i);pending=pending.slice(i+2);if(line.startsWith('data: '))return JSON.parse(line.slice(6))}const {value,done}=await reader.read();assert(!done);pending+=decoder.decode(value,{stream:true})}}
 await nextEvent();await post('start',{},host.token);let first;do{first=await nextEvent()}while(first.phase!=='playing');assert.equal(first.run.round,1);
 room.run.players[0].arrived=true;
 let second;do{second=await nextEvent()}while(!(second.phase==='playing'&&second.run?.round===2));
 assert(second.run.edges&&second.run.doors,'new round sends the full dungeon');assert.equal(second.run.players[0].hp,second.run.players[0].maxHp);
 room.run.round=5;room.run.players[0].arrived=true;let boss;do{boss=await nextEvent()}while(!(boss.phase==='playing'&&boss.run?.kind==='boss'));assert(boss.run.arena.width===4);room.run.enemies.find(e=>e.type==='warden').hp=0;let completed;do{completed=await nextEvent()}while(completed.phase!=='completed');assert.equal(completed.endReason,'won');assert.equal(room.closed,false);controller.abort();console.log('PASS: stream delivers complete new dungeons and final victory without ejecting players');
} finally {controller.abort();server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
