<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Endless Jump</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0a0a15;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;overflow:hidden;font-family:'Courier New',monospace;}
h1{color:#39ff14;font-size:14px;letter-spacing:3px;margin-bottom:5px;}
#hud{display:flex;gap:16px;margin-bottom:5px;font-size:12px;color:#aaa;}
#hud b{color:#39ff14;}
canvas{border:2px solid rgba(57,255,20,0.2);border-radius:6px;}
#ctrl{margin-top:6px;font-size:10px;color:#444;letter-spacing:1px;text-align:center;}
</style>
</head>
<body>
<h1>🦘 ENDLESS JUMP</h1>
<div id="hud"><span>ALTURA <b id="sc">0</b>m</span><span>MEJOR <b id="best">0</b>m</span></div>
<canvas id="c" width="300" height="480"></canvas>
<div id="ctrl">← → para moverse · El personaje salta solo</div>
<script>
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const W=300,H=480,PLAT_W=55,PLAT_H=9,GRAV=0.4,AUTO_JUMP=-12.5;
const THEMES=[
  {sky:'#07070f',ground:'#1a3a1a',platColor:'#39ff14',platGlow:'#39ff14',playerColor:'#ff6600'},
  {sky:'#07070f',ground:'#0d1a3a',platColor:'#00aaff',platGlow:'#00aaff',playerColor:'#ffe600'},
  {sky:'#07070f',ground:'#2a0d2a',platColor:'#a855f7',platGlow:'#a855f7',playerColor:'#ff3366'},
];
let player,platforms,score,best=0,cameraY,state,loop,keys={},particles=[];
let theme=0;

function mkPlats(){
  const ps=[];
  ps.push({x:W/2-PLAT_W/2,y:H-40,type:'normal'});
  for(let i=1;i<22;i++){
    const y=H-40-i*52-Math.random()*20;
    const x=Math.random()*(W-PLAT_W);
    const rnd=Math.random();
    const type=i<3?'normal':rnd<0.12?'spring':rnd<0.25?'moving':'normal';
    ps.push({x,y,type,dir:1,spd:1+Math.random(),ox:x});
  }
  return ps;
}

function init(){
  theme=Math.floor(Math.random()*THEMES.length);
  player={x:W/2-15,y:H-80,vy:AUTO_JUMP*0.6,w:30,h:30};
  platforms=mkPlats();cameraY=0;score=0;state='play';particles=[];
  document.getElementById('sc').textContent=0;
  if(loop)cancelAnimationFrame(loop);
  tick();
}

function spawn(topY){
  const x=Math.random()*(W-PLAT_W);
  const rnd=Math.random();const s=score;
  const type=s<150?'normal':rnd<0.15?'spring':rnd<0.3?'moving':rnd<0.42&&s>400?'vanish':'normal';
  platforms.push({x,y:topY-52-Math.random()*20,type,dir:1,spd:1+Math.random()*1.5,ox:x,life:type==='vanish'?3:-1});
}

function tick(){
  if(state!=='play')return;
  if(keys['ArrowLeft']||keys['a']||keys['A'])player.x-=4.5;
  if(keys['ArrowRight']||keys['d']||keys['D'])player.x+=4.5;
  player.x=(player.x+W)%W;
  player.vy+=GRAV;player.y+=player.vy;
  // Plataformas
  platforms.forEach(p=>{
    if(p.type==='moving'){p.x+=p.dir*p.spd;if(p.x<0||p.x>W-PLAT_W)p.dir*=-1;}
    if(player.vy>0&&player.y+player.h>p.y+cameraY&&player.y+player.h<p.y+cameraY+20&&player.x+player.w>p.x+4&&player.x<p.x+PLAT_W-4){
      if(p.type==='spring'){player.vy=AUTO_JUMP*1.55;for(let i=0;i<8;i++)particles.push({x:player.x+15,y:player.y+player.h,vx:(Math.random()-0.5)*5,vy:-Math.random()*4,life:1,color:THEMES[theme].platColor});}
      else player.vy=AUTO_JUMP;
      if(p.type==='vanish'){p.life--;if(p.life<=0)p.gone=true;}
    }
  });
  platforms=platforms.filter(p=>!p.gone);
  // Cámara
  const screenTop=H*0.4;
  if(player.y<screenTop+cameraY){const delta=screenTop+cameraY-player.y;cameraY-=delta;const sc=Math.floor(-cameraY/6);if(sc>score){score=sc;document.getElementById('sc').textContent=score;if(score>best){best=score;document.getElementById('best').textContent=best;}}if(score>150*(theme+1)){theme=(theme+1)%THEMES.length;}}
  const topPlat=Math.min(...platforms.map(p=>p.y));
  if(topPlat>cameraY-100)spawn(topPlat);
  platforms=platforms.filter(p=>p.y<cameraY+H+60);
  if(player.y-cameraY>H+60){state='dead';draw();return;}
  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=0.06;p.vy+=0.2;});
  particles=particles.filter(p=>p.life>0);
  draw();loop=requestAnimationFrame(tick);
}

