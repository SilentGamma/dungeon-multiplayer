import {SIZE} from './world.mjs';
export function musicScene(state,me){
 if(state?.phase!=='playing')return 'menu';
 const p=state.run?.players.find(p=>p.id===me);if(!p)return 'explore';
 const room=Math.floor(p.y)*SIZE+Math.floor(p.x);
 return (state.run.enemies||[]).some(e=>e.hp>0&&(state.run.kind==='boss'?e.active!==false:e.room===room))?'combat':'explore';
}
export function createMusic({volume=.5}={}){
 const tracks=Object.fromEntries(['menu','explore','combat'].map(k=>{const a=new Audio('/music-'+k+'.ogg');a.loop=true;a.preload='none';a.volume=0;return [k,a]}));
 const restart=(key,a)=>{if(!a.paused)a.pause();a.volume=0;try{const start=key==='explore'?Math.min(55,Math.max(0,(Number.isFinite(a.duration)?a.duration:56)-1)):0;if(!Number.isFinite(a.currentTime)||Math.abs(a.currentTime-start)>.01)a.currentTime=start}catch{}};
 tracks.explore.addEventListener('loadedmetadata',()=>{if(tracks.explore.paused)restart('explore',tracks.explore)});
 tracks.explore.addEventListener('timeupdate',()=>{if(tracks.explore.currentTime<.3&&tracks.explore.readyState>=1)tracks.explore.currentTime=Math.min(55,Math.max(0,tracks.explore.duration-1))});
 let scene=null,muted=false,transitioning=false,holdCombat=0,level=Math.max(0,Math.min(1,volume));
 function unlock(){if(!muted&&!transitioning&&!document.hidden&&scene&&level>0){const a=tracks[scene];if(a.paused){if(scene==='explore'&&!(a.currentTime>0))restart('explore',a);a.play().catch(()=>{})}}}
 document.addEventListener('pointerdown',unlock,{capture:true,passive:true});document.addEventListener('keydown',unlock,{capture:true});
 setInterval(()=>{for(const [key,a] of Object.entries(tracks)){const target=!muted&&!transitioning&&!document.hidden&&key===scene ? .32*level : 0;a.volume=Math.max(0,Math.min(1,a.volume+Math.sign(target-a.volume)*Math.min(.08,Math.abs(target-a.volume))));if(a.volume===0&&target===0)restart(key,a)}},80);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const [key,a] of Object.entries(tracks))restart(key,a)}else unlock()});
 return {setVolume(value){if(Number.isFinite(value))level=Math.max(0,Math.min(1,value));if(level>0)unlock();else for(const [key,a] of Object.entries(tracks))restart(key,a)},setMuted(value){muted=value;if(muted){for(const [key,a] of Object.entries(tracks))restart(key,a)}else unlock()},setTransitioning(value){transitioning=!!value;if(transitioning)holdCombat=0;else unlock()},set(next){if(next!==null&&!Object.hasOwn(tracks,next))return;if(next==='combat')holdCombat=Date.now()+2200;if(next==='explore'&&scene==='combat'&&!transitioning&&Date.now()<holdCombat)return;if(scene===next)return;scene=next;unlock()}};
}
