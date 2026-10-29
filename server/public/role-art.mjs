// Display size only; authoritative movement and collision radii are unchanged.
export const PLAYER_VISUAL_RADIUS=.026;
export const ROLE_ART=Object.freeze({
 coral:{name:'Brawler',portrait:'/brawler-portrait-v3.webp',token:'/brawler-token-v3.webp'},
 green:{name:'Chef',portrait:'/chef-portrait-v3.webp',token:'/chef-token-v3.webp'},
 teal:{name:'Wrestler',portrait:'/wrestler-portrait-v2.webp',token:'/wrestler-token-v3.webp'},
 gold:{name:'Brute',portrait:'/brute-portrait-v2.webp',token:'/brute-token-v1.webp'},
 blue:{name:'Sniper',portrait:'/sniper-portrait-v2.webp',token:'/sniper-token-v2.webp'},
 purple:{name:'Perfumer',portrait:'/perfumer-portrait-v2.webp',token:'/perfumer-token-v1.webp'},
 pink:{name:'Dancer',portrait:'/dancer-portrait-v2.webp',token:'/dancer-token-v1.webp'},
 lime:{name:'Joker',portrait:'/joker-portrait-v3.webp',token:'/joker-token-v2.webp'}
});
const tokens=new Map();
export function getToken(color){const art=ROLE_ART[color];if(!art||typeof Image!=='function')return null;let img=tokens.get(color);if(!img){img=new Image();img.decoding='async';img.src=art.token;tokens.set(color,img)}return img.complete&&img.naturalWidth>0?img:null}
export function preloadTokens(){for(const color of Object.keys(ROLE_ART))getToken(color)}
