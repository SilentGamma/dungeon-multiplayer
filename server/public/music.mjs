import {SIZE} from './world.mjs';
export function musicScene(state,me){
 if(state?.phase!=='playing')return 'menu';
 const p=state.run?.players.find(p=>p.id===me);if(!p)return 'explore';
 const room=Math.floor(p.y)*SIZE+Math.floor(p.x);
 return (state.run.enemies||[]).some(e=>e.hp>0&&(state.run.kind==='boss'?e.active!==false:e.room===room))?'combat':'explore';
}
export function createMusic({volume=.25}={}){
 const tracks=Object.fromEntries(['menu','explore','combat'].map(k=>{const a=new Audio('/music-'+k+'.ogg');a.loop=true;a.preload='none';a.volume=0;return [k,a]}));
 tracks.explore.addEventListener('loadedmetadata',()=>{tracks.explore.currentTime=Math.min(55,Math.max(0,tracks.explore.duration-1))});
 tracks.explore.addEventListener('timeupdate',()=>{if(tracks.explore.currentTime<.3&&tracks.explore.readyState>=1)tracks.explore.currentTime=55});
 let scene=null,muted=false,holdCombat=0,level=Math.max(0,Math.min(1,volume));
 function attempt(a){if(a.paused)a.play().catch(()=>{})}
 function unlock(){if(!muted&&scene)attempt(tracks[scene])}
 document.addEventListener('pointerdown',unlock,{capture:true,passive:true});document.addEventListener('keydown',unlock,{capture:true});
 setInterval(()=>{for(const [key,a] of Object.entries(tracks)){const target=!muted&&!document.hidden&&key===scene ? .32*level : 0;a.volume=Math.max(0,Math.min(1,a.volume+Math.sign(target-a.volume)*Math.min(.025,Math.abs(target-a.volume))));if(a.volume===0&&target===0)a.pause()}},80);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){for(const a of Object.values(tracks)){a.pause();a.volume=0}}else unlock()});
 return {setVolume(value){if(Number.isFinite(value))level=Math.max(0,Math.min(1,value));if(level>0)unlock();else for(const a of Object.values(tracks)){a.volume=0;a.pause()}},setMuted(value){muted=value;if(muted){for(const a of Object.values(tracks)){a.pause();a.volume=0}}else unlock()},set(next){if(next==='combat')holdCombat=Date.now()+2200;if(next==='explore'&&scene==='combat'&&Date.now()<holdCombat)return;if(scene===next)return;scene=next;unlock()}};
}
