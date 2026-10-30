const strengths={explosion:18,shock:10,impact:7,gold:8,coral:4,throw:3};
export function createImpactShake(){
 let seen=new Set(),until=0,power=0,round=null;
 return {reset(){seen.clear();until=0;power=0;round=null},set(run,me){if(round!==run.round){seen.clear();round=run.round;until=0}const p=run.players.find(p=>p.id===me);if(!p)return;for(const e of run.audioEvents||[]){if(seen.has(e.id))continue;seen.add(e.id);if(seen.size>128)seen.delete(seen.values().next().value);const distance=Math.hypot(e.x-p.x,e.y-p.y),strength=strengths[e.type]||0;if(strength&&(run.time-e.time)<.4&&distance<2){power=Math.min(18,Math.max(power,strength/(1+distance)));until=performance.now()+(e.type==='explosion'?520:230)}}},offset(now){if(now>=until||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){power=0;return {x:0,y:0}}const amplitude=power*Math.min(1,(until-now)/350);return {x:Math.sin(now*.071)*amplitude,y:Math.cos(now*.093)*amplitude*.7}}};
}
