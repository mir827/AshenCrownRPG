import * as THREE from 'three';
import './style.css';
import { advance, createState, PHASE, questText } from './gameState.js';

const root = document.querySelector('#game');
root.innerHTML = `<div class="intro"><div class="panel"><small>ORIGINAL 3D FANTASY RPG</small><h1>재의 왕관</h1><h2>CHAPTER I · 잊힌 서약</h2><p>전쟁 전야, 국경 마을 로엔펠에는 왕국의 깃발 대신 검은 연기가 올랐다.<br>몰락한 새벽 기사단의 마지막 전령은 땅속에서 깨어나는 병기의 맥박을 듣는다.</p><button id="begin">운명의 문을 연다</button><p><small>WASD 이동 · 우클릭 드래그 카메라 · SPACE 공격 · Q 스킬 · E 상호작용 · R 회복 · 모바일 터치</small></p></div></div>`;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x73808d);
scene.fog = new THREE.FogExp2(0x65717c, .012);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 300);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
root.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xb9d5e3, 0x30251f, 1.45));
const sun = new THREE.DirectionalLight(0xffd7a3, 2.4); sun.position.set(-28, 45, 25); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70; scene.add(sun);

const M = (color, rough=.8, metal=.05) => new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const mats={ground:M(0x354936),road:M(0x5d584c),stone:M(0x555861),wood:M(0x4b2e20),roof:M(0x47272a),gold:M(0xbe8b3f,.35,.7),red:M(0x77282b),blue:M(0x284966),black:M(0x171922,.45,.5),skin:M(0xc99770),leaf:M(0x263c2c)};
function mesh(g,m,pos,cast=true){const o=new THREE.Mesh(g,m);o.position.set(...pos);o.castShadow=cast;o.receiveShadow=true;scene.add(o);return o}
mesh(new THREE.PlaneGeometry(130,150),mats.ground,[0,0,0],false).rotation.x=-Math.PI/2;
mesh(new THREE.PlaneGeometry(9,130),mats.road,[0,.015,-5],false).rotation.x=-Math.PI/2;

function house(x,z,s=1){mesh(new THREE.BoxGeometry(7*s,4*s,6*s),mats.stone,[x,2*s,z]); const r=mesh(new THREE.ConeGeometry(5.2*s,3*s,4),mats.roof,[x,5.5*s,z]);r.rotation.y=Math.PI/4;mesh(new THREE.BoxGeometry(1.3*s,2.2*s,.25),mats.wood,[x,1.1*s,z+3.05*s]);}
[[-11,13,1], [11,14,.9],[-13,0,.8],[13,-2,1],[-12,-19,.9],[13,-22,.8]].forEach(v=>house(...v));
function tree(x,z,s=1){mesh(new THREE.CylinderGeometry(.35*s,.55*s,3*s,7),mats.wood,[x,1.5*s,z]);mesh(new THREE.ConeGeometry(2.2*s,5*s,8),mats.leaf,[x,5*s,z]);}
for(let i=0;i<30;i++){const side=i%2?-1:1;tree(side*(18+(i*7)%28),29-i*4, .7+(i%3)*.13)}
// ruined fortress, gate and ancient engine arena
for(const x of [-15,15]){mesh(new THREE.BoxGeometry(9,15,9),mats.stone,[x,7.5,-48]); for(let y=0;y<4;y++) mesh(new THREE.BoxGeometry(2,1.2,2),mats.stone,[x-3+y*2,15.5,-48]);}
mesh(new THREE.BoxGeometry(22,7,4),mats.stone,[0,11,-50]);
const gate=mesh(new THREE.BoxGeometry(9,9,1.2),mats.black,[0,4.5,-48]);
for(let i=0;i<5;i++)mesh(new THREE.BoxGeometry(.35,7,.45),mats.gold,[-3.2+i*1.6,4.5,-47.3]);
for(const p of [[-9,-35],[9,-36],[-20,-30],[21,-29]]){const f=mesh(new THREE.CylinderGeometry(.25,.35,4,6),mats.wood,[p[0],2,p[1]]);const flame=mesh(new THREE.SphereGeometry(.7,8,8),M(0xff7426,1),[p[0],4.4,p[1]]);const l=new THREE.PointLight(0xff6c25,20,12);l.position.copy(flame.position);scene.add(l)}

