import * as THREE from 'three';
import './style.css';
import { advance, createState, PHASE, questText } from './gameState.js';

const root = document.querySelector('#game');
root.innerHTML = `<div class="intro"><div class="panel"><small>ORIGINAL 3D FANTASY RPG</small><h1>재의 왕관</h1><h2>CHAPTER I · 잊힌 서약</h2><p>전쟁 전야, 국경 마을 로엔펠에는 왕국의 깃발 대신 검은 연기가 올랐다.<br>몰락한 새벽 기사단의 마지막 전령은 땅속에서 깨어나는 병기의 맥박을 듣는다.</p><button id="begin">운명의 문을 연다</button><p><small>WASD 이동 · 우클릭 드래그 카메라 · SPACE 공격 · Q 스킬 · E 상호작용 · R 회복 · 모바일 터치</small></p></div></div>`;

const testMode = new URLSearchParams(location.search).has('testMode');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x73808d);
scene.fog = new THREE.FogExp2(0x65717c, .012);
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 300);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: testMode });
renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
root.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xb9d5e3, 0x30251f, 1.45));
const sun = new THREE.DirectionalLight(0xffd7a3, 2.4); sun.position.set(-28, 45, 25); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=70;sun.shadow.camera.bottom=-70; scene.add(sun);

const M = (color, rough=.8, metal=.05, options={}) => new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,...options});
const mats={ground:M(0x354936),road:M(0x5d584c),stone:M(0x555861),wood:M(0x4b2e20),roof:M(0x47272a),gold:M(0xbe8b3f,.35,.7),red:M(0x77282b),blue:M(0x284966),black:M(0x171922,.45,.5),skin:M(0xc99770),leaf:M(0x263c2c),eye:M(0x15100d,.7,0),mouth:M(0x4b1b1b,.7,0),silver:M(0xb8c6cf,.42,.55)};
const markerMat=(color,opacity=.9)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
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