const T=()=>THEMES[theme];
function draw(){
  ctx.fillStyle=T().sky;ctx.fillRect(0,0,W,H);
  // Fondo estrellado
  ctx.fillStyle='rgba(255,255,255,0.2)';
  for(let i=0;i<25;i++)ctx.fillRect((i*79)%W,((i*53)+Math.abs(cameraY)*0.1)%H,1,1);
  // Plataformas
  platforms.forEach(p=>{
    const sy=p.y-cameraY;if(sy<-20||sy>H+20)return;
    const alpha=p.life>0&&p.life<=2?p.life/3:1;
    ctx.globalAlpha=alpha;
    ctx.shadowColor=T().platGlow;ctx.shadowBlur=5;
    ctx.fillStyle=p.type==='spring'?'#ff3366':T().platColor;
    ctx.beginPath();ctx.roundRect(p.x,sy,PLAT_W,PLAT_H,4);ctx.fill();
    if(p.type==='spring'){ctx.fillStyle='#ff6666';ctx.beginPath();ctx.moveTo(p.x+PLAT_W/2-4,sy);ctx.lineTo(p.x+PLAT_W/2,sy-10);ctx.lineTo(p.x+PLAT_W/2+4,sy);ctx.fill();}
    ctx.shadowBlur=0;ctx.globalAlpha=1;
  });
  // Partículas
  particles.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4);});ctx.globalAlpha=1;
  // Player
  const py=player.y-cameraY;
  ctx.shadowColor=T().playerColor;ctx.shadowBlur=8;
  ctx.fillStyle=T().playerColor;ctx.beginPath();ctx.roundRect(player.x,py,player.w,player.h,6);ctx.fill();
  // Cara
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(player.x+9,py+11,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(player.x+21,py+11,4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#000';ctx.beginPath();ctx.arc(player.x+10,py+11,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(player.x+22,py+11,2,0,Math.PI*2);ctx.fill();
  // Pelo
  ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(player.x+8,py);ctx.lineTo(player.x+6,py-7);ctx.stroke();ctx.beginPath();ctx.moveTo(player.x+22,py);ctx.lineTo(player.x+24,py-7);ctx.stroke();
  ctx.shadowBlur=0;
  if(state==='dead'){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ff3366';ctx.font='bold 20px Courier New';ctx.textAlign='center';ctx.fillText('CAÍSTE',W/2,H/2-24);
    ctx.fillStyle=T().platColor;ctx.font='14px Courier New';ctx.fillText(`${score}m`,W/2,H/2+2);
    ctx.fillStyle='#aaa';ctx.font='11px Courier New';ctx.fillText('ESPACIO para reintentar',W/2,H/2+26);
  }
}

document.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(['ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  if(e.code==='Space'&&state==='dead')init();
});
document.addEventListener('keyup',e=>keys[e.key]=false);
cv.addEventListener('touchstart',e=>{if(state==='dead')init();},{passive:true});
cv.addEventListener('touchmove',e=>{const r=cv.getBoundingClientRect();const tx=e.touches[0].clientX-r.left;keys['ArrowLeft']=tx<W/2;keys['ArrowRight']=tx>=W/2;},{passive:true});
cv.addEventListener('touchend',()=>{keys['ArrowLeft']=false;keys['ArrowRight']=false;},{passive:true});
window.addEventListener('message',e=>{
  if(!e.data)return;
  if(e.data.type==='keydown'){keys[e.data.key]=true;if(e.data.key===' '&&state==='dead')init();}
  if(e.data.type==='keyup')keys[e.data.key]=false;
});
init();
</script>
</body>
</html>
