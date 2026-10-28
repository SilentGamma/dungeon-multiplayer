// Rendering adapts to device performance; network latency is independent.
export const DEFAULT_FPS=60,FALLBACK_FPS=30;
export function createFramePacer(){
 let fps=DEFAULT_FPS,lastDraw=0,lastCallback=null,windowStart=0,intervals=0,slow=0,costs=[],recoverAfter=0;
 function clearWindow(now){windowStart=now;intervals=0;slow=0;costs=[]}
 return {
  get fps(){return fps},
  reset(now=0){fps=DEFAULT_FPS;lastDraw=now;lastCallback=null;recoverAfter=0;clearWindow(now)},
  shouldDraw(now){
   if(lastCallback!==null){const gap=now-lastCallback;if(gap>250)clearWindow(now);else if(gap>0){intervals++;if(gap>24)slow++}}
   lastCallback=now;
   if(now-windowStart>=2000&&intervals>=30){
    const sorted=costs.slice().sort((a,b)=>a-b),p90=sorted.length?sorted[Math.floor((sorted.length-1)*.9)]:0,missed=slow/intervals;
    if(fps===DEFAULT_FPS&&(p90>12||missed>.2)){fps=FALLBACK_FPS;recoverAfter=now+10000}
    else if(fps===FALLBACK_FPS&&now>=recoverAfter&&p90<8&&missed<.1){fps=DEFAULT_FPS;recoverAfter=now+10000}
    clearWindow(now);
   }
   if(now-lastDraw+.5<1000/fps)return false;lastDraw=now;return true;
  },
  complete(ms){if(Number.isFinite(ms)&&ms>=0){costs.push(ms);if(costs.length>512)costs.shift()}}
 };
}