function humanoid(color=0x355c78, scale=1){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.58,.82,1.75,8),M(color));body.position.y=1.45;const head=new THREE.Mesh(new THREE.SphereGeometry(.48,12,8),mats.skin);head.position.y=2.72;const cape=new THREE.Mesh(new THREE.BoxGeometry(1.15,1.8,.18),M(0x5e1f25));cape.position.set(0,1.5,.55);g.add(body,head,cape);g.scale.setScalar(scale);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);return g}
const player=humanoid(0x273d62);player.position.set(0,0,23);
const sword=new THREE.Mesh(new THREE.BoxGeometry(.12,1.5,.12),mats.gold);sword.position.set(.72,1.65,0);sword.rotation.z=-.25;player.add(sword);
const elder=humanoid(0x6c5440,.92);elder.position.set(-3,0,12); elder.userData.name='촌장 오르벤';
const companion=humanoid(0x31546b,.95);companion.position.set(-7,0,-20);companion.visible=true;companion.userData.name='세라 벨른';
const relic=mesh(new THREE.BoxGeometry(1.8,1.2,1.3),mats.wood,[1,.65,-13]);const lock=mesh(new THREE.BoxGeometry(.5,.5,.12),mats.gold,[1,1,-12.3]);lock.parent=scene;

const state=createState();
const game={hp:100,maxHp:100,xp:0,attack:18,skillReady:0,attackReady:0,dialogue:null,started:false,ended:false,time:0};
const enemies=[];
function makeEnemy(x,z,boss=false){const g=humanoid(boss?0x21122e:0x57252c,boss?1.75:1);g.position.set(x,0,z);if(boss){const horn=new THREE.Mesh(new THREE.ConeGeometry(.3,1,6),mats.gold);horn.position.set(0,3.35,0);g.add(horn)}const e={mesh:g,hp:boss?260:55,maxHp:boss?260:55,boss,alive:true,lastHit:0,attackWait:0,home:new THREE.Vector3(x,0,z)};g.visible=!boss;enemies.push(e);return e}
[[-7,2],[7,-6],[-4,-7]].forEach(p=>makeEnemy(...p)); const boss=makeEnemy(0,-58,true);

const hud=document.createElement('div');hud.className='hud';hud.innerHTML=`<div class="topbar"><div class="name">카일 로언 · LV <b id="lv">1</b></div><div class="bar"><i id="hp"></i></div><div class="stats"><span id="hpText"></span> · 공격력 <b id="atk"></b> · 회복약 <b id="pots"></b></div></div><div class="quest"><small>QUEST LOG</small><div id="questText"></div></div><div id="bossHud" class="boss" hidden><b>심연 구동병기 · 모르가드</b><div class="bar"><i id="bossHp"></i></div></div><div class="skills"><div class="skill"><b>SPACE</b><span>서약 베기</span></div><div class="skill"><b>Q</b><span id="skillLabel">성흔 폭발</span></div><div class="skill"><b>R</b><span>회복약</span></div></div><div class="help">WASD 이동 · SHIFT 달리기 · 우클릭 드래그 시점 · 휠 줌 · E 상호작용</div><div id="prompt"></div><div id="layer"></div><div class="mobile-controls" aria-label="터치 조작"><div class="move-pad" data-touch-role="stick" aria-label="이동"><div class="stick-base"><div class="stick-knob"></div></div></div><div class="touch-zoom" aria-label="줌"><button type="button" data-touch-action="zoomIn" aria-label="확대">+</button><button type="button" data-touch-action="zoomOut" aria-label="축소">-</button></div><div class="action-pad" aria-label="행동"><button type="button" data-touch-action="attack" aria-label="공격">검</button><button type="button" data-touch-action="skill" aria-label="성흔 폭발">성</button><button type="button" data-touch-action="interact" aria-label="상호작용">대화</button><button type="button" data-touch-action="heal" aria-label="회복약">회복</button></div></div>`;root.append(hud);
const $=id=>document.querySelector('#'+id); let toastTimer;
function toast(t){clearTimeout(toastTimer);const old=document.querySelector('.toast');if(old)old.remove();const n=document.createElement('div');n.className='toast';n.textContent=t;hud.append(n);toastTimer=setTimeout(()=>n.remove(),3000)}
function renderHud(){ $('hp').style.width=`${Math.max(0,game.hp/game.maxHp*100)}%`;$('hpText').textContent=`HP ${Math.ceil(game.hp)} / ${game.maxHp}`;$('lv').textContent=state.level;$('atk').textContent=game.attack;$('pots').textContent=state.potions;$('questText').textContent=questText(state);$('skillLabel').textContent=game.skillReady>game.time?`성흔 폭발 ${(game.skillReady-game.time).toFixed(1)}s`:'성흔 폭발';$('bossHud').hidden=!(state.phase===PHASE.DEFEAT_BOSS&&boss.alive);$('bossHp').style.width=`${boss.hp/boss.maxHp*100}%`;}
function say(name,lines,onDone){let i=0;const next=()=>{i++;if(i>=lines.length){$('layer').innerHTML='';game.dialogue=null;onDone?.()}else show()};const show=()=>{$('layer').innerHTML=`<div class="dialogue"><h3>${name}</h3><p>${lines[i]}</p><em>E 또는 클릭하여 계속</em></div>`;document.querySelector('.dialogue')?.addEventListener('click',next)};game.dialogue={next};show()}
function advanceDialogue(){if(game.dialogue?.next){game.dialogue.next();return true}return false}
function phaseEvent(event){const before=state.phase;advance(state,event);if(before!==state.phase){
  if(state.phase===PHASE.DEFEAT_SCOUTS)toast('새 퀘스트: 잿빛 정찰대');
  if(state.phase===PHASE.CLAIM_RELIC)toast('정찰대 격퇴! 폐허의 봉인함이 반응한다.');
  if(state.phase===PHASE.RECRUIT){game.maxHp=125;game.hp=125;game.attack=25;state.potions++;relic.visible=false;lock.visible=false;toast('별철 검편 획득 · LV 2 · 공격력/HP 상승');}
  if(state.phase===PHASE.DEFEAT_BOSS){gate.position.y=10;boss.mesh.visible=true;toast('세라가 동료로 합류했다! 검은 관문 개방');}
  if(state.phase===PHASE.COMPLETE)ending();
}renderHud()}
function ending(){game.ended=true;setTimeout(()=>{const e=document.createElement('div');e.className='ending';e.innerHTML=`<div class="panel"><small>CHAPTER I COMPLETE</small><h1>잊힌 서약</h1><p>고대 병기의 심장은 멎었지만, 그 안에서 발견된 왕실의 인장은 더 큰 배신을 가리키고 있었다.<br>카일과 세라는 몰락 기사단의 진실을 좇아 불타는 수도로 향한다.</p><h2>다음 장 — 유리 왕좌의 그림자</h2><button onclick="location.reload()">처음부터 다시</button></div>`;root.append(e)},900)}