const factionStyles={
  hero:{skin:0xc99770,hair:0x171722,cape:0x1f3558,ring:0x6bd8ff,crest:0x9ee7ff,marker:0x73d7ff,brow:0x2b1d18,eye:0x11100d,mouth:0x572520},
  ally:{skin:0xc58f6b,hair:0x382319,cape:0x1f4e63,ring:0x76ead2,crest:0xd5bd78,marker:0x78f0dc,brow:0x2b1d18,eye:0x101410,mouth:0x5b2524},
  villager:{skin:0xb98666,hair:0xa8a4a0,cape:0x5b4630,ring:0xf0bf68,crest:0xd6a84d,marker:0xffcd7d,brow:0x5d5147,eye:0x17120e,mouth:0x5a2a22},
  enemy:{skin:0x9f685d,hair:0x170a10,cape:0x2a0d15,ring:0xff3f32,crest:0xff6a3d,marker:0xff3227,brow:0x16080b,eye:0xffd3a4,mouth:0x250508},
  boss:{skin:0x806071,hair:0x0d0614,cape:0x1a0822,ring:0xd12dff,crest:0xff3d6e,marker:0xff2d65,brow:0x0a0610,eye:0xff88f1,mouth:0x21051c}
};
function actorPart(name,geometry,material,pos,rot=[0,0,0],scale=[1,1,1]){
  const p=new THREE.Mesh(geometry,material);
  p.name=name;p.position.set(...pos);p.rotation.set(...rot);p.scale.set(...scale);p.castShadow=true;return p;
}
function humanoid(color=0x355c78, scale=1, faction='hero'){
  const style=factionStyles[faction]||factionStyles.hero;
  const g=new THREE.Group();
  g.userData.faction=faction;g.userData.ringColor=style.ring;g.userData.crestColor=style.crest;
  const body=actorPart('body',new THREE.CylinderGeometry(.58,.82,1.75,8),M(color),[0,1.45,0]);
  const head=actorPart('head',new THREE.SphereGeometry(.48,12,8),M(style.skin),[0,2.72,0]);
  const cape=actorPart('faction-cape',new THREE.BoxGeometry(1.15,1.8,.18),M(style.cape),[0,1.5,.55]);
  const hair=actorPart('face-hair',new THREE.SphereGeometry(.5,12,6,0,Math.PI*2,0,Math.PI*.6),M(style.hair),[0,2.94,-.02]);
  const eyeGeo=new THREE.SphereGeometry(.055,8,6),eyeMat=M(style.eye,.5,0);
  const browGeo=new THREE.BoxGeometry(.18,.035,.04),browMat=M(style.brow,.6,0);
  const mouth=actorPart('face-mouth',new THREE.BoxGeometry(.21,.032,.04),M(style.mouth,.65,0),[0,2.55,.45]);
  const nose=actorPart('face-nose',new THREE.ConeGeometry(.038,.16,5),M(style.skin,.8,0),[0,2.67,.49],[Math.PI/2,0,0]);
  const ring=actorPart('faction-ground-ring',new THREE.RingGeometry(.92,1.08,48),markerMat(style.ring,.72),[0,.045,0],[-Math.PI/2,0,0]);
  const crest=actorPart('faction-chest-crest',new THREE.CircleGeometry(.18,18),markerMat(style.crest,.95),[0,1.86,.78]);
  const marker=actorPart(faction==='enemy'||faction==='boss'?'faction-hostile-diamond':'faction-friendly-halo',faction==='enemy'||faction==='boss'?new THREE.OctahedronGeometry(.18):new THREE.TorusGeometry(.2,.028,8,22),markerMat(style.marker,.92),[0,3.42,0],[Math.PI/2,0,0]);
  g.add(body,head,cape,hair,
    actorPart('face-eye-left',eyeGeo,eyeMat,[-.16,2.78,.43]),
    actorPart('face-eye-right',eyeGeo,eyeMat,[.16,2.78,.43]),
    actorPart('face-brow-left',browGeo,browMat,[-.16,2.91,.43],[0,0,.16]),
    actorPart('face-brow-right',browGeo,browMat,[.16,2.91,.43],[0,0,-.16]),
    mouth,nose,ring,crest,marker);
  if(faction==='enemy'||faction==='boss'){
    g.add(actorPart('faction-left-spike',new THREE.ConeGeometry(.09,.46,6),M(style.crest,.45,.3),[-.47,2.23,.08],[0,0,.35]),
      actorPart('faction-right-spike',new THREE.ConeGeometry(.09,.46,6),M(style.crest,.45,.3),[.47,2.23,.08],[0,0,-.35]));
  }else{
    g.add(actorPart('faction-oath-knot',new THREE.BoxGeometry(.34,.08,.05),markerMat(style.crest,.9),[0,2.08,.8],[0,0,Math.PI/4]));
  }
  g.userData.faceParts=g.children.filter(o=>o.name.startsWith('face-')).length;
  g.userData.factionMarkers=g.children.filter(o=>o.name.startsWith('faction-')).length;
  g.scale.setScalar(scale);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  scene.add(g);return g;
}
const player=humanoid(0x273d62,1,'hero');player.position.set(0,0,23);
const sword=new THREE.Mesh(new THREE.BoxGeometry(.12,1.5,.12),mats.gold);sword.position.set(.72,1.65,0);sword.rotation.z=-.25;player.add(sword);
const elder=humanoid(0x6c5440,.92,'villager');elder.position.set(-3,0,12); elder.userData.name='촌장 오르벤';
const companion=humanoid(0x31546b,.95,'ally');companion.position.set(-7,0,-20);companion.visible=true;companion.userData.name='세라 벨른';
const relic=mesh(new THREE.BoxGeometry(1.8,1.2,1.3),mats.wood,[1,.65,-13]);const lock=mesh(new THREE.BoxGeometry(.5,.5,.12),mats.gold,[1,1,-12.3]);lock.parent=scene;

