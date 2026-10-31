import {NAME_WORDS} from './name-word-list.mjs';
export const NAME_LIMIT=12;
// Confusable/leet folding is used only for matching, never for display.
const lookalikes={'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','у':'y','і':'i','ј':'j','ѕ':'s','к':'k','м':'m','т':'t','в':'b','н':'h','α':'a','ο':'o','ρ':'p','χ':'x','υ':'u','ι':'i','κ':'k','τ':'t'};
const leet={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','9':'g'};
function fold(s){return s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[а-еорсхуіјѕкмтвнαορχυικτ]/gu,c=>lookalikes[c]||c)}
const compact=s=>fold(s).replace(/[01345789]/g,c=>leet[c]).replace(/[^a-z]/g,'');
const collapse=s=>s.replace(/(.)\1+/g,'$1');
// Identity labels are not insults; these source-list entries are not restricted.
const neutral=new Set(['gay','lesbian','queer','bisexual','homosexual','homoerotic','transgender','transsexual','transvestite','intersex','black','white','yellow','asian','japanese','african','christ','jesus','god','hell','beaver','butt','butts']);
const terms=new Set(NAME_WORDS.filter(w=>!neutral.has(w.toLowerCase())).map(compact).filter(Boolean));
const strong=['fuck','fuk','shit','bitch','cunt','nigger','nigga','faggot','asshole','arsehole','motherfucker','dickhead','cockhead','whore','slut','porn','hentai','nazi','hitler','rapist','dildo','caralho','putain'];
const roots=strong.map(collapse);
const harmless=new Set(['scunthorpe','hancock','cockburn','cockrell','dickens','dickson','dickinson','cass','cassie','cassidy','cassius','cassandra','assassin','therapist','analysis','analyst','canal','canary','buttercup','butterfly','grape']);
export function normalizePlayerName(value){return typeof value==='string'?value.normalize('NFKC').trim().replace(/\s+/gu,' '):''}
export function playerNameError(value){if(typeof value!=='string'||value.length>256)return 'Use a name with 1–12 characters.';if(/[\p{C}]/u.test(value))return 'Names cannot contain hidden or control characters.';const name=normalizePlayerName(value);if(!name||Array.from(name).length>NAME_LIMIT)return 'Use a name with 1–12 characters.';if(!/^[\p{L}\p{N}][\p{L}\p{M}\p{N} _.'-]*$/u.test(name))return "Use letters, numbers, spaces, - _ . or '.";const key=compact(name),plain=fold(name).replace(/[^a-z]/g,'');if(!harmless.has(plain)&&!harmless.has(plain.replace(/\d+$/,''))){const parts=fold(name).match(/[a-z0-9]+/g)||[],candidates=[key,...parts.map(compact)];if(candidates.some(w=>terms.has(w))||roots.some(root=>collapse(key).includes(root)))return 'Choose a different player name.'}return ''}
export function requirePlayerName(value){const error=playerNameError(value);if(error)throw Error(error);return normalizePlayerName(value)}
