import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {publicOrigin} from './seo.mjs';
import {createGameServer} from './http.mjs';
assert.equal(publicOrigin({}),'https://dungeon-multiplayer.onrender.com');
assert.equal(publicOrigin({RENDER_EXTERNAL_URL:'https://larp-dungeon.onrender.com'}),'https://larp-dungeon.onrender.com');
assert.equal(publicOrigin({PUBLIC_SITE_URL:'https://larp.play/path?test=1',RENDER_EXTERNAL_URL:'https://old.onrender.com'}),'https://larp.play');
for(const bad of ['javascript:alert(1)','http://insecure.example','https://user:password@example.com','not a url'])assert.equal(publicOrigin({PUBLIC_SITE_URL:bad}),'https://dungeon-multiplayer.onrender.com');
const saved=process.env.PUBLIC_SITE_URL;process.env.PUBLIC_SITE_URL='https://larp.play';
const server=createGameServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
try{
 const response=await fetch(base+'/');const html=await response.text();assert.equal(response.status,200);assert(!html.includes('__SITE_ORIGIN__'));assert(html.includes('<title>Larp Dungeon | Free Multiplayer Roguelite Game</title>'));assert(html.includes('name="description"'));assert(html.includes('rel="canonical" href="https://larp.play/"'));assert(html.includes('https://larp.play/larp-dungeon-social-v1.png'));assert(html.includes('id="dungeon"'));assert(!response.headers.get('x-robots-tag'));
 const structured=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.equal(structured['@type'],'VideoGame');assert.equal(structured.name,'Larp Dungeon');assert.equal(structured.numberOfPlayers.maxValue,8);assert.equal(structured.isAccessibleForFree,true);assert(!structured.aggregateRating);
 const hostile=await (await fetch(base+'/',{headers:{host:'attacker.invalid'}})).text();assert(hostile.includes('href="https://larp.play/"'));assert(!hostile.includes('https://attacker.invalid'));
 const robots=await fetch(base+'/robots.txt');assert(robots.headers.get('content-type').startsWith('text/plain'));assert((await robots.text()).includes('Sitemap: https://larp.play/sitemap.xml'));
 const sitemap=await fetch(base+'/sitemap.xml');assert(sitemap.headers.get('content-type').startsWith('application/xml'));assert((await sitemap.text()).includes('<loc>https://larp.play/</loc>'));
 for(const url of ['/favicon.svg','/larp-dungeon-social-v1.png']){const asset=await fetch(base+url);assert.equal(asset.status,200);assert(asset.headers.get('content-type').startsWith('image/'));assert.equal((await fetch(base+url,{method:'HEAD'})).status,200)}
 const png=await readFile(new URL('./public/larp-dungeon-social-v1.png',import.meta.url));assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
 assert.equal((await fetch(base+'/missing-page')).status,404);assert.equal((await fetch(base+'/health')).headers.get('x-robots-tag'),'noindex');
 assert.equal((await fetch(base+'/',{method:'HEAD'})).status,200);
}finally{await new Promise(resolve=>server.close(resolve));if(saved===undefined)delete process.env.PUBLIC_SITE_URL;else process.env.PUBLIC_SITE_URL=saved}
console.log('PASS: crawlable metadata, safe canonical origin, structured game data, robots, sitemap, preview assets and unchanged game entry');
