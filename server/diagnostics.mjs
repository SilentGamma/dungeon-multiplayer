// Lightweight process-wide measurements; no player or lobby details are exposed.
export function createDiagnostics({now=()=>performance.now(),cpu=()=>process.cpuUsage()}={}) {
 const bucketMs=5000,windowMs=30000,interval=1000/60;
 let bucketStart=now(),cpuStart=cpu(),cpuAt=bucketStart,cpuCorePercent=null;
 let current={start:bucketStart,delay:0,work:0},completed=[];
 function observe(timestamp,intervalMs,workMs) {
  current.delay=Math.max(current.delay,Math.max(0,intervalMs-interval));
  current.work=Math.max(current.work,Math.max(0,workMs));
  if(timestamp-bucketStart>=bucketMs){
   completed.push(current);completed=completed.filter(b=>timestamp-b.start<windowMs);
   const used=cpu(),elapsed=timestamp-cpuAt;
   if(elapsed>0)cpuCorePercent=Math.round(((used.user-cpuStart.user)+(used.system-cpuStart.system))/1000/elapsed*1000)/10;
   cpuStart=used;cpuAt=timestamp;bucketStart=timestamp;current={start:timestamp,delay:0,work:0};
  }
 }
 function snapshot(){
  const timestamp=now(),recent=completed.filter(b=>timestamp-b.start<windowMs).concat(current);
  return {windowSeconds:30,tickDelayPeakMs:Math.round(Math.max(...recent.map(b=>b.delay))),tickWorkPeakMs:Math.round(Math.max(...recent.map(b=>b.work))),cpuCorePercent};
 }
 return {observe,snapshot};
}
