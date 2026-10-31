import {SIZE} from './world.mjs';
export function musicScene(state,me){
 if(state?.phase!=='playing')return 'menu';
 const p=state.run?.players.find(p=>p.id===me);if(!p)return 'explore';
 const room=Math.floor(p.y)*SIZE+Math.floor(p.x);
 return (state.run.enemies||[]).some(e=>e.hp>0&&(state.run.kind==='boss'?e.active!==false:e.room===room))?'combat':'explore';
}
// Theme recordings were removed at the director's request. Keep the public
// controller contract so scene changes and short sound effects still work.
export function createMusic({onSceneChange=()=>{}}={}){
 let scene=null;
 return {
  setVolume(){},setMuted(){},setCueActive(){},setTransitioning(){},
  set(next){if(scene===next)return;scene=next;onSceneChange(next)}
 };
}
