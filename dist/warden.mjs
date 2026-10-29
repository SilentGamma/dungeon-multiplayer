import {emitAttackSound} from './audio-events.mjs';
import {enemyFor,scaledEnemyHealth,FLAPPER_TURN_INTERVAL} from './enemies.mjs';
import {damagePlayer,SHIELD_RADIUS,HIT_COOLDOWN} from './combat.mjs';
import {PLAYER_RADIUS,SIZE} from './world.mjs';
import {inArena,tileOf} from './arena.mjs';
export function createWarden(teamSize){const spec=enemyFor('warden');return {id:'warden',type:'warden',room:24,x:3,y:3,vx:spec.speed,vy:spec.speed*.6,hp:scaledEnemyHealth('warden',teamSize),maxHp:scaledEnemyHealth('warden',teamSize),mode:'walking',active:false}}
export function stepWarden(run,dt){
 if(run.kind!=='boss')return;const boss=run.enemies.find(e=>e.type==='warden');
 if(!boss||boss.hp<=0){run.bossDefeated=true;run.projectiles=[];return}
 if(!run.bossActive&&run.players.some(p=>p.hp>0&&inArena(run,p))){run.bossActive=true;boss.nextSpawn=run.time+15;boss.nextBlast=run.time+8;boss.blastStep=0;run.lockedRooms[29]=true}
 if(!run.bossActive)return;
 if(!boss.throwing&&!boss.grabbedBy&&run.time>=(boss.stunUntil||0)){
  if(run.time>=boss.nextSpawn){boss.nextSpawn=run.time+15;const count=run.enemies.filter(e=>e.type==='flapper'&&e.hp>0).length;
   for(let i=0;i<Math.min(4,6-count);i++){const spec=enemyFor('flapper'),a=(run.spawnSerial||0)*2.4+i*Math.PI;const x=Math.max(1.1,Math.min(4.9,boss.x+Math.cos(a)*.2)),y=Math.max(1.1,Math.min(4.9,boss.y+Math.sin(a)*.2));run.enemies.push({id:'warden-flapper-'+(run.spawnSerial=(run.spawnSerial||0)+1),type:'flapper',x,y,room:Math.floor(y)*SIZE+Math.floor(x),vx:Math.cos(a)*spec.speed,vy:Math.sin(a)*spec.speed,hp:scaledEnemyHealth('flapper',run.teamSize),maxHp:scaledEnemyHealth('flapper',run.teamSize),mode:'walking',active:true,nextDirectionAt:run.time+FLAPPER_TURN_INTERVAL,directionStep:i})}
  }
  if(run.time>=boss.nextBlast){boss.nextBlast=run.time+8;emitAttackSound(run,boss,'warden');const offset=(boss.blastStep++%2)*Math.PI/4;
   for(let i=0;i<4;i++){const a=offset+i*Math.PI/2;run.projectiles.push({id:'blast-'+(run.blastSerial=(run.blastSerial||0)+1),x:boss.x+Math.cos(a)*.13,y:boss.y+Math.sin(a)*.13,vx:Math.cos(a)*.55,vy:Math.sin(a)*.55,expires:run.time+10})}
  }
 }
 // Expiration, arena bounds and a fixed cap prevent an ever-growing projectile list.
 run.projectiles=run.projectiles.filter(b=>{
  const ox=b.x,oy=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.expires<=run.time||b.x<1||b.x>5||b.y<1||b.y>5)return false;
  for(const p of run.players){if(p.hp<=0||p.arrived||!inArena(run,p)||run.time<(p.invulnerableUntil||0))continue;
   const r=.035+(p.shielding&&p.shield>0?SHIELD_RADIUS:PLAYER_RADIUS),dx=b.x-ox,dy=b.y-oy,len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((p.x-ox)*dx+(p.y-oy)*dy)/len)):0;
   if(Math.hypot(p.x-(ox+dx*t),p.y-(oy+dy*t))<=r){if(damagePlayer(run,p,7))p.invulnerableUntil=run.time+HIT_COOLDOWN;return false}
  }return true;
 }).slice(-12);
}
