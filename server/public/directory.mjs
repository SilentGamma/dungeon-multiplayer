// Ephemeral P2P discovery. A browser holds the directory role; a new one
// takes over if it closes. Hosts republish; gameplay never uses this hub.
export function directory({advertisement,onRooms,onStatus}){
 const HUB='next-game-directory-v01-6adf8a8e';let client,hub,connection,pending=false;const entries=new Map();
 function wire(c){c.on('data',m=>{if(m?.type!=='directory')return;const a=m.ad;
 if(a&&/^\d{6}$/.test(a.code)&&typeof a.name==='string'&&Number.isInteger(a.count)&&a.count>=1&&a.count<8)entries.set(c.peer,{code:a.code,name:a.name.slice(0,20),count:a.count,time:Date.now()});else entries.delete(c.peer);
 c.send({type:'rooms',rooms:[...entries.values()].filter(r=>Date.now()-r.time<12000).map(({time,...r})=>r)});
 });c.on('close',()=>entries.delete(c.peer));c.on('error',()=>entries.delete(c.peer));}
 function elect(){if(hub||pending)return;pending=true;const p=new Peer(HUB,{debug:0});p.on('open',()=>{hub=p;pending=false;p.on('connection',wire);p.on('disconnected',()=>{if(!p.destroyed)p.reconnect()})});p.on('error',()=>{pending=false;if(hub===p)hub=null;p.destroy()});}
 function connect(){if(!client?.open||connection)return;const c=client.connect(HUB,{reliable:true,serialization:'json'});connection=c;c.on('open',()=>{onStatus('Public tables update automatically.');poll()});c.on('data',m=>{if(m?.type==='rooms'&&Array.isArray(m.rooms))onRooms(m.rooms)});const closed=()=>{if(connection===c){connection=null;onRooms([]);onStatus('Reconnecting public table list…');elect()}};c.on('close',closed);c.on('error',closed);setTimeout(()=>{if(!c.open){c.close();closed()}},3500);}
 function poll(){if(connection?.open)connection.send({type:'directory',ad:advertisement()});}
 if(typeof Peer==='undefined'){onStatus('Connection service unavailable. Reload to retry.');return ()=>{}}
 client=new Peer(undefined,{debug:0});client.on('open',()=>{elect();connect()});client.on('error',()=>{if(!connection?.open)elect()});client.on('disconnected',()=>{if(!client.destroyed)client.reconnect()});
 const timer=setInterval(()=>{if(connection?.open)poll();else{elect();connect()}},3000);
 addEventListener('pagehide',()=>{clearInterval(timer);connection?.close();hub?.destroy();client?.destroy()},{once:true});return poll;
}
