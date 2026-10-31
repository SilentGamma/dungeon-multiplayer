// Castle entry retains its long recorded reveal; other navigation uses short loading fades.
export function createCastleEntrance(isMuted,{onTransitionStart=()=>{},onTransitionEnd=()=>{}}={}){
 const curtain=document.getElementById('castle-fade'),sound=new Audio('/castle-entry.mp3');
 sound.preload='auto';sound.volume=.65*.5;
 let current='home',pendingSound=false,serial=0,animation=null,pending=null,entryLevel=.65*.5,soundFade=null,entryRequested=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function silence(){clearInterval(soundFade);soundFade=null;pendingSound=false;entryRequested=false;sound.pause();sound.currentTime=0;sound.volume=entryLevel}
 function fadeSound(){clearInterval(soundFade);if(sound.paused)return;const step=sound.volume/10;soundFade=setInterval(()=>{sound.volume=Math.max(0,sound.volume-step);if(sound.volume<.001)silence()},20)}
 function play(){silence();entryRequested=true;if(isMuted()){pendingSound=false;return}sound.pause();sound.currentTime=0;sound.volume=entryLevel;pendingSound=false;sound.play().catch(()=>{pendingSound=current==='home'})}
 const duration=()=>Number.isFinite(sound.duration)?sound.duration*1000:6322;
 async function fade(from,to,milliseconds){animation?.cancel();const anim=curtain.animate([{opacity:from},{opacity:to}],{duration:reduced()?60:milliseconds,easing:'ease-in-out',fill:'forwards'});animation=anim;try{await anim.finished}catch{return false}if(animation!==anim)return false;curtain.style.opacity=String(to);animation=null;anim.cancel();return true}
 fade(1,0,duration());
 return {silence,setVolume(value){if(Number.isFinite(value)){entryLevel=.65*Math.max(0,Math.min(1,value));if(!soundFade)sound.volume=entryLevel}},enter:play,async change(id,reveal,{force=false}={}){
  if(pending?.id===id&&!force){pending.reveal=reveal;return pending.done}
  if(!pending&&id===current&&!force){reveal();return}
  const ticket=++serial,throughCastle=id==='home'||current==='home';
  onTransitionStart();if(!(current==='home'&&id==='navigation'&&entryRequested))fadeSound();entryRequested=false;
  const job={id,reveal,done:null};pending=job;
  job.done=(async()=>{
   curtain.classList.toggle('short-loading',!throughCastle);curtain.style.pointerEvents='auto';
   const half=throughCastle?duration()/2:180;
   if(!await fade(Number(curtain.style.opacity)||0,1,half)||ticket!==serial)return;
   current=id;job.reveal();pendingSound=false;if(id==='home')silence();
   if(!throughCastle&&!reduced())await new Promise(resolve=>setTimeout(resolve,100));
   if(ticket!==serial)return;
   if(!await fade(1,0,throughCastle?half:220)||ticket!==serial)return;
   pending=null;fadeSound();onTransitionEnd();curtain.style.pointerEvents='none';curtain.classList.remove('short-loading');
  })();return job.done;
 }};
}