function heal(){if(state.potions>0&&game.hp<game.maxHp){state.potions--;game.hp=Math.min(game.maxHp,game.hp+55);toast('회복약 사용 · HP +55');renderHud()}}
const keys={},mobileMove={forward:0,side:0};addEventListener('keydown',e=>{keys[e.code]=true;if(!game.started||game.ended)return;if(game.dialogue){if(e.code==='KeyE'||e.code==='Space')advanceDialogue();return}if(e.code==='KeyE')interact();if(e.code==='Space')attack(false);if(e.code==='KeyQ')attack(true);if(e.code==='KeyR')heal()});addEventListener('keyup',e=>keys[e.code]=false);
let yaw=0,pitch=.42,distance=10,drag=false,lx=0,ly=0,cameraPointerId=null,pinchLast=null;const canvasPointers=new Map();renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
function capture(el,e){try{el.setPointerCapture(e.pointerId)}catch{}}
function release(el,e){try{el.releasePointerCapture(e.pointerId)}catch{}}
function pinchDistance(){const p=[...canvasPointers.values()];return p.length<2?null:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)}
renderer.domElement.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==2)return;e.preventDefault();canvasPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});capture(renderer.domElement,e);if(e.pointerType==='mouse'||canvasPointers.size===1){drag=true;cameraPointerId=e.pointerId;lx=e.clientX;ly=e.clientY}else{drag=false;pinchLast=pinchDistance()}},{passive:false});
renderer.domElement.addEventListener('pointermove',e=>{if(!canvasPointers.has(e.pointerId)&&cameraPointerId!==e.pointerId)return;const point={x:e.clientX,y:e.clientY};if(canvasPointers.has(e.pointerId))canvasPointers.set(e.pointerId,point);if(e.pointerType!=='mouse'&&canvasPointers.size>=2){const d=pinchDistance();if(d&&pinchLast)distance=THREE.MathUtils.clamp(distance+(pinchLast-d)*.025,6,16);pinchLast=d;return}if(drag&&cameraPointerId===e.pointerId){yaw-=(e.clientX-lx)*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-ly)*.004,.15,.9);lx=e.clientX;ly=e.clientY}});
function endCanvasPointer(e){if(!canvasPointers.has(e.pointerId)&&cameraPointerId!==e.pointerId)return;canvasPointers.delete(e.pointerId);release(renderer.domElement,e);if(cameraPointerId===e.pointerId){drag=false;cameraPointerId=null}if(canvasPointers.size===1&&e.pointerType!=='mouse'){const [id,point]=canvasPointers.entries().next().value;cameraPointerId=id;drag=true;lx=point.x;ly=point.y}if(canvasPointers.size<2)pinchLast=null}
addEventListener('pointerup',endCanvasPointer);addEventListener('pointercancel',endCanvasPointer);renderer.domElement.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.01,6,16)},{passive:false});
function setupMobileControls(){const pad=document.querySelector('[data-touch-role="stick"]'),knob=document.querySelector('.stick-knob');let stickId=null;const reset=()=>{stickId=null;mobileMove.forward=0;mobileMove.side=0;knob.style.transform='translate3d(-50%,-50%,0)'};const update=e=>{const b=pad.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2,r=Math.min(b.width,b.height)*.36,dx=THREE.MathUtils.clamp(e.clientX-cx,-r,r),dy=THREE.MathUtils.clamp(e.clientY-cy,-r,r),len=Math.hypot(dx,dy),scale=len>r?r/len:1,nx=dx*scale,ny=dy*scale;knob.style.transform=`translate3d(calc(-50% + ${nx}px),calc(-50% + ${ny}px),0)`;mobileMove.side=Math.abs(nx/r)>.12?nx/r:0;mobileMove.forward=Math.abs(ny/r)>.12?-ny/r:0};pad.addEventListener('pointerdown',e=>{e.preventDefault();stickId=e.pointerId;capture(pad,e);update(e)},{passive:false});pad.addEventListener('pointermove',e=>{if(e.pointerId===stickId){e.preventDefault();update(e)}},{passive:false});['pointerup','pointercancel','lostpointercapture'].forEach(type=>pad.addEventListener(type,e=>{if(e.pointerId===stickId)reset()}));document.querySelectorAll('[data-touch-action]').forEach(btn=>btn.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const a=btn.dataset.touchAction;if(a==='zoomIn')distance=THREE.MathUtils.clamp(distance-1.2,6,16);else if(a==='zoomOut')distance=THREE.MathUtils.clamp(distance+1.2,6,16);else if(!game.started||game.ended)return;else if(game.dialogue){if(a==='interact'||a==='attack')advanceDialogue()}else if(a==='attack')attack(false);else if(a==='skill')attack(true);else if(a==='interact')interact();else if(a==='heal')heal()},{passive:false}))}
function near(obj,r=3.5){return player.position.distanceTo(obj.position)<r}
function interact(){if(state.phase===PHASE.MEET_ELDER&&near(elder,4))say('촌장 오르벤',['왕국군이 철수한 뒤, 검은 갑옷의 병사들이 관문을 점령했네. 그들의 지휘관은 죽은 기사단의 문장을 달고 있었지.','숲길의 정찰대를 막아 주게. 폐허 아래 잠든 별철 병기가 깨어나면 이 마을만의 일이 아니야.'],()=>phaseEvent('elder'));
 else if(state.phase===PHASE.CLAIM_RELIC&&near(relic,4))say('봉인된 기억',['상자 안의 검편이 카일의 손에서 푸른 빛을 토한다. 「새벽의 서약은 왕좌가 아니라 백성을 향한다.」','멀리서 한 여인의 목소리가 들린다. “그 문장을 읽을 수 있다면… 당신도 기사단의 피를 이었군요.”'],()=>phaseEvent('relic'));
 else if(state.phase===PHASE.RECRUIT&&near(companion,4))say('세라 벨른',['나는 새벽 기사단의 마지막 종기사, 세라 벨른. 우리 기사단을 배신자로 만든 자가 저 관문 너머의 병기를 움직이고 있어요.','혼자서는 막을 수 없어요. 당신의 검편과 내 방패를 합치죠. 이번만큼은 같은 운명을 믿어 보겠습니다.'],()=>phaseEvent('companion'));
}
function attack(skill){if(skill&&game.time<game.skillReady)return;if(!skill&&game.time<game.attackReady)return;game.attackReady=game.time+.42;if(skill){game.skillReady=game.time+6;toast('성흔 폭발!')}sword.rotation.z=skill?-2:-1.4;setTimeout(()=>sword.rotation.z=-.25,170);const range=skill?5.5:2.8,damage=skill?game.attack*1.7:game.attack;for(const e of enemies){if(!e.alive||!e.mesh.visible)continue;if(player.position.distanceTo(e.mesh.position)<range){e.hp-=damage;e.lastHit=game.time;e.mesh.position.add(e.mesh.position.clone().sub(player.position).setY(0).normalize().multiplyScalar(skill?1.6:.7));if(e.hp<=0){e.alive=false;e.mesh.visible=false;if(e.boss){toast('고대 병기의 핵이 붕괴한다');phaseEvent('boss')}else{game.xp+=35;phaseEvent('scout');toast(`정찰병 격퇴 · 경험치 +35 (${state.kills}/3)`)}}}}renderHud()}
function resetAfterFall(){game.hp=game.maxHp;player.position.set(0,0,20);toast('의식을 되찾았다 · 마을로 귀환')}
function updatePlayer(dt){let f=THREE.MathUtils.clamp((keys.KeyW?1:0)-(keys.KeyS?1:0)+mobileMove.forward,-1,1),s=THREE.MathUtils.clamp((keys.KeyD?1:0)-(keys.KeyA?1:0)+mobileMove.side,-1,1);if(f||s){const dir=new THREE.Vector3(s,0,-f).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const speed=keys.ShiftLeft?9:5.7;player.position.addScaledVector(dir,dt*speed);player.rotation.y=Math.atan2(dir.x,dir.z);player.position.x=THREE.MathUtils.clamp(player.position.x,-31,31);player.position.z=THREE.MathUtils.clamp(player.position.z,-64,32)}if(state.companion){const target=player.position.clone().add(new THREE.Vector3(-2,0,2).applyAxisAngle(new THREE.Vector3(0,1,0),player.rotation.y));const d=target.sub(companion.position);if(d.length()>1.1){companion.position.addScaledVector(d.normalize(),dt*4.2);companion.rotation.y=Math.atan2(d.x,d.z)}}}
function updateEnemies(dt){for(const e of enemies){if(!e.alive||!e.mesh.visible)continue;const d=e.mesh.position.distanceTo(player.position);const active=e.boss?state.phase===PHASE.DEFEAT_BOSS:state.phase===PHASE.DEFEAT_SCOUTS;if(!active)continue;if(d<13&&d>2.1){const v=player.position.clone().sub(e.mesh.position).setY(0).normalize();e.mesh.position.addScaledVector(v,dt*(e.boss?2.25:2.8));e.mesh.rotation.y=Math.atan2(v.x,v.z)}if(d<2.35&&game.time>e.attackWait){e.attackWait=game.time+(e.boss?1.15:1.65);game.hp-=e.boss?19:10;toast(e.boss?'모르가드의 파쇄 충격 · HP 감소':'적의 공격 · HP 감소');if(game.hp<=0)resetAfterFall()}if(state.companion&&companion.position.distanceTo(e.mesh.position)<3.4&&game.time>e.lastHit+1.3){e.lastHit=game.time;e.hp-=9;if(e.hp<=0){e.alive=false;e.mesh.visible=false;if(e.boss)phaseEvent('boss');else phaseEvent('scout')}}}}
function updatePrompt(){let t='';if(!game.dialogue){if(state.phase===PHASE.MEET_ELDER&&near(elder,4))t='E · 촌장 오르벤과 대화';else if(state.phase===PHASE.CLAIM_RELIC&&near(relic,4))t='E · 봉인함 조사';else if(state.phase===PHASE.RECRUIT&&near(companion,4))t='E · 세라와 대화'}$('prompt').className=t?'prompt':'';$('prompt').textContent=t}
function updateCamera(){const target=player.position.clone().add(new THREE.Vector3(0,2.1,0));const off=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(distance);camera.position.lerp(target.clone().add(off),.12);camera.lookAt(target)}
const clock=new THREE.Clock();function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);game.time+=dt;if(game.started&&!game.dialogue&&!game.ended){updatePlayer(dt);updateEnemies(dt);updatePrompt()}updateCamera();renderHud();renderer.render(scene,camera)}loop();
setupMobileControls();
if(new URLSearchParams(location.search).has('testMode'))window.__ashenCrownDebug={getPlayerPosition:()=>({x:player.position.x,y:player.position.y,z:player.position.z}),setPlayerPosition:(x,z)=>player.position.set(x,0,z),getCameraState:()=>({yaw,pitch,distance}),getGameState:()=>({hp:game.hp,potions:state.potions,phase:state.phase,kills:state.kills}),damagePlayer:n=>{game.hp=Math.max(1,game.hp-n);renderHud()},advancePhase:event=>phaseEvent(event),getEnemyHealths:()=>enemies.map(e=>({hp:e.hp,alive:e.alive,visible:e.mesh.visible,boss:e.boss}))};
document.querySelector('#begin').onclick=()=>{document.querySelector('.intro').remove();game.started=true;say('카일 로언',['국경의 바람에서 피 냄새가 난다. 오르벤 촌장에게 상황을 들어야 한다.']);};
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
renderHud();
