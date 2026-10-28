import {WebSocketServer} from 'ws';
// Inputs only. Existing personalized state streams remain the authority.
export function attachInputSockets(server,{credentials,rooms,diagnostics}){
 const wss=new WebSocketServer({noServer:true,maxPayload:4096,perMessageDeflate:false});
 server.on('upgrade',(req,socket,head)=>{
  let url,origin;try{url=new URL(req.url,'http://localhost');origin=req.headers.origin?new URL(req.headers.origin).host:null}catch{socket.destroy();return}if(url.pathname!=='/api/play'||(origin&&origin!==req.headers.host)){socket.destroy();return}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws));
 });
 wss.on('connection',ws=>{
  let key=null,windowStart=Date.now(),count=0;ws.alive=true;ws.on('pong',()=>ws.alive=true);ws.on('error',()=>{});
  const timeout=setTimeout(()=>ws.close(1008,'Authentication required'),5000);timeout.unref();
  const send=data=>{if(ws.readyState!==1)return;if(ws.bufferedAmount>65536){ws.close(1013,'Slow connection');return}ws.send(JSON.stringify(data))};
  ws.on('message',bytes=>{try{
   const now=Date.now();if(now-windowStart>=1000){windowStart=now;count=0}if(++count>120){ws.close(1008,'Too many inputs');return}
   const m=JSON.parse(bytes.toString());if(!key){if(m.type!=='auth'||!credentials.has(m.token)){ws.close(1008,'Unauthorized');return}key=m.token;clearTimeout(timeout);send({type:'ready',serverNow:now});return}
   const auth=credentials.get(key),room=auth&&rooms.get(auth.code);if(!room){ws.close(1008,'Session ended');return}
   if(m.type==='ping'){send({type:'pong',id:m.id,serverNow:now,diagnostics:diagnostics.snapshot()});return}
   if(m.type!=='input')return;const ok=room.input(auth.id,m);send({type:'inputAck',seq:m.seq,ok,round:room.run?.round});
  }catch{ws.close(1007,'Invalid message')}});
  ws.on('close',()=>clearTimeout(timeout));
 });
 const heartbeat=setInterval(()=>{for(const ws of wss.clients){if(!ws.alive){ws.terminate();continue}ws.alive=false;ws.ping()}},30000);heartbeat.unref();
 server.on('close',()=>{clearInterval(heartbeat);for(const ws of wss.clients)ws.terminate();wss.close()});
 return wss;
}
