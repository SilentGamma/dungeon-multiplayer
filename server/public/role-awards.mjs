import {ROLES} from './roles.mjs';
const KEY='larp-role-awards-v1';
// Private progression for this browser profile; never included in party snapshots.
export function createRoleAwards(storage=globalThis.localStorage){let awards={};try{const saved=JSON.parse(storage.getItem(KEY)||'{}');for(const color of Object.keys(ROLES))if(saved?.[color]==='GOLD')awards[color]='GOLD'}catch{}
 return {has:color=>awards[color]==='GOLD',roles:()=>Object.keys(awards),record(state,id){if(state?.phase!=='completed'||!state.results?.won)return false;const row=state.results.players?.find(p=>p.id===id),player=state.run?.players.find(p=>p.id===id);if(row?.rank!=='S'||!row.finished||!Object.hasOwn(ROLES,player?.color)||awards[player.color]==='GOLD')return false;awards[player.color]='GOLD';try{storage.setItem(KEY,JSON.stringify(awards))}catch{}return true}};
}
