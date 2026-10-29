export const AUDIO_EVENT_SECONDS=1.2,AUDIO_EVENT_CAP=32;
export function emitAttackSound(run,entity,type){
 const time=run.time||0,serial=run.audioSerial=(run.audioSerial||0)+1;
 const event={id:`${run.round||1}:${serial}`,serial,type,x:Math.round(entity.x*1e4)/1e4,y:Math.round(entity.y*1e4)/1e4,time};
 run.audioEvents=[...(run.audioEvents||[]).filter(e=>time-e.time<=AUDIO_EVENT_SECONDS),event].slice(-AUDIO_EVENT_CAP);
 return event;
}
