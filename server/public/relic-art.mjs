// Assets adapted from Leonardo Camargo’s notebook sketches, matching the castle's charcoal, rust and aged gold.
export const RELIC_INK=Object.freeze({edge:'#1b1014',iron:'#493736',rust:'#9b482c',clay:'#ad6a42',gold:'#d9a34f',light:'#f0c985',paper:'#c6a071'});
const ink=RELIC_INK;
function polygon(c,points,fill,stroke=RELIC_INK.edge){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.stroke()}
export function drawRelicKey(c,x,y){
 c.save();c.translate(x,y);c.lineJoin='round';c.lineCap='round';c.lineWidth=.003;
 polygon(c,[[-.047,0],[-.034,-.026],[-.011,-.008],[.052,-.009],[.051,.003],[.043,.004],[.043,.015],[.032,.016],[.032,.005],[.022,.005],[.021,.017],[.012,.017],[.013,.005],[-.012,.005],[-.031,.025]],ink.gold);
 polygon(c,[[-.037,-.002],[-.032,-.014],[-.019,-.003],[-.03,.011]],ink.edge,ink.rust);
 c.strokeStyle=ink.light;c.lineWidth=.0018;c.beginPath();c.moveTo(-.041,-.001);c.lineTo(-.033,-.02);c.lineTo(-.013,-.004);c.lineTo(.047,-.005);c.moveTo(-.031,-.007);c.lineTo(-.024,-.002);c.lineTo(-.03,.004);c.stroke();c.restore();
}
export function drawRelicMap(c,x,y){c.save();c.translate(x,y);c.lineWidth=.004;polygon(c,[[-.065,-.051],[-.034,-.061],[-.013,-.054],[.02,-.066],[.065,-.055],[.058,-.015],[.068,.047],[.033,.06],[.012,.052],[-.025,.066],[-.063,.052]],RELIC_INK.paper);c.strokeStyle='#715039';c.lineWidth=.002;c.beginPath();c.moveTo(-.024,-.055);c.lineTo(-.018,.059);c.moveTo(.022,-.056);c.lineTo(.029,.055);c.stroke();c.strokeStyle='#542b24';c.lineWidth=.004;c.beginPath();c.moveTo(-.042,.029);c.lineTo(-.029,.006);c.lineTo(.004,.016);c.lineTo(.018,-.021);c.lineTo(.039,-.028);c.stroke();c.beginPath();c.moveTo(.029,-.038);c.lineTo(.045,-.02);c.moveTo(.044,-.037);c.lineTo(.029,-.02);c.stroke();c.strokeStyle='#e4bc80';c.lineWidth=.002;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-.054+i*.022,.04);c.lineTo(-.047+i*.022,.033);c.stroke()}c.restore()}
export function drawRelicPot(c,p,r){
 c.save();c.translate(p.x,p.y);c.scale(r,r);c.lineJoin='round';c.lineCap='round';c.lineWidth=.105;
 c.fillStyle=ink.clay;c.strokeStyle=ink.edge;c.beginPath();c.moveTo(-.61,-.64);c.bezierCurveTo(-.78,-.37,-1,-.08,-.96,.28);c.bezierCurveTo(-.9,.72,-.48,.94,-.06,.95);c.bezierCurveTo(.47,.98,.92,.7,.97,.25);c.bezierCurveTo(1,-.09,.78,-.43,.59,-.65);c.closePath();c.fill();c.stroke();
 polygon(c,[[-.68,-.96],[.62,-1],[.58,-.69],[-.59,-.67]],'#ce935a');
 c.strokeStyle='#593223';c.lineWidth=.085;c.beginPath();c.moveTo(-.87,.18);c.lineTo(-.56,-.13);c.lineTo(-.15,.2);c.lineTo(.09,-.13);c.lineTo(.41,.21);c.lineTo(.68,-.12);c.lineTo(.91,.04);c.moveTo(-.81,.36);c.lineTo(-.55,.09);c.lineTo(-.12,.41);c.lineTo(.12,.08);c.lineTo(.44,.4);c.lineTo(.71,.08);c.lineTo(.93,.22);c.stroke();
 c.strokeStyle='#ebbd83';c.lineWidth=.055;c.beginPath();c.moveTo(-.55,-.82);c.lineTo(.47,-.86);c.moveTo(-.7,-.34);c.quadraticCurveTo(-.84,-.08,-.78,.04);c.moveTo(-.4,.79);c.lineTo(.26,.81);c.stroke();c.restore();
}
export function drawRelicThorns(c,size){
 c.save();c.scale(size,size);c.lineJoin='round';c.lineCap='round';c.lineWidth=.036;
 polygon(c,[[.02,.025],[.975,.02],[.98,.98],[.025,.985]],'#50443d','#000');
 polygon(c,[[.035,.88],[.175,.12],[.35,.57],[.46,.1],[.65,.59],[.77,.13],[.95,.89]],'#dfcba4','#000');
 c.strokeStyle='#665047';c.lineWidth=.012;c.beginPath();for(const [x,y] of [[.22,.46],[.49,.43],[.8,.45]])for(let i=0;i<3;i++){c.moveTo(x+i*.022,y+i*.06);c.lineTo(x-.012+i*.022,y+.08+i*.06)}c.stroke();
 c.lineWidth=.036;polygon(c,[[.02,.86],[.98,.84],[.96,.97],[.045,.98]],'#9a7558','#000');c.strokeStyle='#c59869';c.lineWidth=.012;c.beginPath();for(let i=0;i<6;i++){c.moveTo(.08+i*.14,.96);c.lineTo(.18+i*.14,.88)}c.stroke();c.restore();
}
export function drawRelicProjectile(c,p){c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(p.vy||0,p.vx??1));c.lineWidth=.003;polygon(c,[[-.1,0],[-.025,-.019],[.014,0],[-.025,.019]],'#6b2b2055','#6b2b2000');polygon(c,[[.043,0],[.008,-.026],[-.031,-.012],[-.024,.018],[.011,.027]],'#ce5c28');polygon(c,[[.029,0],[.003,-.012],[-.012,.001],[.003,.013]],'#f7c66d');c.strokeStyle='#f6d99a';c.lineWidth=.002;c.beginPath();c.moveTo(-.018,-.009);c.lineTo(.008,-.018);c.stroke();c.restore()}

export function drawRelicWall(c,size){
 c.save();c.scale(size,size);c.lineJoin='round';c.lineCap='round';c.lineWidth=.04;
 polygon(c,[[.025,.04],[.965,.025],[.975,.955],[.03,.975]],'#91877f','#000');
 c.strokeStyle='#000';c.lineWidth=.022;c.beginPath();for(let row=1;row<4;row++){const y=row/4;c.moveTo(.025,y+.015);c.lineTo(.975,y-.012)}
 for(let row=0;row<4;row++)for(const x of row%2?[.24,.68]:[.43,.87]){c.moveTo(x,row/4+.015);c.lineTo(x+.012,(row+1)/4)}c.stroke();
 c.strokeStyle='#d4c4ae';c.lineWidth=.014;c.beginPath();for(let row=0;row<4;row++){const y=row/4+.045;c.moveTo(.055,y);c.lineTo(.25,y-.006);c.moveTo(.53,y-.004);c.lineTo(.81,y-.012)}c.stroke();c.strokeStyle='#4a3b39';c.lineWidth=.009;c.beginPath();c.moveTo(.15,.11);c.lineTo(.12,.18);c.moveTo(.55,.58);c.lineTo(.6,.64);c.moveTo(.84,.83);c.lineTo(.88,.9);c.stroke();c.restore();
}
