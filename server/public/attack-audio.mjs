// Cached effects: supplied Sniper recordings plus original procedural effects.
export const SOUND_TYPES=['coral','purple','pink','gold','green','blue','teal','lime','throw','walker','sleeper','flapper','creeper','warden','explosion','shock','sniper-hit','menu','pickup','victory','defeat','round','revive','goal','pot-break','shield-hit','shield-break','hurt','down','heal','room-clear'];
export const CLIP_URLS=Object.freeze({blue:'/sniper-fire-v1.mp3','sniper-hit':'/sniper-hit-v1.mp3','room-clear':'/room-clear-v1.mp3',goal:'/goal-fanfare-v1.mp3',round:'/entry-drums-v1.mp3'});
const durations={coral:.16,purple:.3,pink:.22,gold:.4,green:.3,blue:.44,teal:.2,lime:.14,throw:.28,walker:.16,sleeper:.3,flapper:.18,creeper:.5,warden:.65,explosion:.7,shock:.26,'sniper-hit':.22,menu:.08,pickup:.3,victory:.85,defeat:.8,round:.6,revive:.65,goal:.5,'pot-break':.25,'shield-hit':.18,'shield-break':.4,hurt:.15,down:.5,heal:.35,'room-clear':.7};
export function soundSamples(type,rate=22050){
 if(!SOUND_TYPES.includes(type))return null;const data=new Float32Array(Math.ceil(durations[type]*rate));let seed=17,prior=0,low=0,peak=0;
 for(let i=0;i<data.length;i++){const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const noise=seed/2147483648-1,high=noise-prior;prior=noise;low=low*.94+noise*.06;
 const tone=(f,decay,drop=0)=>Math.sin(2*Math.PI*(f*t-drop*t*t))*Math.exp(-decay*t);let v=0;
 switch(type){
 case 'menu':v=tone(650,60)+.3*tone(980,70);break;
 case 'pickup':v=tone(880,14)+.6*tone(1320,10);break;
 case 'victory':v=tone(523,4)+tone(659,4)+tone(784,3);break;
 case 'defeat':v=tone(220,5,55)+.7*tone(261,5,60);break;
 case 'round':v=tone(440,8)+.7*tone(660,6);break;
 case 'revive':v=tone(620,6,-180)+.5*tone(930,8);break;
 case 'room-clear':v=tone(392,8)+.5*tone(587,9);break;
 case 'goal':v=tone(740,8)+.5*tone(1110,7);break;
 case 'pot-break':v=high*Math.exp(-24*t)+.5*tone(830,25)+.4*tone(1570,30);break;
 case 'shield-hit':v=tone(350,28)+.6*tone(1050,30);break;
 case 'shield-break':v=high*Math.exp(-15*t)+tone(550,12,500);break;
 case 'hurt':v=noise*Math.exp(-45*t)+tone(190,30);break;
 case 'down':v=tone(180,9,90)+.4*low*Math.exp(-12*t);break;
 case 'heal':v=tone(720,12,-200)+.4*tone(1080,12);break;
 case 'coral':v=.8*noise*Math.exp(-55*t)+tone(145,25,200);break;
 case 'purple':v=.5*high*Math.sin(Math.min(1,t/.025)*Math.PI/2)*Math.exp(-12*t)+.12*tone(2100,18);break;
 case 'pink':v=.7*high*Math.exp(-22*t)+.3*tone(1050,25,1500);break;
 case 'gold':v=.7*noise*Math.exp(-22*t)+1.2*tone(72,12,30)+.3*tone(340,20);break;
 case 'green':v=.45*noise*Math.exp(-40*t)+.6*tone(690,18)+.4*tone(1130,22)+.2*tone(1810,30);break;
 case 'blue':v=1.5*noise*Math.exp(-110*t)+1.2*tone(110,25,80)+.25*noise*Math.exp(-12*t)+.18*tone(1900,70)+((t>.065&&t<.085)?noise*.2:0);break;
 case 'teal':v=.6*noise*Math.exp(-22*t)+.6*tone(180,22,320);break;
 case 'lime':v=.5*high*Math.exp(-65*t)+.3*tone(740,40,1700);break;
 case 'throw':v=.65*high*Math.sin(Math.PI*t/.28)*Math.exp(-6*t)+.3*tone(240,18,250);break;
 case 'walker':v=.6*noise*Math.exp(-55*t)+tone(125,30);break;
 case 'sleeper':v=.7*noise*Math.exp(-16*t)+.6*tone(85,13,60);break;
 case 'flapper':v=high*(.5+.5*Math.cos(t*110))*Math.exp(-25*t)+.2*tone(520,30);break;
 case 'creeper':v=noise*Math.exp(-30*t)+1.1*tone(57,10)+.6*low*Math.exp(-8*t);break;
 case 'warden':v=.5*noise*Math.exp(-20*t)+tone(90,8,35)+.5*tone(180,10,50)+.2*tone(560,15,120);break;
 case 'explosion':v=.8*noise*Math.exp(-14*t)+2*low*Math.exp(-6*t)+tone(48,8);break;
 case 'sniper-hit':v=.4*tone(1500,28)+.6*tone(2300,35)+.2*high*Math.exp(-40*t);break;
 case 'shock':v=high*Math.exp(-24*t)+.4*Math.sign(Math.sin(2*Math.PI*(300*t-350*t*t)))*Math.exp(-18*t);break;
 }
 const fade=Math.min(1,i/Math.max(1,rate*.001),(data.length-1-i)/Math.max(1,rate*.01));data[i]=v*Math.max(0,fade);peak=Math.max(peak,Math.abs(data[i]));
 }
 if(peak)for(let i=0;i<data.length;i++)data[i]*=.8/peak;return data;
}
export function createAttackAudio({loadClip=async url=>{const response=await fetch(url);if(!response.ok)throw Error('Audio unavailable');return response.arrayBuffer()},contextFactory=()=>{const C=globalThis.AudioContext||globalThis.webkitAudioContext;return C?new C():null}}={}){
 let context=null,master=null,muted=false;const buffers=new Map(),seen=new Set(),voices=[];
 const clipData=Promise.all(Object.entries(CLIP_URLS).map(async([type,url])=>{try{return [type,await loadClip(url)]}catch{return [type,null]}}));
 let decoding=false,clipReady=Promise.resolve();
 function loadRecordings(){if(decoding||!context)return;decoding=true;clipReady=clipData.then(async clips=>{await Promise.all(clips.map(async([type,bytes])=>{if(!bytes)return;try{buffers.set(type,await context.decodeAudioData(bytes.slice(0)))}catch{/* Keep the local fallback if loading/decoding fails. */}}))})}

 function unlock(){if(muted)return;try{if(!context){context=contextFactory();if(!context)return;master=context.createGain();master.gain.value=.3;const compressor=context.createDynamicsCompressor();master.connect(compressor);compressor.connect(context.destination);for(const type of SOUND_TYPES){const samples=soundSamples(type),buffer=context.createBuffer(1,samples.length,22050);buffer.copyToChannel(samples,0);buffers.set(type,buffer)}loadRecordings()}if(context.state!=='running'){const resumed=context.resume();resumed?.catch?.(()=>{});}}catch{}}
 function stop(){for(const v of voices.splice(0)){try{v.source.stop()}catch{}}}
 function play(type,volume=.7){if(muted||!context||context.state!=='running'||!buffers.has(type))return;
   while(voices.length>=12){const old=voices.shift();try{old.source.stop()}catch{}}
   const source=context.createBufferSource(),gain=context.createGain();source.buffer=buffers.get(type);gain.gain.value=volume;source.connect(gain);gain.connect(master);const voice={source,gain};voices.push(voice);source.onended=()=>{const index=voices.indexOf(voice);if(index>=0)voices.splice(index,1);source.disconnect();gain.disconnect()};source.start();
 }
 return {unlock,play,ready:()=>clipReady,setMuted(value){muted=!!value;if(muted)stop()},reset(){seen.clear();stop()},
  set(run,me){if(!run)return;const player=run.players.find(p=>p.id===me);for(const event of run.audioEvents||[]){if(seen.has(event.id))continue;seen.add(event.id);if(seen.size>128)seen.delete(seen.values().next().value);if(muted||!context||context.state!=='running'||(run.time||0)-event.time>1.2||!buffers.has(event.type))continue;
   const distance=player?Math.hypot(player.x-event.x,player.y-event.y):1;if(distance>1.5)continue;
   play(event.type,.85/(1+distance*1.8));
  }}
 };
}
