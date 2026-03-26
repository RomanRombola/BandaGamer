<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pong</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#0a0a15;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;overflow:hidden;font-family:'Courier New',monospace;}
h1{color:#00aaff;font-size:15px;letter-spacing:3px;margin-bottom:6px;text-shadow:0 0 10px rgba(0,170,255,0.6);}
canvas{border:2px solid rgba(0,170,255,0.3);border-radius:8px;display:block;}
#ctrl{margin-top:8px;font-size:11px;color:#444;letter-spacing:1px;text-align:center;}
</style>
</head>
<body>
<h1>🏓 PONG</h1>
<canvas id="c" width="480" height="320"></canvas>
<div id="ctrl">W/S o ↑↓ para mover · ESPACIO para servir</div>
<script>
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const W=480,H=320,PH=70,PW=10,BALL=8,AI_SPEED=2.8;
let state='wait';
let player={y:H/2-PH/2,score:0,vy:0};
let ai={y:H/2-PH/2,score:0};
let ball={x:W/2,y:H/2,vx:4,vy:2.5};
let keys={};
let particles=[];
const WIN=7;

function resetBall(dir=1){
  ball.x=W/2;ball.y=H/2;
  const ang=(Math.random()-0.5)*0.8;
  ball.vx=dir*(3.8+Math.random()*1.2);
  ball.vy=Math.sin(ang)*4;
}

function spawnParticles(x,y,color){
  for(let i=0;i<10;i++) particles.push({x,y,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,life:1,color});
}

function tick(){
  if(state!=='play') return;
  // Jugador
  if(keys['ArrowUp']||keys['w']||keys['W']) player.y=Math.max(0,player.y-5);
  if(keys['ArrowDown']||keys['s']||keys['S']) player.y=Math.min(H-PH,player.y+5);
  // IA
  const aiCenter=ai.y+PH/2;
  if(aiCenter<ball.y-10) ai.y=Math.min(H-PH,ai.y+AI_SPEED);
  else if(aiCenter>ball.y+10) ai.y=Math.max(0,ai.y-AI_SPEED);
  // Pelota
  ball.x+=ball.vx;ball.y+=ball.vy;
  if(ball.y<=BALL){ball.y=BALL;ball.vy*=-1;}
  if(ball.y>=H-BALL){ball.y=H-BALL;ball.vy*=-1;}
  // Golpe jugador
  if(ball.x<=30+PW&&ball.x>=25&&ball.y>=player.y-BALL&&ball.y<=player.y+PH+BALL){
    ball.x=30+PW+1;
    ball.vx=Math.abs(ball.vx)*1.05;
    ball.vy+=(ball.y-(player.y+PH/2))*0.12;
    ball.vx=Math.min(ball.vx,9);
    spawnParticles(ball.x,ball.y,'#00aaff');
  }
  // Golpe IA
  if(ball.x>=W-30-PW&&ball.x<=W-25&&ball.y>=ai.y-BALL&&ball.y<=ai.y+PH+BALL){
    ball.x=W-30-PW-1;
    ball.vx=-Math.abs(ball.vx)*1.03;
    ball.vy+=(ball.y-(ai.y+PH/2))*0.1;
    ball.vx=Math.max(ball.vx,-9);
    spawnParticles(ball.x,ball.y,'#ff6600');
  }
  // Punto
  if(ball.x<0){ai.score++;spawnParticles(20,ball.y,'#ff3366');checkWin()||resetBall(1);}
  if(ball.x>W){player.score++;spawnParticles(W-20,ball.y,'#39ff14');checkWin()||resetBall(-1);}
  // Partículas
  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.life-=0.06;p.vx*=0.9;p.vy*=0.9;});
  particles=particles.filter(p=>p.life>0);
  draw();requestAnimationFrame(tick);
}

function checkWin(){
  if(player.score>=WIN){state='win';draw();return true;}
  if(ai.score>=WIN){state='lose';draw();return true;}
  return false;
}

function draw(){
  ctx.fillStyle='#07070f';ctx.fillRect(0,0,W,H);
  // Línea central punteada
  ctx.setLineDash([8,8]);ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
  // Partículas
  particles.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x-2,p.y-2,4,4);});
  ctx.globalAlpha=1;
  // Paletas
  const grad=ctx.createLinearGradient(25,0,35,0);
  grad.addColorStop(0,'#0055aa');grad.addColorStop(1,'#00aaff');
  ctx.shadowColor='#00aaff';ctx.shadowBlur=8;
  ctx.fillStyle=grad;ctx.beginPath();ctx.roundRect(25,player.y,PW,PH,4);ctx.fill();
  const grad2=ctx.createLinearGradient(W-35,0,W-25,0);
  grad2.addColorStop(0,'#ff6600');grad2.addColorStop(1,'#aa3300');
  ctx.shadowColor='#ff6600';
  ctx.fillStyle=grad2;ctx.beginPath();ctx.roundRect(W-35,ai.y,PW,PH,4);ctx.fill();
  // Pelota
  ctx.shadowColor='#ffffff';ctx.shadowBlur=12;
  ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(ball.x,ball.y,BALL,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;
  // Marcador
  ctx.fillStyle='rgba(0,170,255,0.8)';ctx.font='bold 36px Courier New';ctx.textAlign='center';
  ctx.fillText(player.score,W/4,44);
  ctx.fillStyle='rgba(255,102,0,0.8)';ctx.fillText(ai.score,3*W/4,44);
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.font='11px Courier New';
  ctx.fillText('TÚ',W/4,58);ctx.fillText('CPU',3*W/4,58);
  // Pantallas
  if(state==='wait'){
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#00aaff';ctx.font='bold 20px Courier New';ctx.textAlign='center';
    ctx.fillText('PONG',W/2,H/2-20);
    ctx.fillStyle='#aaa';ctx.font='13px Courier New';
    ctx.fillText('ESPACIO para servir',W/2,H/2+12);
    ctx.fillStyle='#555';ctx.font='11px Courier New';
    ctx.fillText(`Primero en llegar a ${WIN} gana`,W/2,H/2+32);
  }
  if(state==='win'||state==='lose'){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle=state==='win'?'#39ff14':'#ff3366';
    ctx.font='bold 26px Courier New';ctx.textAlign='center';
    ctx.fillText(state==='win'?'¡GANASTE!':'PERDISTE',W/2,H/2-20);
    ctx.fillStyle='#aaa';ctx.font='13px Courier New';
    ctx.fillText('ESPACIO para reintentar',W/2,H/2+16);
  }
}

function serve(){
  if(state==='wait'||state==='win'||state==='lose'){
    player.score=0;ai.score=0;player.y=H/2-PH/2;ai.y=H/2-PH/2;
    particles=[];state='play';resetBall(1);tick();
  }
}

document.addEventListener('keydown',e=>{
  keys[e.key]=true;
  if(e.key===' '){e.preventDefault();serve();}
  if(['ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup',e=>{keys[e.key]=false;});
window.addEventListener('message',e=>{
  if(!e.data) return;
  if(e.data.type==='keydown'){keys[e.data.key]=true;if(e.data.key===' ')serve();}
  if(e.data.type==='keyup') keys[e.data.key]=false;
});
// Touch
let touchY=null;
cv.addEventListener('touchstart',e=>{touchY=e.touches[0].clientY;serve();},{passive:true});
cv.addEventListener('touchmove',e=>{
  if(touchY===null) return;
  const dy=e.touches[0].clientY-touchY;
  player.y=Math.max(0,Math.min(H-PH,player.y+dy*0.8));
  touchY=e.touches[0].clientY;
},{passive:true});
draw();
</script>
</body>
</html>