const state=createState();
const game={hp:100,maxHp:100,xp:0,attack:18,skillReady:0,attackReady:0,dialogue:null,started:false,ended:false,time:0};
const audio={
  ctx:null,master:null,musicTimer:null,nodes:[],started:false,muted:false,events:[],sequenceStep:0,
  supported:typeof window!=='undefined'&&Boolean(window.AudioContext||window.webkitAudioContext)
};
try{audio.muted=localStorage.getItem('ashen-crown-muted')==='1'}catch{}
function audioEvent(name){audio.events.push({name,at:performance.now()});if(audio.events.length>80)audio.events.shift()}
function updateAudioToggle(){const btn=document.querySelector('#audioToggle');if(!btn)return;btn.setAttribute('aria-pressed',String(audio.muted));btn.setAttribute('aria-label',audio.muted?'소리 켜기':'소리 끄기');btn.title=audio.muted?'소리 켜기':'소리 끄기';btn.textContent=audio.muted?'×':'♪'}
function setMuted(muted){audio.muted=muted;try{localStorage.setItem('ashen-crown-muted',muted?'1':'0')}catch{}if(audio.master&&audio.ctx)audio.master.gain.setTargetAtTime(muted?0:.42,audio.ctx.currentTime,.04);updateAudioToggle()}
function playTone(freq,duration,{type='sine',volume=.08,delay=0,attack=.012,release=.12,to=null,filterFreq=null}={}){
  if(!audio.ctx||!audio.master)return;
  const ctx=audio.ctx,now=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(freq,now);if(to)osc.frequency.exponentialRampToValueAtTime(Math.max(1,to),now+duration);
  gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(volume,now+attack);gain.gain.exponentialRampToValueAtTime(.0001,now+duration+release);
  if(filterFreq){const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=filterFreq;osc.connect(gain);gain.connect(filter);filter.connect(audio.master)}
  else{osc.connect(gain);gain.connect(audio.master)}
  osc.start(now);osc.stop(now+duration+release+.04);
}
function playNoise(duration=.1,volume=.05,filterType='bandpass',freq=900){
  if(!audio.ctx||!audio.master)return;
  const ctx=audio.ctx,length=Math.max(1,Math.floor(ctx.sampleRate*duration)),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<length;i++){const fade=1-i/length;data[i]=(Math.random()*2-1)*fade}
  const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  filter.type=filterType;filter.frequency.value=freq;gain.gain.value=volume;src.buffer=buffer;src.connect(filter);filter.connect(gain);gain.connect(audio.master);src.start();
}
function startProceduralMusic(){
  const ctx=audio.ctx,filter=ctx.createBiquadFilter(),droneGain=ctx.createGain();
  filter.type='lowpass';filter.frequency.value=620;filter.Q.value=.7;droneGain.gain.value=.16;filter.connect(droneGain);droneGain.connect(audio.master);
  [65.41,98,130.81].forEach((freq,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=i===0?'sawtooth':'triangle';osc.frequency.value=freq;gain.gain.value=i===0 ? .08 : .045;osc.connect(gain);gain.connect(filter);osc.start();audio.nodes.push(osc,gain)});
  const lfo=ctx.createOscillator(),lfoGain=ctx.createGain();lfo.frequency.value=.045;lfoGain.gain.value=120;lfo.connect(lfoGain);lfoGain.connect(filter.frequency);lfo.start();audio.nodes.push(lfo,lfoGain,filter,droneGain);
  audio.musicTimer=setInterval(()=>{if(!audio.ctx||!game.started||audio.muted)return;const notes=[0,3,5,7,10,7,5,3],note=notes[audio.sequenceStep++%notes.length],freq=196*Math.pow(2,note/12);playTone(freq,.48,{type:'triangle',volume:.04,attack:.04,release:.35,filterFreq:900});if(audio.sequenceStep%4===0)playTone(freq/2,.7,{type:'sine',volume:.035,attack:.05,release:.45,filterFreq:520})},780);
}
function ensureAudio(){
  if(!audio.supported){audioEvent('audio-unavailable');return false}
  if(!audio.ctx){const AudioCtor=window.AudioContext||window.webkitAudioContext;audio.ctx=new AudioCtor();audio.master=audio.ctx.createGain();audio.master.gain.value=audio.muted?0:.42;audio.master.connect(audio.ctx.destination);startProceduralMusic();audio.started=true;audioEvent('bgm-start')}
  if(audio.ctx.state==='suspended')audio.ctx.resume().catch(()=>{});
  setMuted(audio.muted);return true;
}
function playSfx(name){
  audioEvent(name);
  if(!audio.ctx||audio.muted)return;
  if(name==='attack'){playTone(560,.13,{type:'sawtooth',volume:.045,to:210,release:.06,filterFreq:1600});playNoise(.06,.018,'highpass',1800)}
  else if(name==='skill'){playTone(180,.34,{type:'sawtooth',volume:.075,to:620,attack:.025,release:.18,filterFreq:1500});playTone(74,.38,{type:'sine',volume:.07,to:110,attack:.02,release:.22})}
  else if(name==='hit'||name==='skill-hit'){playNoise(name==='skill-hit' ? .13 : .09,name==='skill-hit' ? .06 : .04,'bandpass',name==='skill-hit'?760:980);playTone(140,.11,{type:'square',volume:.035,to:90,release:.05,filterFreq:700})}
  else if(name==='player-hit'||name==='boss-hit'||name==='boss-slam'){playNoise(.16,.075,'lowpass',name==='boss-hit'||name==='boss-slam'?520:720);playTone(name==='boss-hit'||name==='boss-slam'?64:96,.18,{type:'sawtooth',volume:.06,to:48,release:.08,filterFreq:480})}
  else if(name==='heal'){playTone(392,.12,{type:'triangle',volume:.045,release:.1});playTone(523.25,.18,{type:'triangle',volume:.05,delay:.08,release:.16});playTone(659.25,.22,{type:'sine',volume:.04,delay:.18,release:.18})}
  else if(name==='dialogue'){playTone(330,.05,{type:'triangle',volume:.025,release:.05});playTone(440,.05,{type:'triangle',volume:.018,delay:.045,release:.05})}
  else if(name==='item'||name==='quest'){playTone(523.25,.16,{type:'triangle',volume:.045,release:.12});playTone(783.99,.24,{type:'sine',volume:.04,delay:.11,release:.22})}
  else if(name==='boss-reveal'||name==='boss-defeat'){playTone(name==='boss-reveal'?55:110,.55,{type:'sawtooth',volume:.085,to:name==='boss-reveal'?41:220,attack:.035,release:.3,filterFreq:720});playNoise(.22,.045,'lowpass',440)}
}
function toggleAudioMute(){ensureAudio();const next=!audio.muted;setMuted(next);audioEvent(next?'mute':'unmute');if(!next)playTone(523.25,.12,{type:'sine',volume:.04,release:.1})}
const enemies=[];
function makeEnemy(x,z,boss=false){const g=humanoid(boss?0x21122e:0x57252c,boss?1.75:1,boss?'boss':'enemy');g.position.set(x,0,z);if(boss){const horn=new THREE.Mesh(new THREE.ConeGeometry(.3,1,6),mats.gold);horn.name='faction-boss-horn';horn.position.set(0,3.35,0);g.add(horn);g.userData.factionMarkers++}const e={mesh:g,hp:boss?260:55,maxHp:boss?260:55,boss,alive:true,lastHit:0,attackWait:0,home:new THREE.Vector3(x,0,z)};g.visible=!boss;enemies.push(e);return e}
[[-7,2],[7,-6],[-4,-7]].forEach(p=>makeEnemy(...p)); const boss=makeEnemy(0,-58,true);

