import {SIZE} from './world.mjs';
export const THEME_URLS=Object.freeze(Object.fromEntries(['menu','explore','combat','warden','victory','defeat'].map(key=>[key,`/music-${key}-v2.mp3`])));
export function musicScene(state,me){
 if(state?.phase==='completed'||state?.phase==='ended'){
  const result=state.results?.players?.find(p=>p.id===me);
  return result ? result.rank==='F'?'defeat':'victory' : state.phase==='completed'||state.endReason==='won'?'victory':'defeat';
 }
 if(state?.phase!=='playing')return 'menu';
 if(state.run?.kind==='boss')return 'warden';
 const p=state.run?.players.find(p=>p.id===me);if(!p)return 'explore';
 const room=Math.floor(p.y)*SIZE+Math.floor(p.x);
 return (state.run.enemies||[]).some(e=>e.hp>0&&e.room===room)?'combat':'explore';
}
// One live theme owner. A replaced element can never revive a previous scene,
// even when its play promise resolves after a mute, exit or rapid scene change.
export function createMusic({volume=.5,onSceneChange=()=>{}}={}){
 let scene=null,owner=null,muted=false,transitioning=false,cueActive=false,level=clamp(volume);
 const enabled=()=>!!scene&&!muted&&!transitioning&&!cueActive&&!document.hidden&&level>0;
 function clamp(value){return Number.isFinite(value)?Math.max(0,Math.min(1,value)):.5}
 function stop(record){record.cancelled=true;record.audio.pause();record.audio.volume=0;if(owner===record)owner=null}
 function offset(record){if(record.key!=='explore')return;try{const a=record.audio;const start=Number.isFinite(a.duration)?Math.min(55,Math.max(0,a.duration-1)):55;if(a.currentTime<start)a.currentTime=start}catch{}}
 function start(record){if(record.pending||record.ended||record.cancelled||!record.audio.paused)return;offset(record);record.pending=true;try{Promise.resolve(record.audio.play()).then(()=>{record.pending=false;if(record.cancelled||owner!==record||!enabled()||scene!==record.key){record.audio.pause();record.audio.volume=0}}).catch(()=>{record.pending=false})}catch{record.pending=false}}
 function pump(){
  if(owner){const record=owner,a=record.audio,target=enabled()&&scene===record.key&&!record.ended ? .5*level : 0;a.volume=Math.max(0,Math.min(1,a.volume+Math.sign(target-a.volume)*Math.min(.1,Math.abs(target-a.volume))));
   if(!target&&a.volume===0){if(scene!==record.key)stop(record);else a.pause()}
  }
  if(!enabled())return;
  if(!owner){const key=scene,a=new Audio(THEME_URLS[key]),record={key,audio:a,pending:false,cancelled:false,ended:false};owner=record;a.preload='none';a.volume=0;a.loop=!['victory','defeat'].includes(key);
   a.addEventListener('loadedmetadata',()=>offset(record));a.addEventListener('timeupdate',()=>{if(!record.cancelled)offset(record)});a.addEventListener('ended',()=>{if(!a.loop)record.ended=true});
   a.addEventListener('error',()=>{record.ended=true});
  }
  if(owner.key===scene&&!owner.ended)start(owner);
 }
 document.addEventListener('pointerdown',pump,{capture:true,passive:true});document.addEventListener('keydown',pump,{capture:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&owner){owner.audio.pause();owner.audio.volume=0}else pump()});
 setInterval(pump,40);
 return {setVolume(value){level=clamp(value);if(!level&&owner){owner.audio.pause();owner.audio.volume=0}pump()},setMuted(value){muted=!!value;if(muted&&owner){owner.audio.pause();owner.audio.volume=0}else pump()},setCueActive(value){cueActive=!!value;pump()},setTransitioning(value){transitioning=!!value;pump()},set(next){if(next!==null&&!Object.hasOwn(THEME_URLS,next)||scene===next)return;scene=next;onSceneChange(next);pump()}};
}
