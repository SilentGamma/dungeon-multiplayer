import assert from 'node:assert/strict';
import {createMusic} from './public/music.mjs';
import {createAttackAudio} from './public/attack-audio.mjs';
import {CAMERA_ZOOM,VIEW_CIRCLE,cameraFrame} from './public/camera.mjs';
import {readdir} from 'node:fs/promises';
const oldAudio=globalThis.Audio,oldInterval=globalThis.setInterval;
globalThis.Audio=class{constructor(){throw Error('removed themes must not create audio')}};
globalThis.setInterval=()=>{throw Error('removed themes must not poll')};
const scenes=[],music=createMusic({onSceneChange:scene=>scenes.push(scene)});
for(const scene of ['menu','explore','combat',null]){music.set(scene);music.setVolume(1);music.setMuted(false);music.setCueActive(false);music.setTransitioning(false)}
assert.deepEqual(scenes,['menu','explore','combat',null]);
assert(!(await readdir(new URL('./public/',import.meta.url))).some(name=>/^music-.*\.(ogg|mp3|wav)$/.test(name)));
globalThis.Audio=oldAudio;globalThis.setInterval=oldInterval;
assert.equal(CAMERA_ZOOM,1.05);assert.equal(VIEW_CIRCLE.explore,.72*.92);assert.equal(VIEW_CIRCLE.locked,.78*.92);assert.equal(VIEW_CIRCLE.boss,1.5*.92);assert(VIEW_CIRCLE.locked>Math.SQRT1_2,'locked-room corners remain visible');
for(const [w,h,m] of [[390,700,true],[844,390,true],[900,700,false],[320,568,true]]){const f=cameraFrame(w,h,m);assert(f.centerX-f.scale/2>=f.side);assert(f.centerY-f.scale/2>=f.top);assert(f.centerY+f.scale/2<=h-f.bottom)}

console.log('PASS: removed theme files, no theme audio requests or timers, preserved scene callbacks and camera geometry');