const vfxTuning=Object.freeze({
  basicSlashOuter:1.48,basicSlashInner:.24,basicCoreOuter:.9,basicSparkCount:4,basicFlashIntensity:14,
  skillSlashOuter:2.45,skillSlashInner:.42,skillCoreOuter:1.5,skillSparkCount:8,skillFlashIntensity:24
});
const fxGroup=new THREE.Group();scene.add(fxGroup);const activeFx=[];
function fxMat(color,opacity=.85){return new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})}
function fadeMaterial(mat,alpha){if(Array.isArray(mat))mat.forEach(m=>fadeMaterial(m,alpha));else if(mat&&'opacity'in mat)mat.opacity=mat.userData.baseOpacity*alpha}
function disposeFx(obj){obj.traverse?.(o=>{if(o.isMesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose()}})}
function trackFx(obj,life,options={}){obj.userData.fx={life,maxLife:life,baseScale:obj.scale.clone(),baseIntensity:obj.intensity||0,...options};obj.traverse?.(o=>{if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.userData.baseOpacity=m.opacity)}});activeFx.push(obj);fxGroup.add(obj);return obj}
function forwardVector(){return new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y)).normalize()}
function orientToForward(obj,forward){obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),forward.clone().normalize())}
function arcMesh(inner,outer,thetaStart,thetaLength,color,opacity){return new THREE.Mesh(new THREE.RingGeometry(inner,outer,72,1,thetaStart,thetaLength),fxMat(color,opacity))}
function spawnSwordSlash(skill,forward){
  const g=new THREE.Group();
  g.position.copy(player.position).addScaledVector(forward,skill?1.8:1.25);g.position.y=skill?1.44:1.58;orientToForward(g,forward);
  const sweep=arcMesh(skill?vfxTuning.skillSlashInner:vfxTuning.basicSlashInner,skill?vfxTuning.skillSlashOuter:vfxTuning.basicSlashOuter,-.68,skill?Math.PI*.96:Math.PI*.8,skill?0x83eaff:0xb8f2ff,skill ? .46 : .42);sweep.rotation.z=skill?-.18:-.36;g.add(sweep);
  const core=arcMesh(skill ? .68 : .42,skill?vfxTuning.skillCoreOuter:vfxTuning.basicCoreOuter,-.5,skill?Math.PI*.72:Math.PI*.58,0xffdea4,skill ? .36 : .34);core.rotation.z=skill ? .02 : -.18;g.add(core);
  const edge=arcMesh(skill?2.1:1.22,skill?2.55:1.5,-.58,skill?Math.PI*.78:Math.PI*.62,0xffffff,skill ? .24 : .2);edge.rotation.z=skill?-.04:-.26;g.add(edge);
  trackFx(g,skill ? .3 : .2,{kind:'slash',grow:skill ? .16 : .06,spinZ:skill?1.05:2.2});
}
function spawnShockwave(){
  const ring=new THREE.Mesh(new THREE.RingGeometry(.44,.62,64,1),fxMat(0x9aefff,.3));
  ring.position.copy(player.position);ring.position.y=.08;ring.rotation.x=-Math.PI/2;trackFx(ring,.32,{kind:'shockwave',grow:2.4});
  const inner=new THREE.Mesh(new THREE.RingGeometry(.13,.2,48,1),fxMat(0xffd07a,.24));
  inner.position.copy(player.position);inner.position.y=.1;inner.rotation.x=-Math.PI/2;trackFx(inner,.26,{kind:'shockwave',grow:3.5});
}
function spawnImpactVfx(position,skill,forward){
  const flash=new THREE.PointLight(skill?0x87f5ff:0xffd28a,skill?vfxTuning.skillFlashIntensity:vfxTuning.basicFlashIntensity,skill?6:4);flash.position.copy(position).add(new THREE.Vector3(0,1.45,0));trackFx(flash,skill ? .24 : .18,{kind:'flash'});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.18,.32,36,1),fxMat(skill?0x8fefff:0xffd28a,.42));
  ring.position.copy(position).add(new THREE.Vector3(0,1.35,0));orientToForward(ring,forward);trackFx(ring,skill ? .22 : .17,{kind:'impact',grow:skill?1.35:1.05});
  const count=skill?vfxTuning.skillSparkCount:vfxTuning.basicSparkCount;
  for(let i=0;i<count;i++){
    const spark=new THREE.Mesh(new THREE.TetrahedronGeometry(skill ? .06 : .045,0),fxMat(i%3===0?0xffffff:skill?0x80ecff:0xffc466,.56));
    spark.position.copy(position).add(new THREE.Vector3((Math.random()-.5)*.3,1.12+Math.random()*.58,(Math.random()-.5)*.3));
    const side=new THREE.Vector3((Math.random()-.5)*2,Math.random()*1.1+.18,(Math.random()-.5)*2).normalize().multiplyScalar(skill?2.45:1.75);
    trackFx(spark,.22+Math.random()*.1,{kind:'spark',velocity:side,spinX:3+Math.random()*4,spinY:2+Math.random()*3});
  }
}
function spawnSwordVfx(skill,hits){
  const forward=forwardVector();spawnSwordSlash(skill,forward);if(skill)spawnShockwave();
  for(const hit of hits)spawnImpactVfx(hit.position,skill,forward);
}
function updateVfx(dt){
  for(let i=activeFx.length-1;i>=0;i--){
    const obj=activeFx[i],fx=obj.userData.fx;fx.life-=dt;const t=1-Math.max(0,fx.life)/fx.maxLife,alpha=Math.max(0,fx.life/fx.maxLife);
    if(fx.velocity)obj.position.addScaledVector(fx.velocity,dt);if(fx.spinX)obj.rotation.x+=fx.spinX*dt;if(fx.spinY)obj.rotation.y+=fx.spinY*dt;if(fx.spinZ)obj.rotation.z+=fx.spinZ*dt;
    if(fx.grow)obj.scale.copy(fx.baseScale).multiplyScalar(1+t*fx.grow);
    if(obj.isLight)obj.intensity=fx.baseIntensity*alpha;else obj.traverse?.(o=>{if(o.material)fadeMaterial(o.material,alpha)});
    if(fx.life<=0){activeFx.splice(i,1);fxGroup.remove(obj);disposeFx(obj)}
  }
}

