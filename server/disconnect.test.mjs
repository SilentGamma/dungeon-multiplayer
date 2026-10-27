import assert from 'node:assert/strict';
import {createGameServer} from './http.mjs';
const server=createGameServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
async function post(path,body={},token=''){const res=await fetch(base+'/api/'+path,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});return res.json()}
const controller=new AbortController();
try{
 const host=await post('create',{name:'Host'}),guest=await post('join',{name:'Guest',code:host.code});
 const stream=await fetch(base+'/api/events',{headers:{authorization:'Bearer '+guest.token},signal:controller.signal});
 const reader=stream.body.getReader();await reader.read();
 await post('start',{},host.token);controller.abort();
 await new Promise(resolve=>setTimeout(resolve,5500));
 const result=await post('role',{color:'green'},host.token);
 assert.equal(result.state.phase,'playing');assert(result.state.run.players.find(p=>p.id===guest.player.id).deceased);
 console.log('PASS: actual stream disconnect marks deceased without closing the run');
} finally {controller.abort();server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
