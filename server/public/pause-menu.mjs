// A local menu; simulation and damage keep running on the server.
export function createPauseMenu({onPause,onLeave}){
 const $=id=>document.getElementById(id),dialog=$('pause-menu');let busy=false,returnFocus=null;
 function confirm(value){dialog.setAttribute('aria-labelledby',value?'pause-confirm-title':'pause-title');$('pause-main').hidden=value;$('pause-confirm').hidden=!value;$(value?'pause-stay':'pause-resume').focus()}
 async function open(leavingOnly=false){if(dialog.open)return;returnFocus=document.activeElement;dialog.showModal();confirm(leavingOnly);$('pause-error').textContent='';try{await onPause(true)}catch(e){$('pause-error').textContent=e.message}}
 async function resume(){if(busy)return;busy=true;try{await onPause(false);dialog.close();if(document.body.classList.contains('options-in-pause'))$('dungeon').focus({preventScroll:true});else returnFocus?.focus?.()}catch(e){$('pause-error').textContent=e.message}finally{busy=false}}
 $('pause-resume').onclick=resume;$('pause-leave').onclick=()=>confirm(true);$('pause-stay').onclick=()=>confirm(false);
 $('pause-confirm-leave').onclick=async()=>{if(busy)return;busy=true;$('pause-confirm-leave').disabled=true;try{await onLeave();dialog.close()}catch(e){$('pause-error').textContent=e.message}finally{busy=false;$('pause-confirm-leave').disabled=false}};
 dialog.addEventListener('cancel',e=>{e.preventDefault();if(!$('pause-confirm').hidden)confirm(false);else resume()});
 return {open,resume,isOpen:()=>dialog.open,close(){dialog.close();busy=false}};
}
