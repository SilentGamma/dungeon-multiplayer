import assert from 'node:assert/strict';
import {Session} from './session.mjs';
import {prepareRevives,advanceRevives} from '../dist/revive.mjs';
import {beginGrapple} from '../dist/throw.mjs';
import {frameFor} from './protocol.mjs';
const s=new Session({code:'1'});s.join({id:'a',name:'A'});s.join({id:'b',name:'B'});s.start('a');
const [a,b]=s.run.players;b.x=a.x;b.y=a.y;b.hp=0;
prepareRevives(s.run);assert.equal(a.reviving,'b','ordinary downed players remain revivable');
assert(s.leave('b'));assert(b.deceased);assert.equal(a.reviving,null);assert.equal(b.reviveProgress,0);
for(let i=0;i<600;i++){prepareRevives(s.run);advanceRevives(s.run,1/60)}
assert.equal(b.hp,0);assert.equal(a.reviving,null);assert.equal(b.reviverId,null);
a.color='teal';a.holding=true;assert.equal(beginGrapple(s.run,a),false,'deceased players cannot be thrown');
const frame=frameFor({run:s.run},'a',new Map());assert.equal(frame.players.find(p=>p.id==='b').deceased,true);
s.tick(.1);assert.equal(s.phase,'playing','remaining players can continue');
a.hp=0;s.tick(.1);assert.equal(s.endReason,'lost','run ends when no living players remain');
const host=new Session({code:'2'});host.join({id:'a',name:'A'});host.join({id:'b',name:'B'});host.start('a');host.leave('a');host.tick(.1);assert.equal(host.phase,'playing','host disconnect does not close an active run');
console.log('PASS: disconnected players are permanently deceased, cannot be revived or thrown, and do not end a surviving team\'s run');
