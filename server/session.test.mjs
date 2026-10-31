import {startReadyParty} from './test-party.mjs';
import assert from 'node:assert/strict';
import {Session} from './session.mjs';
const s=new Session({code:'123456'});s.join({id:'h',name:'Host'});s.join({id:'g',name:'Guest'});assert.notEqual(s.players[0].color,s.players[1].color);assert(!s.choose('g',s.players[0].color));assert(!startReadyParty(s,'g'));assert(startReadyParty(s,'h'));assert.equal(s.phase,'playing');assert(!s.input('unknown',{seq:1,holding:true}));assert(s.input('g',{seq:1,holding:true,attack:true}));assert(!s.input('g',{seq:1,holding:false}));assert(s.input('g',{seq:2,holding:false}));s.tick(.1);assert(s.run.time>0);const snap=s.snapshot();snap.players[0].name='Altered';assert.equal(s.players[0].name,'Host');s.leave('g');assert(!s.closed);assert.equal(s.run.players.find(p=>p.id==='g').deceased,true);assert.equal(s.run.players.find(p=>p.id==='g').hp,0);assert(!s.input('g',{seq:3,holding:true}));s.tick(.1);assert.equal(s.phase,'playing');console.log('PASS: server-authoritative room membership, roles, input sequencing, simulation and disconnect handling');

const favoriteRoom=new Session({code:'654321'});
assert.equal(favoriteRoom.join({id:'a',name:'A',preferredRole:'teal'}).color,'teal');
assert.notEqual(favoriteRoom.join({id:'b',name:'B',preferredRole:'teal'}).color,'teal');
assert.equal(favoriteRoom.join({id:'c',name:'C',preferredRole:'lime'}).color,'lime');
assert(favoriteRoom.join({id:'d',name:'D',preferredRole:'not-a-role'}).color);
for(let i=4;i<8;i++)favoriteRoom.join({id:String(i),name:'Player',preferredRole:'teal'});
assert.equal(new Set(favoriteRoom.players.map(p=>p.color)).size,8);
assert.throws(()=>favoriteRoom.join({id:'ninth',name:'Ninth',preferredRole:'lime'}),/full/);
console.log('PASS: preferred roles are assigned atomically, taken/invalid favorites fall back, eight roles remain unique');
