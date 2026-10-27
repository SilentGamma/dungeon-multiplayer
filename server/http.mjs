import http from 'node:http';
import {randomBytes,randomInt} from 'node:crypto';
import {Session} from './session.mjs';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const publicDir=fileURLToPath(new URL('./public/',import.meta.url));

// Development transport. The process owns sessions and ticks; clients never
// supply game state. A production deployment requires durable room routing.
export function createGameServer(){
 const rooms=new Map(),credentials=new Map(),streams=new Map(),connections=new Map();
 const reply=(res,status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body))};
 const token=()=>randomBytes(24).toString('hex');
 function code(){for(let i=0;i<100;i++){const value=String(randomInt(1000000)).padStart(6,'0');if(!rooms.has(value))return value}throw Error('Unable to allocate a lobby.')}
 const publish=(id)=>{const room=rooms.get(id),group=streams.get(id);if(!room||!group)return;const data=`data: ${JSON.stringify(room.snapshot())}\n\n`;for(const res of group)if(!res.write(data))res.destroy()};
 const server=http.createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://localhost');if(req.method==='GET'&&url.pathname==='/health')return reply(res,200,{ok:true});if(req.method==='GET'&&url.pathname==='/api/rooms')return reply(res,200,{rooms:[...rooms.values()].filter(r=>r.visibility==='public'&&r.phase==='lobby'&&!r.closed&&r.players.length<8).map(r=>({code:r.code,name:r.players[0]?.name+'’s lobby',count:r.players.length}))});
   const key=(req.headers.authorization||'').replace(/^Bearer /,'');const auth=credentials.get(key);
   if(req.method==='GET'&&url.pathname==='/api/events'){
    if(!auth)return reply(res,401,{error:'Unauthorized'});const room=rooms.get(auth.code);if(!room)return reply(res,404,{error:'Lobby closed'});
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Accel-Buffering':'no'});if(!streams.has(auth.code))streams.set(auth.code,new Set());streams.get(auth.code).add(res);connections.set(key,(connections.get(key)||0)+1);res.write(`data: ${JSON.stringify(room.snapshot())}\n\n`);req.on('close',()=>{streams.get(auth.code)?.delete(res);connections.set(key,Math.max(0,(connections.get(key)||1)-1));setTimeout(()=>{if((connections.get(key)||0)===0&&credentials.has(key)){room.leave(auth.id);credentials.delete(key);connections.delete(key);publish(auth.code)}},5000)});return;
   }
   if(req.method==='GET'&&!url.pathname.startsWith('/api/')){const file=path.basename(url.pathname==='/'?'index.html':url.pathname);if(!/^[\w.-]+$/.test(file))return reply(res,404,{error:'Not found'});try{const bytes=await readFile(path.join(publicDir,file));res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8','X-Content-Type-Options':'nosniff'});return res.end(bytes)}catch{return reply(res,404,{error:'Not found'})}}if(req.method!=='POST')return reply(res,404,{error:'Not found'});
   let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)return reply(res,413,{error:'Request too large'})}const body=raw?JSON.parse(raw):{};
   if(url.pathname==='/api/create'||url.pathname==='/api/join'){
    const id=token(),key=token();let room;
    if(url.pathname==='/api/create'){if(rooms.size>=100)return reply(res,503,{error:'Server is full'});const roomCode=code();room=new Session({code:roomCode,visibility:body.visibility==='public'?'public':'private'});rooms.set(roomCode,room)}else room=rooms.get(String(body.code));
    if(!room)return reply(res,404,{error:'Lobby not found'});const player=room.join({id,name:body.name});credentials.set(key,{id,code:room.code});publish(room.code);return reply(res,200,{token:key,player,code:room.code,state:room.snapshot()});
   }
   if(!auth)return reply(res,401,{error:'Unauthorized'});const room=rooms.get(auth.code);if(!room)return reply(res,404,{error:'Lobby closed'});
   let ok=false;if(url.pathname==='/api/role')ok=room.choose(auth.id,body.color);else if(url.pathname==='/api/start')ok=room.start(auth.id);else if(url.pathname==='/api/input')ok=room.input(auth.id,body);else if(url.pathname==='/api/leave'){ok=room.leave(auth.id);credentials.delete(key)}else return reply(res,404,{error:'Not found'});
   publish(auth.code);return reply(res,ok?200:409,{ok,state:room.snapshot()});
  }catch(error){return reply(res,400,{error:error.message})}
 });
 let last=performance.now(),lastBroadcast=last;const timer=setInterval(()=>{const now=performance.now(),dt=(now-last)/1000;last=now;for(const [id,room] of rooms){room.tick(dt);if(room.closed&&!room._finishedAt)room._finishedAt=now;if(room._finishedAt&&now-room._finishedAt>30000){for(const res of streams.get(id)||[])res.end();streams.delete(id);rooms.delete(id);for(const [key,auth] of credentials)if(auth.code===id)credentials.delete(key)}}if(now-lastBroadcast>=50){for(const id of streams.keys())publish(id);lastBroadcast=now}},1000/60);
 server.on('close',()=>{clearInterval(timer);for(const group of streams.values())for(const res of group)res.end()});
 return server;
}