const hud=document.createElement('div');hud.className='hud';hud.innerHTML=`<div class="topbar"><div class="name">카일 로언 · LV <b id="lv">1</b></div><div class="bar"><i id="hp"></i></div><div class="stats"><span id="hpText"></span> · 공격력 <b id="atk"></b> · 회복약 <b id="pots"></b></div></div><div class="quest"><small>QUEST LOG</small><div id="questText"></div></div><button id="audioToggle" class="audio-toggle" type="button" aria-label="소리 끄기" aria-pressed="false" title="소리 끄기">♪</button><div id="bossHud" class="boss" hidden><b>심연 구동병기 · 모르가드</b><div class="bar"><i id="bossHp"></i></div></div><div class="skills"><div class="skill"><b>SPACE</b><span>서약 베기</span></div><div class="skill"><b>Q</b><span id="skillLabel">성흔 폭발</span></div><div class="skill"><b>R</b><span>회복약</span></div></div><div class="help">WASD 이동 · SHIFT 달리기 · 우클릭 드래그 시점 · 휠 줌 · E 상호작용</div><div id="prompt"></div><div id="layer"></div><div class="mobile-controls" aria-label="터치 조작"><div class="move-pad" data-touch-role="stick" aria-label="이동"><div class="stick-base"><div class="stick-knob"></div></div></div><div class="touch-zoom" aria-label="줌"><button type="button" data-touch-action="zoomIn" aria-label="확대">+</button><button type="button" data-touch-action="zoomOut" aria-label="축소">-</button></div><div class="action-pad" aria-label="행동"><button type="button" data-touch-action="attack" aria-label="공격">검</button><button type="button" data-touch-action="skill" aria-label="성흔 폭발">성</button><button type="button" data-touch-action="interact" aria-label="상호작용">대화</button><button type="button" data-touch-action="heal" aria-label="회복약">회복</button></div></div>`;root.append(hud);
const $=id=>document.querySelector('#'+id); let toastTimer;
function toast(t){clearTimeout(toastTimer);const old=document.querySelector('.toast');if(old)old.remove();const n=document.createElement('div');n.className='toast';n.textContent=t;hud.append(n);toastTimer=setTimeout(()=>n.remove(),3000)}
function renderHud(){ $('hp').style.width=`${Math.max(0,game.hp/game.maxHp*100)}%`;$('hpText').textContent=`HP ${Math.ceil(game.hp)} / ${game.maxHp}`;$('lv').textContent=state.level;$('atk').textContent=game.attack;$('pots').textContent=state.potions;$('questText').textContent=questText(state);$('skillLabel').textContent=game.skillReady>game.time?`성흔 폭발 ${(game.skillReady-game.time).toFixed(1)}s`:'성흔 폭발';$('bossHud').hidden=!(state.phase===PHASE.DEFEAT_BOSS&&boss.alive);$('bossHp').style.width=`${boss.hp/boss.maxHp*100}%`;}
function say(name,lines,onDone){let i=0;const next=()=>{i++;if(i>=lines.length){$('layer').innerHTML='';game.dialogue=null;onDone?.()}else show()};const show=()=>{playSfx('dialogue');$('layer').innerHTML=`<div class="dialogue"><h3>${name}</h3><p>${lines[i]}</p><em>E 또는 클릭하여 계속</em></div>`;document.querySelector('.dialogue')?.addEventListener('click',next)};game.dialogue={next};show()}
function advanceDialogue(){if(game.dialogue?.next){game.dialogue.next();return true}return false}
function phaseEvent(event){const before=state.phase;advance(state,event);if(before!==state.phase){
  playSfx('quest');
  if(state.phase===PHASE.DEFEAT_SCOUTS)toast('새 퀘스트: 잿빛 정찰대');
  if(state.phase===PHASE.CLAIM_RELIC)toast('정찰대 격퇴! 폐허의 봉인함이 반응한다.');
  if(state.phase===PHASE.RECRUIT){playSfx('item');game.maxHp=125;game.hp=125;game.attack=25;state.potions++;relic.visible=false;lock.visible=false;toast('별철 검편 획득 · LV 2 · 공격력/HP 상승');}
  if(state.phase===PHASE.DEFEAT_BOSS){playSfx('boss-reveal');gate.position.y=10;boss.mesh.visible=true;toast('세라가 동료로 합류했다! 검은 관문 개방');}
  if(state.phase===PHASE.COMPLETE){playSfx('boss-defeat');ending();}
}renderHud()}
function ending(){game.ended=true;setTimeout(()=>{const e=document.createElement('div');e.className='ending';e.innerHTML=`<div class="panel"><small>CHAPTER I COMPLETE</small><h1>잊힌 서약</h1><p>고대 병기의 심장은 멎었지만, 그 안에서 발견된 왕실의 인장은 더 큰 배신을 가리키고 있었다.<br>카일과 세라는 몰락 기사단의 진실을 좇아 불타는 수도로 향한다.</p><h2>다음 장 — 유리 왕좌의 그림자</h2><button onclick="location.reload()">처음부터 다시</button></div>`;root.append(e)},900)}

