import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {once} from 'node:events';
import {createGameServer} from './http.mjs';
let room;const server=createGameServer({onSessionCreated:r=>room=r});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`,url=base.replace('http','ws')+'/api/play';const sockets=[];
async function post(path,body={},token){const res=await fetch(base+'/api/'+path,{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});return res.json()}
function next(ws,type){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{ws.off('message',read);reject(Error('Message timeout: '+type))},2000);function read(bytes){const m=JSON.parse(bytes);if(m.type===type){clearTimeout(timer);ws.off('message',read);resolve(m)}}ws.on('message',read)})}
async function connect(token){const ws=new WebSocket(url);sockets.push(ws);await once(ws,'open');const ready=next(ws,'ready');ws.send(JSON.stringify({type:'auth',token}));await ready;return ws}
try{
 const host=await post('create',{name:'Host'});await post('start',{},host.token);const ws=await connect(host.token);const p=room.run.players[0];p.x=1.5;p.y=2.5;p.vx=0;p.vy=0;room.run.enemies=[];room.run.obstacles=[];room.run.goal=0;
 async function input(m){const waiting=next(ws,'inputAck');ws.send(JSON.stringify({type:'input',round:1,...m}));return waiting}
 assert((await input({seq:1,holding:true,attack:false})).ok);assert(p.holding);assert((await input({seq:2,holding:false,angle:0,x:100,hp:1000})).ok);assert(!p.holding);assert(p.x<2&&p.hp===p.maxHp,'client coordinates and HP cannot override authority');
 assert(!(await input({seq:1,holding:true})).ok,'out-of-order inputs rejected');assert(!(await input({seq:3,holding:true,sentAt:Date.now()-2000})).ok,'stale inputs rejected');assert.equal(p.lastProcessedInputSeq,3);
 const pong=next(ws,'pong');ws.send(JSON.stringify({type:'ping',id:7}));const result=await pong;assert.equal(result.id,7);assert(result.diagnostics);assert(result.serverNow);
 assert(!(await input({seq:4,holding:true,round:2})).ok,'wrong-round inputs rejected');
 const bad=new WebSocket(url);sockets.push(bad);await once(bad,'open');const ended=once(bad,'close');bad.send(JSON.stringify({type:'auth',token:'wrong'}));assert.equal((await ended)[0],1008,'invalid token closes connection');
 const payloadEnded=once(ws,'close');ws.send('x'.repeat(5000));assert.equal((await payloadEnded)[0],1009,'oversized payload is rejected');
 console.log('PASS: authenticated WebSocket inputs, authority, sequencing, stale/round rejection, ping and payload limits');
}finally{for(const ws of sockets)ws.terminate();await new Promise(r=>server.close(r))}
