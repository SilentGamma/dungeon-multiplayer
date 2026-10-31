export function formatRunTime(seconds){const value=Math.max(0,Math.floor(seconds||0));return `${Math.floor(value/60)}:${String(value%60).padStart(2,'0')}`}
export function showScorecard(state,me){
 const $=id=>document.getElementById(id),result=state.results,rows=result?.players||[],mine=rows.find(p=>p.id===me),finished=!!mine?.finished;
 $('endingtitle').textContent=finished?'YOU MADE IT':result?.won?'YOU DID NOT FINISH':'ALL MEMBERS DIED';
 $('endingtext').textContent=finished?'The dungeon remembers your name.':'The dungeon keeps its due.';
 $('score-rank').textContent=mine?.rank||'F';$('score-wrap').dataset.rank=mine?.rank||'F';$('score-sad').hidden=mine?.rank!=='F';
 $('score-deaths').textContent=String(mine?.deaths??0);$('score-kills').textContent=String(mine?.kills??0);$('score-time').textContent=formatRunTime(result?.seconds);
 const list=$('score-finishers');list.replaceChildren();for(const p of rows.filter(p=>p.finished)){const li=document.createElement('li'),name=document.createElement('span'),rank=document.createElement('b');name.textContent=p.name;rank.textContent=p.rank;li.append(name,rank);list.append(li)}if(!list.childNodes.length){const li=document.createElement('li');li.textContent='No one returned.';list.append(li)}
 const fallen=$('score-fallen');fallen.replaceChildren();for(const p of rows.filter(p=>!p.finished)){const li=document.createElement('li'),name=document.createElement('span'),rank=document.createElement('b');name.textContent=p.name;rank.textContent='F';li.append(name,rank);fallen.append(li)}$('score-fallen-section').hidden=!fallen.childNodes.length;
 $('ending').hidden=false;$('endleave').hidden=false;$('endleave').focus();
}
