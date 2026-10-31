import {shieldActive} from './shield.mjs';
export const ACTION_COLORS=Object.freeze({hit:'#ffffff',shield:'#168cff',break:'#ff44cc',stun:'#ffe600',poison:'#a83cff',heal:'#35ed68'});
export function actionFlash(entity,time,now,local={}){if(entity.deceased)return null;if(entity.hurtUntil>time||entity.hitUntil>time||local.hit>now)return ACTION_COLORS.hit;if(entity.shieldBreakUntil>time||local.broken>now)return ACTION_COLORS.break;if(local.heal>now)return ACTION_COLORS.heal;const pulse=Math.floor(now/180)%2===0;if(!pulse)return null;if(entity.swiftUntil>time)return ACTION_COLORS.hit;if(entity.stunUntil>time)return ACTION_COLORS.stun;if(entity.poisonUntil>time)return ACTION_COLORS.poison;if(entity.shield===0&&entity.maxShield>0)return ACTION_COLORS.break;if(shieldActive(entity,time))return ACTION_COLORS.shield;return null}

export function blendTint(base,effect,weight=.55){const a=base.slice(1).match(/../g).map(x=>parseInt(x,16)),b=effect.slice(1).match(/../g).map(x=>parseInt(x,16));return '#'+a.map((n,i)=>Math.round(n*(1-weight)+b[i]*weight).toString(16).padStart(2,'0')).join('')}

// Replayed timestamps and shield contact cannot create a fresh enemy damage flash.
export function enemyActionFlash(entity,time,now,local={}){return actionFlash({...entity,hitUntil:0,hurtUntil:0},time,now,local)}
