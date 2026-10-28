// Display size only; authoritative movement and collision radii are unchanged.
export const PLAYER_VISUAL_RADIUS=.026;
export const ROLE_ART=Object.freeze({
 coral:{name:'Brawler',portrait:'/brawler-portrait-v2.webp',token:'/brawler-token-v2.webp'},
 green:{name:'Chef',portrait:'/chef-portrait-v2.webp',token:'/chef-token-v2.webp'},
 teal:{name:'Wrestler',portrait:'/wrestler-portrait-v2.webp',token:'/wrestler-token-v2.webp'},
 lime:{name:'Joker',portrait:'/joker-portrait-v2.webp',token:'/joker-token-v2.webp'}
});
const tokens=new Map();
export function getToken(color){const art=ROLE_ART[color];if(!art||typeof Image!=='function')return null;let img=tokens.get(color);if(!img){img=new Image();img.decoding='async';img.src=art.token;tokens.set(color,img)}return img.complete&&img.naturalWidth>0?img:null}
export function preloadTokens(){for(const color of Object.keys(ROLE_ART))getToken(color)}
