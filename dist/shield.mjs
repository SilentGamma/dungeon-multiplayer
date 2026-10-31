// Shield collision exists only while the action is actively held.
export function shieldActive(p,time=0){return !!(p?.shielding&&p.holding&&p.usingAttack&&p.shield>0&&p.hp>0&&!p.arrived&&!p.deceased&&!p.paused&&!p.connectionLost&&!p.reviving&&!p.throwing&&!p.grabbedBy&&time>=(p.stunUntil||0))}
