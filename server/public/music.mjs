import {SIZE} from './world.mjs';
export function musicScene(state,me){
 if(state?.phase!=='playing')return 'menu';
 const p=state.run?.players.find(p=>p.id===me);if(!p)return 'explore';
 const room=Math.floor(p.y)*SIZE+Math.floor(p.x);
 return (state.run.enemies||[]).some(e=>e.hp>0&&(state.run.kind==='boss'?e.active!==false:e.room===room))?'combat':'explore';
}
export function createMusic({volume=.5,onSceneChange=()=>{}}={}){
 const tracks=Object.fromEntries(['menu','explore','combat'].map(k=>{const a=new Audio('/music-'+k+'.ogg');a.loop=true;a.preload='none';a.volume=0;return [k,a]}));
 let scene=null,active=null,muted=false,transitioning=false,cueActive=false,level=Math.max(0,Math.min(1,volume));
 const enabled=()=>!muted&&!transitioning&&!cueActive&&!document.hidden&&level>0;
 function restart(key,a){if(!a.paused)a.pause();a.volume=0;if(active===key)active=null;try{const start=key==='explore'?Math.min(55,Math.max(0,(Number.isFinite(a.duration)?a.duration:56)-1)):0;if(!Number.isFinite(a.currentTime)||Math.abs(a.currentTime-start)>.01)a.currentTime=start}catch{}}
 function unlock(){if(!enabled()||!scene||active&&active!==scene)return;const key=scene,a=tracks[key];if(a.paused){if(key==='explore'&&!(a.currentTime>0))restart(key,a);active=key;try{Promise.resolve(a.play()).then(()=>{if(!enabled()||scene!==key||active!==key)restart(key,a)}).catch(()=>{if(active===key)active=null})}catch{if(active===key)active=null}}}
 tracks.explore.addEventListener('loadedmetadata',()=>{if(tracks.explore.paused)restart('explore',tracks.explore)});
 tracks.explore.addEventListener('timeupdate',()=>{if(tracks.explore.currentTime<.3&&tracks.explore.readyState>=1)tracks.explore.currentTime=Math.min(55,Math.max(0,tracks.explore.duration-1))});
 document.addEventListener('pointerdown',unlock,{capture:true,passive:true});document.addEventListener('keydown',unlock,{capture:true});
 // Fade and fully stop the old owner before another theme may start.
 setInterval(()=>{for(const [key,a] of Object.entries(tracks)){const target=enabled()&&key===scene&&key===active ? .32*level : 0;a.volume=Math.max(0,Math.min(1,a.volume+Math.sign(target-a.volume)*Math.min(.08,Math.abs(target-a.volume))));if(a.volume===0&&target===0)restart(key,a)}unlock()},40);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const [key,a] of Object.entries(tracks))restart(key,a)}else unlock()});
 return {setVolume(value){if(Number.isFinite(value))level=Math.max(0,Math.min(1,value));if(level>0)unlock();else for(const [key,a] of Object.entries(tracks))restart(key,a)},setMuted(value){muted=value;if(muted){for(const [key,a] of Object.entries(tracks))restart(key,a)}else unlock()},setCueActive(value){cueActive=!!value;if(!cueActive)unlock()},setTransitioning(value){transitioning=!!value;if(!transitioning)unlock()},set(next){if(next!==null&&!Object.hasOwn(tracks,next)||scene===next)return;scene=next;onSceneChange(next);unlock()}};
}
