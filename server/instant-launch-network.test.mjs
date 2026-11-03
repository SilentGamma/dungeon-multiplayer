import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {createGameServer} from './http.mjs';
let session;const server=createGameServer({onSessionCreated:s=>session=s});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;let socket;
async function post(route,body={},token){const response=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});return {status:response.status,...await response.json()}}
function socketReply(message,type){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Socket reply timed out')),3000);const listener=bytes=>{const data=JSON.parse(bytes);if(data.type===type){clearTimeout(timer);socket.off('message',listener);resolve(data)}};socket.on('message',listener);socket.send(JSON.stringify(message))})}
try{
 const host=await post('create',{name:'Host',visibility:'private'}),guest=await post('join',{name:'Guest',code:host.code});await post('ready',{ready:true},host.token);await post('ready',{ready:true},guest.token);const started=await post('start',{},host.token);assert.equal(started.status,200);const players=started.state.run.players;assert.equal(players.find(p=>p.id===host.player.id).maxHp,14.4);assert.equal(players.find(p=>p.id===guest.player.id).maxHp,12);
 socket=new WebSocket(base.replace('http','ws')+'/api/play');await new Promise((resolve,reject)=>{socket.once('open',resolve);socket.once('error',reject)});assert.equal((await socketReply({type:'auth',token:guest.token},'ready')).type,'ready');
 assert.equal((await post('input',{seq:1,holding:false,attack:false,launch:true,angle:Math.PI/2,round:1},host.token)).status,200);
 assert((await socketReply({type:'input',seq:1,holding:false,launch:true,angle:0,round:1},'inputAck')).ok);
 const h=session.run.players.find(p=>p.id===host.player.id),g=session.run.players.find(p=>p.id===guest.player.id);assert(!h.holding&&!g.holding);assert(!h.awaitingLaunch&&!g.awaitingLaunch);assert(Math.abs(h.vx)<1e-8&&h.vy>0);assert(g.vx>0&&Math.abs(g.vy)<1e-8);
 const guestAngle=g.angle;assert(!(await socketReply({type:'input',seq:1,holding:false,launch:true,angle:3,round:1},'inputAck')).ok);assert.equal(g.angle,guestAngle,'duplicate click cannot change peer direction');
 const resumed=await post('resume',{},guest.token);assert.equal(resumed.state.run.players.length,2);assert.equal(resumed.state.run.players.find(p=>p.id===host.player.id).maxHp,14.4);assert.equal(resumed.state.run.players.find(p=>p.id===guest.player.id).maxHp,12);
 console.log('PASS: 20% health and independent one-packet click launches over HTTP and authenticated WebSocket, shared snapshots and duplicate rejection');
}finally{socket?.terminate();server.closeAllConnections();await new Promise(r=>server.close(r))}
