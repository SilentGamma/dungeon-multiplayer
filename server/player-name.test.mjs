import assert from 'node:assert/strict';
import {requirePlayerName,playerNameError} from './public/player-name.mjs';
import {Session} from './session.mjs';
for(const name of ['Alice','Player123456','José','Anne-Marie',"O'Neil",'小明','Assassin','Cassidy','Dickens','Hancock','Scunthorpe','Therapist','Canal','Gay','Queer','Lesbian','Analysis'])assert.equal(playerNameError(name),'',name);
for(const name of ['ThirteenChars','fuck','f.u.c.k','f u c k','fuuuck','FUCK123','sh1t','shít','s.h.i.t','b1tch','n1gg3r','nazi','rapist','porn','ｆｕｃｋ','fu\u200bck','fu\u202eck','fυск','<script>','a@b','abc/def','\nAlice'])assert(playerNameError(name),JSON.stringify(name));
assert.equal(requirePlayerName('  Anne  Marie  '),'Anne Marie');assert.equal(requirePlayerName('ABCDEFGHIJKL').length,12);assert(playerNameError('ABCDEFGHIJKLM'));
const s=new Session({code:'n'});assert.throws(()=>s.join({id:'bad',name:'sh1t'}),/different player name/);assert.equal(s.players.length,0);s.join({id:'good',name:'Friendly'});assert.equal(s.players[0].name,'Friendly');
console.log('PASS: server-enforced 12-character normalized names, profanity/slur matching, spacing/leet/accent/confusable evasion, hidden-character rejection and benign-name/identity exceptions');
