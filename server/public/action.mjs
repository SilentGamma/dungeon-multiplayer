export const ACTION_HOLD_SECONDS=.2;
export function advanceActionShield(run,p){
 const now=run.time||0;
 if(p.wrestlerState==='orbit'||p.grappleTarget){p.shielding=false;return;}
 if(!p.usingAttack||!p.holding||p.wrestlerReleased||p.hp<=0||p.arrived||p.deceased||p.reviving||p.throwing||p.grabbedBy||now<(p.stunUntil||0)||!Number.isFinite(p.attackStarted))return;
 if(now+1e-9-p.attackStarted<ACTION_HOLD_SECONDS)return;
 p.actionShielded=true;
 if(p.shield>0&&!p.shielding){p.shielding=true;p.shieldRaisedAt=now}
}
