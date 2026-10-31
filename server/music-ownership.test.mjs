import assert from 'node:assert/strict';
import {createMusic} from './public/music.mjs';
import {createAttackAudio} from './public/attack-audio.mjs';
import {CAMERA_ZOOM,VIEW_CIRCLE,cameraFrame} from './public/camera.mjs';
const intervals=[],tracks=[],listeners={};let clock=0;const originalInterval=globalThis.setInterval;
globalThis.setInterval=fn=>(intervals.push(fn),intervals.length);
globalThis.document={hidden:false,addEventListener(k,fn){listeners[k]=fn}};
globalThis.Audio=class{constructor(src){this.src=src;this.paused=true;this.volume=0;this.currentTime=0;this.duration=90;tracks.push(this)}addEventListener(){}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}};
const sources=[],context={get currentTime(){return clock},state:'running',destination:{},createGain:()=>({gain:{value:0,cancelScheduledValues(){},setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){}}),createDynamicsCompressor:()=>({connect(){}}),createBuffer:()=>({duration:.4,copyToChannel(){}}),createBufferSource(){const s={connect(){},disconnect(){},start(t=0){this.startAt=t||clock},stop(t=0){this.stopAt=t||clock}};sources.push(s);return s}};
let effects;const music=createMusic({onSceneChange:()=>effects?.fadeTracks()});effects=createAttackAudio({onMusicActive:yes=>music.setCueActive(yes),contextFactory:()=>context,loadClip:async()=>{throw Error()}});effects.unlock();
function tick(n=1){for(let i=0;i<n;i++){clock+=.04;for(const s of sources)if(!s.ended&&clock>=Math.min(s.stopAt??Infinity,s.startAt+s.buffer.duration)){s.ended=true;s.onended?.()}for(const timer of intervals)timer();const themes=tracks.filter(a=>!a.paused&&a.volume>0).length,cues=sources.filter(s=>!s.ended&&s.startAt<=clock).length;assert(themes+cues<=1,'themes and event tracks never stack')}}
music.set('explore');tick(6);assert(!tracks[1].paused);effects.play('round');tick(6);assert(tracks.every(a=>a.paused));assert(sources.some(s=>!s.ended));
// Combat can start after an entry snapshot while the player stays in one room.
music.set('combat');tick(8);assert(tracks[1].paused);assert(!tracks[2].paused);assert(sources.every(s=>s.ended));
effects.play('goal');effects.play('room-clear');tick(6);assert(tracks.every(a=>a.paused));tick(15);assert(!tracks[2].paused,'one current theme resumes after the latest event cue');
effects.play('round');music.set(null);music.setTransitioning(true);effects.reset({fadeMusic:true});tick(12);listeners.pointerdown();tick(3);assert(tracks.every(a=>a.paused));assert(sources.every(s=>s.ended),'leaving cancels even a cue scheduled to start later');
music.set('menu');music.setTransitioning(false);tick(6);assert(!tracks[0].paused);assert(tracks[1].paused&&tracks[2].paused);
music.set(null);tick(6);await effects.ready();
// A delayed play promise must never revive a theme from a previous scene.
const delayed=[],pending=[];globalThis.Audio=class{constructor(){this.paused=true;this.volume=0;this.currentTime=0;this.duration=90;delayed.push(this)}addEventListener(){}play(){this.paused=false;return new Promise(resolve=>pending.push({track:this,resolve}))}pause(){this.paused=true}};
const late=createMusic();late.set('menu');late.set('combat');intervals.at(-1)();const abandoned=pending[0];abandoned.track.paused=false;abandoned.resolve();await Promise.resolve();await Promise.resolve();assert(delayed[0].paused,'late old play completion is stopped');late.setTransitioning(true);const battle=pending.at(-1);battle.track.paused=false;battle.resolve();await Promise.resolve();await Promise.resolve();assert(delayed.every(a=>a.paused),'leaving while play is pending cannot resurrect any track');globalThis.setInterval=originalInterval;
assert.equal(CAMERA_ZOOM,1.05);assert.equal(VIEW_CIRCLE.explore,.72*.92);assert.equal(VIEW_CIRCLE.locked,.78*.92);assert.equal(VIEW_CIRCLE.boss,1.5*.92);assert(VIEW_CIRCLE.locked>Math.SQRT1_2,'locked-room corners remain visible');
for(const [w,h,m] of [[390,700,true],[844,390,true],[900,700,false],[320,568,true]]){const f=cameraFrame(w,h,m);assert(f.centerX-f.scale/2>=f.side);assert(f.centerY-f.scale/2>=f.top);assert(f.centerY+f.scale/2<=h-f.bottom)}

console.log('PASS: exclusive themes/event music, same-room fight entry, rapid cue replacement, leave during scheduled playback, delayed-play cancellation, 5% zoom and exactly 8% smaller sight circles');
