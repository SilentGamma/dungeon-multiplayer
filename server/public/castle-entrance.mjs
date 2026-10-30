// Castle entry retains its long recorded reveal; other navigation uses short loading fades.
export function createCastleEntrance(isMuted){
 const curtain=document.getElementById('castle-fade'),sound=new Audio('/castle-entry.mp3');
 sound.preload='auto';sound.volume=.65;
 let current='home',pendingSound=false,serial=0,animation=null,pending=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function silence(){pendingSound=false;sound.pause();sound.currentTime=0}
 function play(){if(isMuted()){pendingSound=false;return}sound.pause();sound.currentTime=0;pendingSound=false;sound.play().catch(()=>{pendingSound=current==='home'})}
 function unlock(){if(pendingSound&&current==='home')play()}
 document.addEventListener('pointerdown',unlock,{capture:true,passive:true});document.addEventListener('keydown',unlock,{capture:true});
 const duration=()=>Number.isFinite(sound.duration)?sound.duration*1000:6322;
 async function fade(from,to,milliseconds){animation?.cancel();const anim=curtain.animate([{opacity:from},{opacity:to}],{duration:reduced()?60:milliseconds,easing:'ease-in-out',fill:'forwards'});animation=anim;try{await anim.finished}catch{return false}if(animation!==anim)return false;curtain.style.opacity=String(to);animation=null;anim.cancel();return true}
 play();fade(1,0,duration());
 return {silence,async change(id,reveal,{force=false}={}){
  if(pending?.id===id&&!force){pending.reveal=reveal;return pending.done}
  if(!pending&&id===current&&!force){reveal();return}
  const ticket=++serial,throughCastle=id==='home'||current==='home';
  const job={id,reveal,done:null};pending=job;
  job.done=(async()=>{
   curtain.classList.toggle('short-loading',!throughCastle);curtain.style.pointerEvents='auto';
   const half=throughCastle?duration()/2:180;
   if(!await fade(Number(curtain.style.opacity)||0,1,half)||ticket!==serial)return;
   current=id;job.reveal();pendingSound=false;if(id==='home')silence();
   if(!throughCastle&&!reduced())await new Promise(resolve=>setTimeout(resolve,100));
   if(ticket!==serial)return;
   if(!await fade(1,0,throughCastle?half:220)||ticket!==serial)return;
   pending=null;curtain.style.pointerEvents='none';curtain.classList.remove('short-loading');
  })();return job.done;
 }};
}
