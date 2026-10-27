// HTTP round-trip time to this game server, measured independently of frames.
export function pingSummary(samples, now) {
  const recent=samples.filter(s=>now-s.time<=30000);
  if (!recent.length) return {recent,peak:null,spike:false};
  const last=recent.at(-1),history=recent.slice(0,-1).map(s=>s.ms).sort((a,b)=>a-b);
  const baseline=history.length?history[Math.floor(history.length/2)]:last.ms;
  const spike=last.ms>=250 && last.ms>=baseline+100;
  return {recent,peak:Math.max(...recent.map(s=>s.ms)),spike};
}
export function createPingMonitor(element,serverElement=null) {
  let stopped=false, timer=null, timeout=null, pending=null, samples=[], spikeUntil=0;
  function show(text,state){element.textContent=text;element.dataset.state=state}
  async function measure(){
    if(stopped||pending)return;
    const controller=new AbortController();pending=controller;
    const start=performance.now();
    const waiting=setTimeout(()=>{if(!stopped&&pending===controller)show('Ping: waiting…','slow')},2000);
    timeout=setTimeout(()=>controller.abort(),5000);
    try {
      const response=await fetch('/health',{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw Error('Ping failed');
      const data=await response.json();
      const now=performance.now(),ms=Math.round(now-start);
      if(serverElement&&data.diagnostics){const d=data.diagnostics;serverElement.textContent=`Server delay: ${d.tickDelayPeakMs} ms peak · CPU: ${d.cpuCorePercent===null?'measuring':d.cpuCorePercent+'% of a core'}`;}
      samples.push({time:now,ms});
      const summary=pingSummary(samples,now);samples=summary.recent;
      if(summary.spike)spikeUntil=now+6000;
      const spike=now<spikeUntil;
      show(`Ping: ${ms} ms · Peak: ${summary.peak} ms${spike?' · SPIKE':''}`,spike||ms>=250?'slow':'ok');
    } catch {if(!stopped){show('Ping: unavailable','slow');if(serverElement)serverElement.textContent='Server: unavailable'}}
    finally {clearTimeout(waiting);clearTimeout(timeout);if(pending===controller)pending=null}
  }
  show('Ping: measuring…','pending');
  measure();timer=setInterval(measure,2000);
  return {stop(){stopped=true;clearInterval(timer);clearTimeout(timeout);pending?.abort();pending=null;}};
}
