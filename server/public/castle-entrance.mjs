// The entry recording is processed offline: lowered pitch, filtered and reverberant.
export function createCastleEntrance(isMuted){
 const curtain=document.getElementById('castle-fade'),sound=new Audio('/castle-entry.mp3');
 sound.preload='auto';sound.volume=.65;
 let current='home',pendingSound=false,serial=0;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function silence(){pendingSound=false;sound.pause();sound.currentTime=0}
 function play(){if(isMuted()){pendingSound=false;return}sound.pause();sound.currentTime=0;pendingSound=false;sound.play().catch(()=>{pendingSound=current==='home'})}
 function unlock(){if(pendingSound&&current==='home')play()}
 document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
 document.addEventListener('keydown',unlock,{capture:true});
 const duration=()=>Number.isFinite(sound.duration)?sound.duration*1000:6322;
 async function fade(from,to,milliseconds){const anim=curtain.animate([{opacity:from},{opacity:to}],{duration:reduced()?80:milliseconds,easing:'ease-in-out',fill:'forwards'});await anim.finished.catch(()=>{});curtain.style.opacity=String(to);anim.cancel()}
 play();fade(1,0,duration());
 return {silence,async change(id,reveal){
  if(id===current){reveal();return}
  const ticket=++serial,throughCastle=id==='home'||current==='home';
  if(!throughCastle){current=id;reveal();return}
  curtain.style.pointerEvents='auto';const half=duration()/2;await fade(0,1,half);
  if(ticket!==serial)return;
  current=id;reveal();pendingSound=false;if(id==='home')silence();
  await fade(1,0,half);curtain.style.pointerEvents='none';
 }};
}
