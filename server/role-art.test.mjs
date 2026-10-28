import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ROLE_ART,getToken,preloadTokens} from './public/role-art.mjs';
import {createGameServer} from './http.mjs';
assert.deepEqual(Object.keys(ROLE_ART).sort(),['blue','coral','gold','green','lime','pink','purple','teal']);
let loads=0;globalThis.Image=class{constructor(){loads++;this.complete=true;this.naturalWidth=128}};preloadTokens();assert.equal(loads,8);for(let n=0;n<120;n++)for(const color of Object.keys(ROLE_ART))assert(getToken(color));assert.equal(loads,8,'tokens load once, not every rendered frame');assert.equal(getToken('unknown'),null);
let total=0;for(const art of Object.values(ROLE_ART))for(const asset of [art.portrait,art.token]){const file=new URL('./public'+asset,import.meta.url);const bytes=await readFile(file);assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');assert(bytes.length<100000,'individual assets remain small');total+=bytes.length}assert(total<500000,'entire art set stays below 500 kB');
const server=createGameServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));try{const response=await fetch(`http://127.0.0.1:${server.address().port}`+ROLE_ART.coral.token);assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'image/webp');assert(response.headers.get('cache-control').includes('immutable'));assert((await response.arrayBuffer()).byteLength>0)}finally{await new Promise(r=>server.close(r))}
console.log('PASS: eight role portraits and tokens, cached image reuse, optimized WebP assets and correct HTTP image delivery');