function heal(){if(state.potions>0&&game.hp<game.maxHp){playSfx('heal');state.potions--;game.hp=Math.min(game.maxHp,game.hp+55);toast('회복약 사용 · HP +55');renderHud()}}
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
function attack(skill){if(skill&&game.time<game.skillReady)return;if(!skill&&game.time<game.attackReady)return;game.attackReady=game.time+.42;playSfx(skill?'skill':'attack');if(skill){game.skillReady=game.time+6;toast('성흔 폭발!')}sword.rotation.z=skill?-2:-1.4;setTimeout(()=>sword.rotation.z=-.25,170);const range=skill?5.5:2.8,damage=skill?game.attack*1.7:game.attack,hits=[];for(const e of enemies){if(!e.alive||!e.mesh.visible)continue;if(player.position.distanceTo(e.mesh.position)<range){const hitPosition=e.mesh.position.clone();hits.push({position:hitPosition,boss:e.boss});e.hp-=damage;e.lastHit=game.time;e.mesh.position.add(e.mesh.position.clone().sub(player.position).setY(0).normalize().multiplyScalar(skill?1.6:.7));if(e.hp<=0){e.alive=false;e.mesh.visible=false;if(e.boss){toast('고대 병기의 핵이 붕괴한다');phaseEvent('boss')}else{game.xp+=35;phaseEvent('scout');toast(`정찰병 격퇴 · 경험치 +35 (${state.kills}/3)`)}}}}if(hits.length)playSfx(skill?'skill-hit':'hit');spawnSwordVfx(skill,hits);renderHud()}
function resetAfterFall(){game.hp=game.maxHp;player.position.set(0,0,20);toast('의식을 되찾았다 · 마을로 귀환')}
function updatePlayer(dt){let f=THREE.MathUtils.clamp((keys.KeyW?1:0)-(keys.KeyS?1:0)+mobileMove.forward,-1,1),s=THREE.MathUtils.clamp((keys.KeyD?1:0)-(keys.KeyA?1:0)+mobileMove.side,-1,1);if(f||s){const dir=new THREE.Vector3(s,0,-f).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);const speed=keys.ShiftLeft?9:5.7;player.position.addScaledVector(dir,dt*speed);player.rotation.y=Math.atan2(dir.x,dir.z);player.position.x=THREE.MathUtils.clamp(player.position.x,-31,31);player.position.z=THREE.MathUtils.clamp(player.position.z,-64,32)}if(state.companion){const target=player.position.clone().add(new THREE.Vector3(-2,0,2).applyAxisAngle(new THREE.Vector3(0,1,0),player.rotation.y));const d=target.sub(companion.position);if(d.length()>1.1){companion.position.addScaledVector(d.normalize(),dt*4.2);companion.rotation.y=Math.atan2(d.x,d.z)}}}
function updateEnemies(dt){for(const e of enemies){if(!e.alive||!e.mesh.visible)continue;const d=e.mesh.position.distanceTo(player.position);const active=e.boss?state.phase===PHASE.DEFEAT_BOSS:state.phase===PHASE.DEFEAT_SCOUTS;if(!active)continue;if(d<13&&d>2.1){const v=player.position.clone().sub(e.mesh.position).setY(0).normalize();e.mesh.position.addScaledVector(v,dt*(e.boss?2.25:2.8));e.mesh.rotation.y=Math.atan2(v.x,v.z)}if(d<2.35&&game.time>e.attackWait){e.attackWait=game.time+(e.boss?1.15:1.65);playSfx(e.boss?'boss-slam':'player-hit');game.hp-=e.boss?19:10;toast(e.boss?'모르가드의 파쇄 충격 · HP 감소':'적의 공격 · HP 감소');if(game.hp<=0)resetAfterFall()}if(state.companion&&companion.position.distanceTo(e.mesh.position)<3.4&&game.time>e.lastHit+1.3){e.lastHit=game.time;e.hp-=9;if(e.hp<=0){e.alive=false;e.mesh.visible=false;if(e.boss)phaseEvent('boss');else phaseEvent('scout')}}}}
function updatePrompt(){let t='';if(!game.dialogue){if(state.phase===PHASE.MEET_ELDER&&near(elder,4))t='E · 촌장 오르벤과 대화';else if(state.phase===PHASE.CLAIM_RELIC&&near(relic,4))t='E · 봉인함 조사';else if(state.phase===PHASE.RECRUIT&&near(companion,4))t='E · 세라와 대화'}$('prompt').className=t?'prompt':'';$('prompt').textContent=t}
function updateCamera(){const target=player.position.clone().add(new THREE.Vector3(0,2.1,0));const off=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)).multiplyScalar(distance);camera.position.lerp(target.clone().add(off),.12);camera.lookAt(target)}
const clock=new THREE.Clock();function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.04);game.time+=dt;if(game.started&&!game.dialogue&&!game.ended){updatePlayer(dt);updateEnemies(dt);updatePrompt()}updateVfx(dt);updateCamera();renderHud();renderer.render(scene,camera)}loop();
setupMobileControls();
document.querySelector('#audioToggle')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleAudioMute()});
updateAudioToggle();
if(testMode)window.__ashenCrownDebug={
  getPlayerPosition:()=>({x:player.position.x,y:player.position.y,z:player.position.z}),
  setPlayerPosition:(x,z)=>player.position.set(x,0,z),
  getCameraState:()=>({yaw,pitch,distance}),
  getGameState:()=>({hp:game.hp,potions:state.potions,phase:state.phase,kills:state.kills}),
  damagePlayer:n=>{game.hp=Math.max(1,game.hp-n);renderHud()},
  advancePhase:event=>phaseEvent(event),
  getEnemyHealths:()=>enemies.map(e=>({hp:e.hp,alive:e.alive,visible:e.mesh.visible,boss:e.boss})),
  getVfxStats:()=>activeFx.reduce((stats,obj)=>{stats.active++;stats[obj.userData.fx.kind]=(stats[obj.userData.fx.kind]||0)+1;return stats},{active:0}),
  getVfxTuning:()=>({...vfxTuning}),
  getVisualAudit:()=>{
    const actors=[{label:'player',mesh:player},{label:'elder',mesh:elder},{label:'companion',mesh:companion},...enemies.map((e,i)=>({label:e.boss?'boss':`enemy-${i+1}`,mesh:e.mesh}))];
    return {actors:actors.map(({label,mesh})=>({label,faction:mesh.userData.faction,faceParts:mesh.userData.faceParts,factionMarkers:mesh.userData.factionMarkers,ringColor:mesh.userData.ringColor,crestColor:mesh.userData.crestColor,visible:mesh.visible}))};
  },
  getAudioState:()=>{
    const counts=audio.events.reduce((acc,event)=>{acc[event.name]=(acc[event.name]||0)+1;return acc},{});
    return {supported:audio.supported,started:audio.started,muted:audio.muted,contextState:audio.ctx?.state||'none',eventCounts:counts,nodeCount:audio.nodes.length};
  }
};
document.querySelector('#begin').onclick=()=>{ensureAudio();document.querySelector('.intro').remove();game.started=true;say('카일 로언',['국경의 바람에서 피 냄새가 난다. 오르벤 촌장에게 상황을 들어야 한다.']);};
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
renderHud();
