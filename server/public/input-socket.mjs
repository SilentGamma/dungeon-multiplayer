// A failed/slow socket never queues actions for later playback.
export function createInputSocket({url,token,fallback,onAck=()=>{},WebSocketImpl=globalThis.WebSocket}){
 let socket=null,ready=false,closed=false,retry=null,delay=500,nextProbe=0;const probes=new Map();
 function clearProbes(){for(const p of probes.values()){clearTimeout(p.timer);p.reject(Error('Connection changed'))}probes.clear()}
 function connect(){if(closed||!WebSocketImpl)return;try{
  const ws=new WebSocketImpl(url);socket=ws;
  ws.onopen=()=>{if(closed||socket!==ws){ws.close();return}ws.send(JSON.stringify({type:'auth',token}))};
  ws.onmessage=e=>{if(socket!==ws||closed)return;try{const m=JSON.parse(e.data);if(m.type==='ready'){ready=true;delay=500}else if(m.type==='inputAck')onAck(m);else if(m.type==='pong'){const p=probes.get(m.id);if(p){probes.delete(m.id);clearTimeout(p.timer);p.resolve(m)}}}catch{}};
  ws.onerror=()=>ws.close();ws.onclose=()=>{if(socket!==ws)return;ready=false;clearProbes();if(!closed){retry=setTimeout(connect,delay);delay=Math.min(4000,delay*2)}};
 }catch{if(!closed)retry=setTimeout(connect,delay)}}
 function push(m){if(closed)return;if(ready&&socket?.readyState===1&&socket.bufferedAmount<4096){try{socket.send(JSON.stringify(m));return}catch{}}fallback(m);if(socket?.bufferedAmount>=4096)socket.close()}
 async function probe(signal){if(!ready||socket?.readyState!==1||socket.bufferedAmount>=4096){const r=await fetch('/health',{cache:'no-store',signal});if(!r.ok)throw Error('Ping failed');return r.json()}const id=++nextProbe;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{probes.delete(id);reject(Error('Ping timed out'))},4000);probes.set(id,{resolve,reject,timer});try{socket.send(JSON.stringify({type:'ping',id}))}catch(e){probes.delete(id);clearTimeout(timer);reject(e)}})}
 connect();return {push,probe,get ready(){return ready},close(){closed=true;ready=false;clearTimeout(retry);clearProbes();socket?.close()}};
}
