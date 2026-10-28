export const ROLE_ART=Object.freeze({
 coral:{name:'Brawler',portrait:'/brawler-portrait-v1.webp',token:'/brawler-token-v1.webp'},
 green:{name:'Chef',portrait:'/chef-portrait-v1.webp',token:'/chef-token-v1.webp'},
 teal:{name:'Wrestler',portrait:'/wrestler-portrait-v1.webp',token:'/wrestler-token-v1.webp'},
 lime:{name:'Joker',portrait:'/joker-portrait-v1.webp',token:'/joker-token-v1.webp'}
});
const tokens=new Map();
export function getToken(color){const art=ROLE_ART[color];if(!art||typeof Image!=='function')return null;let img=tokens.get(color);if(!img){img=new Image();img.decoding='async';img.src=art.token;tokens.set(color,img)}return img.complete&&img.naturalWidth>0?img:null}
export function preloadTokens(){for(const color of Object.keys(ROLE_ART))getToken(color)}
