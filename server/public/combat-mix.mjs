// Calibrated separately from music, menus and quiet movement/utility foley.
export const COMBAT_SOUNDS=new Set(['coral','purple','pink','gold','green','blue','teal','lime','walker','sleeper','flapper','creeper','warden','throw','impact','explosion','shock','sniper-hit','pot-break','shield-hit','shield-break','hurt','down']);
export const COMBAT_CALIBRATION=Object.freeze({makeup:.9,threshold:-10,ratio:2.4,knee:6,attack:.002,release:.08,ceiling:-10});
function settings(node,values){for(const [key,value] of Object.entries(values))if(node[key])node[key].value=value}
export function connectCombatMix(context,input){
 const body=context.createDynamicsCompressor(),makeup=context.createGain(),limiter=context.createDynamicsCompressor();
 settings(body,{threshold:COMBAT_CALIBRATION.threshold,ratio:COMBAT_CALIBRATION.ratio,knee:COMBAT_CALIBRATION.knee,attack:COMBAT_CALIBRATION.attack,release:COMBAT_CALIBRATION.release});
 makeup.gain.value=COMBAT_CALIBRATION.makeup;
 settings(limiter,{threshold:COMBAT_CALIBRATION.ceiling,ratio:20,knee:0,attack:.001,release:.05});
 input.connect(body);body.connect(makeup);makeup.connect(limiter);limiter.connect(context.destination);
 return {body,makeup,limiter};
}
