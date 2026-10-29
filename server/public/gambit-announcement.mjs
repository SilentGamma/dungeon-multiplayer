import {GAMBIT_DELAY} from './gambit.mjs';
// At most two timers. Repeated snapshots never restart a reveal.
export function createGambitAnnouncement(element,{now=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout}={}){
 let id=null,started=0,revealed=false,revealTimer=null,hideTimer=null;
 const show=text=>{element.textContent=text;element.hidden=false};
 function clear(){cancel(revealTimer);cancel(hideTimer);revealTimer=hideTimer=null;id=null;revealed=false;element.hidden=true;element.textContent=''}
 return {clear,set(cue,time){
  if(!cue||time>cue.expiresAt)return;
  if(cue.id!==id){clear();id=cue.id;started=now();show('GAMBIT');hideTimer=schedule(()=>{element.hidden=true},1600)}
  if(cue.outcome&&!revealed){revealed=true;const current=id;revealTimer=schedule(()=>{if(id!==current)return;show(cue.outcome);cancel(hideTimer);hideTimer=schedule(()=>{element.hidden=true},1200)},Math.max(0,GAMBIT_DELAY*1000-(now()-started)))}
 }};
}
