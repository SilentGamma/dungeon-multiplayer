import assert from 'node:assert/strict';
import {nextSamples, positionAt} from './public/interpolation.mjs';
const frame = x => ({players: [{id: 'p', x, y: 1}], enemies: [{id: 'e', x, y: 2}]});
let previous = frame(0);
let samples = nextSamples(null, previous, new Map(), 0);
let current = frame(1);
samples = nextSamples(previous, current, samples, 100);
assert.deepEqual(positionAt(samples.get('e:e'), current.enemies[0], 150), {x: .5, y: 2});
assert.deepEqual(positionAt(samples.get('p:p'), current.players[0], 175), {x: .75, y: 1});
// An early update starts at the displayed position rather than jumping to the last target.
previous = current; current = frame(2);
samples = nextSamples(previous, current, samples, 150);
assert.equal(positionAt(samples.get('e:e'), current.enemies[0], 150).x, .5);
assert.equal(positionAt(samples.get('e:e'), current.enemies[0], 180).x, 1.25);
// Disappearing and reappearing entities must not use stale positions.
previous = current; current = {players: [], enemies: []};
samples = nextSamples(previous, current, samples, 200);
previous = current; current = frame(8);
samples = nextSamples(previous, current, samples, 300);
assert.equal(positionAt(samples.get('e:e'), current.enemies[0], 300).x, 8);
assert.equal(positionAt(samples.get('e:e'), current.enemies[0], 1000).x, 8);
console.log('PASS: smooth player and enemy snapshots, jitter, and visibility changes');
