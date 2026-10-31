import {RELIC_INK as ink} from './relic-art.mjs';
function shape(c,p,fill){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.stroke()}
// Notebook silhouettes: soft heart, plated Super Heart, and a tapering wind spiral.
function heartPath(c){c.beginPath();c.moveTo(0,.036);c.bezierCurveTo(-.012,.029,-.041,.009,-.039,-.012);c.bezierCurveTo(-.037,-.034,-.019,-.044,-.008,-.031);c.lineTo(0,-.019);c.bezierCurveTo(.009,-.044,.031,-.042,.039,-.023);c.bezierCurveTo(.049,-.001,.022,.025,0,.036);c.closePath()}
export function drawLoot(c,item,time){
 c.save();c.translate(item.x,item.y);c.lineJoin='round';c.lineCap='round';c.lineWidth=.003;c.strokeStyle=ink.edge;
 if(item.kind==='heart'||item.kind==='super-heart'){
  const enhanced=item.kind==='super-heart';if(enhanced)c.scale(1.35,1.35);
  heartPath(c);c.fillStyle=enhanced?'#d6a24f':'#b74c3e';c.fill();c.stroke();
  if(enhanced){
   // Broad shoulder plates, central oval clasp, and a pointed lower plate.
   shape(c,[[-.038,-.006],[-.031,-.028],[-.016,-.035],[-.01,-.013],[-.023,-.01],[-.029,.002]],'#efd09a');
   shape(c,[[.008,-.029],[.013,-.036],[.027,-.035],[.037,-.022],[.034,-.003],[.025,.002],[.02,-.017],[.009,-.014]],'#eac486');
   shape(c,[[-.021,.018],[-.012,.027],[-.006,.015],[.005,.023],[.016,.012],[.022,.024],[.009,.033],[0,.037],[-.016,.028]],'#edc581');
   c.fillStyle='#805331';c.beginPath();c.ellipse(.001,-.002,.009,.0055,-.15,0,Math.PI*2);c.fill();c.stroke();
   c.strokeStyle='#fff0c1';c.lineWidth=.0018;c.beginPath();c.moveTo(-.031,-.015);c.lineTo(-.019,-.023);c.moveTo(.016,-.032);c.lineTo(.016,-.023);c.moveTo(.027,-.016);c.quadraticCurveTo(.035,-.01,.03,-.004);c.moveTo(-.006,.028);c.lineTo(.003,.03);c.stroke();
   c.strokeStyle='#b68b58';c.lineWidth=.0018;c.beginPath();c.moveTo(-.042,.012);c.quadraticCurveTo(-.034,.026,-.026,.027);c.moveTo(.038,.009);c.quadraticCurveTo(.035,.025,.024,.031);c.stroke();
  }else{
   c.strokeStyle='#efaf8e';c.lineWidth=.0022;c.beginPath();c.moveTo(-.031,-.011);c.quadraticCurveTo(-.034,-.002,-.027,.005);c.moveTo(.015,-.025);c.quadraticCurveTo(.026,-.029,.026,-.018);c.moveTo(.026,-.004);c.quadraticCurveTo(.024,.014,.012,.025);c.stroke();
  }
 }else{
  shape(c,[[-.045,-.029],[.043,-.048],[.036,-.039],[-.021,-.021],[.04,-.024],[-.035,.003],[.031,-.004],[-.021,.022],[.021,.014],[-.007,.038],[.008,.033],[-.005,.052],[-.003,.036],[-.015,.032],[.004,.018],[-.032,.027],[-.012,.009],[-.043,.006],[.014,-.015],[-.041,-.014]],'#d0c6a2');
  c.strokeStyle='#75694e';c.lineWidth=.0018;c.beginPath();for(const [x,y] of [[-.014,-.027],[.006,-.033],[-.004,-.002],[.003,.015]]){c.moveTo(x-.006,y+.004);c.lineTo(x+.013,y-.004)}c.stroke();
  c.strokeStyle='#f4e6b9';c.lineWidth=.0017;c.beginPath();c.moveTo(-.031,-.027);c.lineTo(.027,-.04);c.moveTo(-.026,.001);c.lineTo(.009,-.011);c.stroke();
 }
 c.restore();
}
export function drawShard(c,p,r){c.save();c.translate(p.x,p.y);c.strokeStyle=ink.edge;c.lineWidth=.004;shape(c,[[-r,r*.8],[-r*.2,-r],[r*.95,r*.25],[r*.3,r*.7]],ink.clay);c.strokeStyle='#e8b978';c.lineWidth=.003;c.beginPath();c.moveTo(-r*.2,-r*.7);c.lineTo(r*.6,r*.25);c.stroke();c.strokeStyle='#6e412d';c.lineWidth=.002;c.beginPath();c.moveTo(-r*.65,r*.5);c.lineTo(-r*.15,r*.15);c.moveTo(-r*.25,r*.6);c.lineTo(r*.25,r*.25);c.stroke();c.restore()}
