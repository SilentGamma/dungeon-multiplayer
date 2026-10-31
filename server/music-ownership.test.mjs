import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createMusic,musicScene,THEME_URLS} from './public/music.mjs';
import {CAMERA_ZOOM,VIEW_CIRCLE,cameraFrame} from './public/camera.mjs';
const timers=[],tracks=[],listeners={},pending=[];
globalThis.document={hidden:false,addEventListener(k,fn){listeners[k]=fn}};
globalThis.setInterval=fn=>(timers.push(fn),timers.length);
globalThis.Audio=class{constructor(src){this.src=src;this.paused=true;this.currentTime=0;this.duration=100;this.listeners={};tracks.push(this)}addEventListener(k,fn){this.listeners[k]=fn}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}};
const tick=async(n=15)=>{for(let i=0;i<n;i++){for(const timer of timers)timer();await Promise.resolve();assert(tracks.filter(a=>!a.paused&&a.volume>0).length<=1,'at most one audible theme')}};
const music=createMusic();music.set('menu');await tick();assert.equal(tracks[0].volume,.25);assert(tracks[0].loop);
music.set('explore');await tick();assert(tracks[0].paused);assert.equal(tracks[1].currentTime,55);assert.equal(tracks[1].volume,.25);
music.set('combat');music.set('warden');await tick();assert.equal(tracks.at(-1).src,THEME_URLS.warden);assert.equal(tracks.at(-1).volume,.25);
music.setCueActive(true);await tick();assert(tracks.every(a=>a.paused));music.setCueActive(false);await tick();assert(!tracks.at(-1).paused);
music.setTransitioning(true);await tick();listeners.pointerdown();assert(tracks.every(a=>a.paused));music.setTransitioning(false);await tick();
music.set('victory');await tick();const won=tracks.at(-1);assert(!won.loop);won.paused=true;won.listeners.ended();await tick(40);assert.equal(tracks.at(-1),won);assert(won.paused,'result theme does not restart on later snapshots');
music.set('defeat');await tick();assert.equal(tracks.at(-1).src,THEME_URLS.defeat);assert(!tracks.at(-1).loop);
music.setVolume(0);assert(tracks.every(a=>a.paused));music.setVolume(.5);await tick();music.setMuted(true);assert(tracks.every(a=>a.paused));music.setMuted(false);await tick();document.hidden=true;listeners.visibilitychange();assert(tracks.every(a=>a.paused));document.hidden=false;listeners.visibilitychange();await tick();music.set(null);await tick();assert(tracks.every(a=>a.paused));
// A late play completion belongs to its old audio element, never to a new owner.
globalThis.Audio=class extends globalThis.Audio{play(){this.paused=false;return new Promise(resolve=>pending.push({audio:this,resolve}))}};
const late=createMusic();late.set('explore');await tick();const stale=pending.at(-1);late.set('warden');await tick();stale.audio.paused=false;stale.resolve();await Promise.resolve();assert(stale.audio.paused);late.set(null);await tick();for(const p of pending)if(p!==stale){p.audio.paused=false;p.resolve()}await Promise.resolve();assert(tracks.every(a=>a.paused));
const playing={phase:'playing',run:{kind:'dungeon',players:[{id:'p',x:1.2,y:1.2}],enemies:[]}};
assert.equal(musicScene(playing,'p'),'explore');playing.run.enemies.push({hp:1,room:8});assert.equal(musicScene(playing,'p'),'combat');playing.run.kind='boss';assert.equal(musicScene(playing,'p'),'warden');for(const phase of ['completed','ended']){assert.equal(musicScene({phase,results:{players:[{id:'p',rank:'F'}]}},'p'),'defeat');assert.equal(musicScene({phase,results:{players:[{id:'p',rank:'A'}]}},'p'),'victory')}
const manifest=JSON.parse(await readFile(new URL('./public/music-manifest.json',import.meta.url)));for(const key of Object.keys(THEME_URLS)){const data=await readFile(new URL('./public'+THEME_URLS[key],import.meta.url));assert(data.length>1000);assert(Math.abs(manifest[key].integrated_lufs+18)<1.5,key+' loudness matched');assert(manifest[key].true_peak_dbtp<-.5,key+' has headroom')}
const app=await readFile(new URL('./public/app.mjs',import.meta.url),'utf8');assert(app.includes('music.set(musicScene(s,me))'));assert(!app.includes('if(phaseCue)attackAudio.play(phaseCue);if(!closing)'));
assert.equal(CAMERA_ZOOM,1.05);assert.equal(VIEW_CIRCLE.explore,.72*.92);assert.equal(VIEW_CIRCLE.locked,.78*.92);assert.equal(VIEW_CIRCLE.boss,1.5*.92);
for(const [w,h,m] of [[390,700,true],[844,390,true],[900,700,false],[320,568,true]]){const f=cameraFrame(w,h,m);assert(f.centerX-f.scale/2>=f.side);assert(f.centerY+f.scale/2<=h-f.bottom)}
console.log('PASS: six loudness-matched themes, boss and personal F-rank routing, exclusive playback, transitions, cue ducking, late promises, mute/visibility, one-shot results and retained camera');
