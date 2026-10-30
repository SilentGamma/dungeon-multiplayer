import {ROLE_ART,preloadTokens} from './role-art.mjs';
import {ROLES,roleFor} from './roles.mjs';
import {colorFor,colorName} from './colors.mjs';
const roles=Object.keys(ROLES);
export function createRoleCarousel(root,onChoose,onBrowse=()=>{}){
 const el=id=>root.querySelector('#'+id);let players=[],me=null,index=0,pending=false;
 function draw(){const color=roles[index],role=roleFor(color),mine=players.find(p=>p.id===me),owner=players.find(p=>p.color===color&&p.id!==me),selected=mine?.color===color;
  el('role-name').textContent=role.name;const description=el('role-description');if(description)description.textContent=role.description||'';el('role-color').textContent=colorName(color)+' · '+role.speedClass;
  el('role-stage').style.setProperty('--role-color',colorFor(color));el('role-avatar').style.backgroundColor=colorFor(color);const art=ROLE_ART[color],avatar=el('role-avatar');avatar.className='role-avatar'+(art?' has-portrait':'');avatar.style.backgroundImage=art?'url('+art.portrait+')':'';el('role-counter').textContent=`${index+1} / ${roles.length}`;
  el('role-health').textContent=role.hp;el('role-shield').textContent=role.shield;el('role-damage').textContent=color==='blue'?'3 / 10 / 12':role.damage;el('role-cooldown').textContent=role.cooldown+'s';
  el('role-status').textContent=owner?'Taken by '+owner.name:selected?'Your selected role':'Available';
  const choose=el('role-select');choose.disabled=pending||!!owner||selected;choose.textContent=pending?'Selecting…':owner?'Already taken':selected?'Selected':'Choose '+role.name;
  for(const [id,offset] of [['role-before',-1],['role-after',1]]){const c=roles[(index+offset+roles.length)%roles.length];el(id).textContent=roleFor(c).name;el(id).style.color=colorFor(c)}
 }
 function move(delta){onBrowse();index=(index+delta+roles.length)%roles.length;draw()}
 el('role-prev').addEventListener('click',()=>move(-1));el('role-next').addEventListener('click',()=>move(1));
 root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1)}});
 let gesture=null;const stage=el('role-stage');stage.addEventListener('pointerdown',e=>{gesture={id:e.pointerId,x:e.clientX,y:e.clientY}});stage.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))move(dx<0?1:-1)});stage.addEventListener('pointercancel',()=>gesture=null);
 el('role-select').addEventListener('click',async()=>{const color=roles[index];if(pending||players.some(p=>p.color===color))return;pending=true;draw();try{await onChoose(color)}finally{pending=false;draw()}});
 return {set(next,nextMe){if(me!==nextMe){me=nextMe;index=Math.max(0,roles.indexOf(next.find(p=>p.id===me)?.color))}players=next;preloadTokens();draw()}};
}
