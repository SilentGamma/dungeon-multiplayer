// Original cut-stone and ink-cut art. Static detail is drawn only into the map cache.
const stone=['#302c2c','#35302e','#29282b','#3a302b','#2b292b'];
function path(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath()}
export function drawStoneRoom(c,x,y,index,connected){
 c.save();c.translate(x,y);c.fillStyle=connected?'#211e22':'#121014';c.fillRect(.014,.014,.972,.972);
 for(let row=0;row<6;row++)for(let col=0;col<5;col++){
  const left=.027+col*.19+(row%2?.07:0),top=.027+row*.158,w=Math.min(.183,.973-left);if(w<=0)continue;
  const seed=(index*19+row*13+col*7)%stone.length;c.fillStyle=connected?stone[seed]:'#171419';c.fillRect(left,top,w,.148);
  c.strokeStyle='#c69b6220';c.lineWidth=.003;c.beginPath();c.moveTo(left,top+.146);c.lineTo(left,top);c.lineTo(left+w,top);c.stroke();
  for(let mark=0;mark<5;mark++){const n=(index*31+row*47+col*13+mark*23)%97;c.fillStyle=mark%2?'#c6aa7930':'#100b1740';c.fillRect(left+w*(n/97),top+.02+((n*7)%97)/97*.11,.005+mark*.001,.002)}
  if((index+row+col)%4===0){c.strokeStyle='#130f16aa';c.lineWidth=.004;c.beginPath();c.moveTo(left+w*.66,top);c.lineTo(left+w*.51,top+.04);c.lineTo(left+w*.65,top+.06);c.stroke()}
 }
 // Corner braces and small chisel cuts, kept away from traversable door gaps.
 c.strokeStyle='#8b655039';c.lineWidth=.007;for(const [a,b,sx,sy] of [[.07,.07,1,1],[.93,.07,-1,1],[.07,.93,1,-1],[.93,.93,-1,-1]]){c.beginPath();c.moveTo(a,b+sy*.07);c.lineTo(a,b);c.lineTo(a+sx*.07,b);c.stroke()}
 c.restore();
}
export function drawStairwell(c,x,y,time=0,animated=false){
 c.save();c.translate(x+.5,y+.5);
 // A warm shaft of light, with the entry centered on the actual goal trigger.
 if(animated){c.globalAlpha=.85+Math.sin(time*1.7)*.08;c.fillStyle='#ffce7830';path(c,[[-.09,-.15],[.09,-.15],[.22,.18],[-.22,.18]]);c.fill();c.fillStyle='#ffd78b12';path(c,[[-.1,-.15],[.1,-.15],[.3,.28],[-.3,.28]]);c.fill();c.restore();return}
 c.fillStyle='#100c12';path(c,[[-.165,.16],[-.165,-.11],[0,-.25],[.165,-.11],[.165,.16]]);c.fill();c.strokeStyle='#bd8252';c.lineWidth=.016;c.stroke();
 c.fillStyle='#ffdaa0';path(c,[[-.105,.13],[-.105,-.1],[0,-.19],[.105,-.1],[.105,.13]]);c.fill();
 for(let i=0;i<6;i++){const top=-.055+i*.038,width=.09+i*.018;c.fillStyle=i%2?'#8b6445':'#b08b61';path(c,[[-width,top],[width,top],[width+.009,top+.028],[-width-.009,top+.028]]);c.fill();c.strokeStyle='#f5d3a3';c.lineWidth=.003;c.beginPath();c.moveTo(-width,top);c.lineTo(width,top);c.stroke()}
 c.fillStyle='#fff1c4';path(c,[[-.023,-.09],[.023,-.09],[.023,-.13],[.046,-.13],[0,-.174],[-.046,-.13],[-.023,-.13]]);c.fill();
 c.restore();
}
export function drawRoomEmbers(c,x,y,time){
 c.save();c.translate(x,y);for(const [tx,ty] of [[.14,.12],[.86,.88]]){c.fillStyle='#f7862020';c.beginPath();c.arc(tx,ty,.095,0,Math.PI*2);c.fill();c.fillStyle='#151016';c.fillRect(tx-.014,ty-.005,.028,.047);const flicker=Math.sin(time*7+tx*18)*.006;c.fillStyle='#ba3a12';path(c,[[tx-.02,ty+.008],[tx-.014,ty-.03],[tx,ty-.018],[tx+.008,ty-.055+flicker],[tx+.02,ty+.008]]);c.fill();c.fillStyle='#ffd477';path(c,[[tx-.008,ty+.004],[tx+.003,ty-.028+flicker],[tx+.01,ty+.004]]);c.fill()}
 c.restore();
}
export function drawEnemyInk(c,e,r,time,tint,reduced=false){
 const ink='#140f18',accent=e.type==='sleeper'?'#d0a2bd':e.type==='flapper'?'#cfb07d':e.type==='warden'?'#dc9b62':'#e0b78d';
 c.save();c.fillStyle='#09070b88';c.beginPath();c.ellipse(0,r*.8,r*1.15,r*.45,0,0,Math.PI*2);c.fill();
 const asleep=e.mode==='sleeping'||e.mode==='resting',bob=reduced?0:Math.sin(time*(e.type==='flapper'?16:4)+(e.x||0)*13)*r*.07;c.translate(0,bob);c.lineWidth=r*.16;c.strokeStyle=ink;c.fillStyle=tint;
 if(e.type==='walker'){
  path(c,[[-r*.85,r],[-r,-r*.55],[-r*.6,-r],[r*.6,-r],[r,-r*.55],[r*.85,r],[r*.2,r*.8],[0,r],[-r*.3,r*.8]]);c.fill();c.stroke();
  c.fillStyle=ink;path(c,[[-r*.7,-r*.28],[0,-r*.64],[r*.7,-r*.28],[r*.5,r*.65],[-r*.5,r*.65]]);c.fill();
  c.strokeStyle=accent;c.lineWidth=r*.1;c.beginPath();c.moveTo(0,-r*.6);c.lineTo(0,r*.64);c.stroke();
 }else if(e.type==='sleeper'){
  path(c,[[0,-r*1.35],[r*1.05,r],[-r*.9,r*.85],[-r*1.1,r*.25]]);c.fill();c.stroke();c.fillStyle=ink;path(c,[[0,-r*.63],[r*.56,r*.43],[-r*.55,r*.43]]);c.fill();c.strokeStyle=accent;c.lineWidth=r*.1;c.beginPath();c.moveTo(-r*.55,r*.7);c.lineTo(0,r*.48);c.lineTo(r*.5,r*.7);c.stroke();
 }else if(e.type==='flapper'){
  const flap=reduced?0:Math.sin(time*17)*r*.25;
  path(c,[[-r*.1,-r*.1],[-r*1.3,-r*.95+flap],[-r*1.1,r*.35],[-r*.65,r*.12],[-r*.3,r*.5],[0,r*.8],[r*.3,r*.5],[r*.65,r*.12],[r*1.1,r*.35],[r*1.3,-r*.95+flap],[r*.1,-r*.1]]);c.fill();c.stroke();c.strokeStyle=accent;c.lineWidth=r*.08;for(const dir of [-1,1]){c.beginPath();c.moveTo(0,0);c.lineTo(dir*r*.9,-r*.45+flap*.5);c.stroke()}c.fillStyle=ink;path(c,[[-r*.32,-r*.6],[0,-r*.3],[r*.32,-r*.6],[r*.3,r*.5],[-r*.3,r*.5]]);c.fill();
 }else if(e.type==='warden'){
  path(c,[[-r,r*.9],[-r*.9,-r*.55],[-r*.55,-r*.7],[-r*.6,-r*1.2],[-r*.25,-r*.9],[0,-r*1.3],[r*.25,-r*.9],[r*.6,-r*1.2],[r*.55,-r*.7],[r*.9,-r*.55],[r,r*.9]]);c.fill();c.stroke();c.fillStyle=ink;path(c,[[-r*.5,-r*.57],[r*.5,-r*.57],[r*.4,r*.3],[0,r*.65],[-r*.4,r*.3]]);c.fill();c.strokeStyle=accent;c.lineWidth=r*.07;for(const side of [-1,1]){c.beginPath();c.moveTo(side*r*.7,-r*.3);c.lineTo(side*r*.57,r*.7);c.stroke()}c.fillStyle=accent;path(c,[[0,r*.35],[r*.16,r*.54],[0,r*.75],[-r*.16,r*.54]]);c.fill();
 }else{
  path(c,[[-r*.9,r*.65],[-r,-r*.25],[-r*.55,-r*.85],[r*.25,-r],[r*.85,-r*.4],[r,r*.65],[r*.35,r],[-r*.4,r*.9]]);c.fill();c.stroke();c.strokeStyle=ink;c.lineWidth=r*.1;c.beginPath();c.moveTo(-r*.6,-r*.45);c.lineTo(-r*.1,-r*.05);c.lineTo(-r*.35,r*.2);c.moveTo(r*.6,-r*.3);c.lineTo(r*.2,r*.12);c.lineTo(r*.5,r*.5);c.stroke();c.fillStyle=ink;c.fillRect(-r*.65,-r*.22,r*1.3,r*.33);
 }
 c.strokeStyle=asleep?'#987a86':'#fff0bb';c.lineWidth=r*.13;c.beginPath();if(asleep){c.moveTo(-r*.35,r*.05);c.lineTo(r*.35,r*.05)}else{c.moveTo(-r*.42,-r*.08);c.lineTo(-r*.13,r*.01);c.moveTo(r*.13,r*.01);c.lineTo(r*.42,-r*.08)}c.stroke();c.restore();
}
