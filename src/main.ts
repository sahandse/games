// Extracted from index.html and bundled as TypeScript.
(function(){
'use strict';
const games=[
{id:'snake',name:'مار کلاسیک',icon:'🐍',desc:'بخور، بزرگ شو و به خودت برخورد نکن.',category:'classic',tags:['کیبورد','دسته','لمسی'],devices:['console','pc','mobile']},
{id:'2048',name:'2048',icon:'🔢',desc:'کاشی‌ها را ترکیب کن و به عدد ۲۰۴۸ برس.',category:'puzzle',tags:['فکری','دسته','لمسی'],devices:['console','pc','mobile']},
{id:'ttt',name:'دوز دو نفره',icon:'⭕',desc:'با دوستت روی یک دستگاه بازی کن.',category:'board',tags:['دو نفره','دسته','لمسی'],devices:['console','pc','mobile']},
{id:'memory',name:'حافظه تصویری',icon:'🧠',desc:'جفت‌های مشابه را پیدا کن و حافظه‌ات را بسنج.',category:'puzzle',tags:['فکری','کیبورد','لمسی'],devices:['console','pc','mobile']}
];
const $: (s: string) => any = (s: string) => document.querySelector(s), $: (s: string) => any[] = (s: string): any[] => Array.from(document.querySelectorAll(s));
let category='all',device='all',consoleMode=false,currentGame=null,gameCleanup=null,focusIndex=0,padConnected=false,lastPadButtons=[],lastPadDir=null,gameState=null,loopId=null;
const app=$('#app'),modal=$('#modal'),area=$('#gameArea'),toast=$('#toast');
const faNum=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[+d]);
function render(){
 const q=$('#search').value.trim().toLowerCase();
 const list=games.filter(g=>(category==='all'||g.category===category)&&(device==='all'||(device==='console'?g.devices.includes('console'):g.devices.includes('mobile')||g.devices.includes('pc')))&&(!q||(g.name+' '+g.desc+' '+g.tags.join(' ')).toLowerCase().includes(q)));
 $('#games').innerHTML=list.map(g=>'<button class="game-card" data-game="'+g.id+'" tabindex="0" aria-label="اجرای '+g.name+'"><div class="art" aria-hidden="true">'+g.icon+'</div><div class="info"><h3>'+g.name+'</h3><p>'+g.desc+'</p><div class="tags">'+g.tags.map(t=>'<span class="tag">'+t+'</span>').join('')+'</div></div></button>').join('');
 $('#count').textContent=faNum(list.length)+' بازی';
 $('#empty').style.display=list.length?'none':'block';
 $$('.game-card').forEach((b,i)=>b.addEventListener('click',()=>openGame(b.dataset.game)));
 focusIndex=Math.min(focusIndex,Math.max(0,list.length-1));
 if(consoleMode){const cards=$$('.game-card');if(cards.length)cards[focusIndex].focus({preventScroll:true});}
}
function setDevice(d){device=d;$$('.device').forEach(b=>{b.classList.toggle('selected',b.dataset.device===d);b.setAttribute('aria-pressed',String(b.dataset.device===d));});render();}
$$('.device').forEach(b=>b.addEventListener('click',()=>setDevice(b.dataset.device)));
$$('#filters .filter').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;$$('#filters .filter').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();}));
$('#search').addEventListener('input',render);
$('#modeBtn').addEventListener('click',()=>{consoleMode=!consoleMode;document.body.classList.toggle('console-mode',consoleMode);$('#modeBtn').classList.toggle('active',consoleMode);$('#modeBtn').setAttribute('aria-pressed',String(consoleMode));$('#modeBtn').textContent=consoleMode?'✓ حالت کنسول روشن':'🎮 حالت کنسول';$('#consoleHint').style.display=consoleMode?'block':'none';if(consoleMode){setDevice(device);const cards=$$('.game-card');if(cards[0])cards[0].focus();}else $('#modeBtn').focus();});
$('#randomBtn').addEventListener('click',()=>{const cards=$$('.game-card');if(cards.length)openGame(cards[Math.floor(Math.random()*cards.length)].dataset.game);});
$('#closeBtn').addEventListener('click',closeGame);$('#backBtn').addEventListener('click',closeGame);$('#restartBtn').addEventListener('click',()=>currentGame&&startGame(currentGame));
function say(s){toast.textContent=s||'';}
function openGame(id){currentGame=id;const g=games.find(x=>x.id===id);if(!g)return;$('#gameTitle').textContent=g.icon+' '+g.name;modal.classList.add('open');document.body.style.overflow='hidden';startGame(id);$('#closeBtn').focus();}
function closeGame(){modal.classList.remove('open');document.body.style.overflow='';if(gameCleanup){gameCleanup();gameCleanup=null;}currentGame=null;area.innerHTML='';say('');if(consoleMode){const c=$$('.game-card');if(c[focusIndex])c[focusIndex].focus();else $('#modeBtn').focus();}else $('#modeBtn').focus();}
function startGame(id){if(gameCleanup){gameCleanup();gameCleanup=null;}if(loopId){clearInterval(loopId);loopId=null;}area.innerHTML='';say('');if(id==='snake')startSnake();if(id==='2048')start2048();if(id==='ttt')startTtt();if(id==='memory')startMemory();}
function startSnake(){
 const canvas=document.createElement('canvas');canvas.width=420;canvas.height=420;canvas.style.width='min(100%,420px)';canvas.setAttribute('aria-label','بازی مار');area.appendChild(canvas);const ctx=canvas.getContext('2d');let snake=[{x:8,y:8},{x:7,y:8},{x:6,y:8}],dir={x:1,y:0},next={x:1,y:0},food={x:13,y:9},score=0,dead=false,step=0;
 function spawn(){food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)};if(snake.some(p=>p.x===food.x&&p.y===food.y))spawn();}
 function draw(){ctx.fillStyle='#111318';ctx.fillRect(0,0,420,420);ctx.strokeStyle='#1e222a';for(let i=0;i<=20;i++){ctx.beginPath();ctx.moveTo(i*21,0);ctx.lineTo(i*21,420);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*21);ctx.lineTo(420,i*21);ctx.stroke();}ctx.fillStyle='#ff9b42';ctx.beginPath();ctx.arc(food.x*21+10.5,food.y*21+10.5,8,0,Math.PI*2);ctx.fill();snake.forEach((p,i)=>{ctx.fillStyle=i?'#82c89a':'#c7f6d3';ctx.fillRect(p.x*21+2,p.y*21+2,17,17);});if(dead){ctx.fillStyle='#000b';ctx.fillRect(0,160,420,100);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 24px Tahoma';ctx.fillText('بازی تمام شد',210,202);ctx.font='16px Tahoma';ctx.fillText('امتیاز: '+score,210,232);}}
 function tick(){if(dead)return;dir=next;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.y<0||h.x>=20||h.y>=20||snake.some(p=>p.x===h.x&&p.y===h.y)){dead=true;draw();say('بازی تمام شد — برای شروع دوباره دکمه شروع دوباره را بزن.');return;}snake.unshift(h);if(h.x===food.x&&h.y===food.y){score++;spawn();}else snake.pop();draw();}
 function setDir(d){if(d.x!==-dir.x||d.y!==-dir.y)next=d;}
 function key(e){const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}};if(m[e.key]){e.preventDefault();setDir(m[e.key]);}}
 document.addEventListener('keydown',key);area.addEventListener('touchstart',function(e){const t=e.changedTouches[0];this._tx=t.clientX;this._ty=t.clientY;},{passive:true});area.addEventListener('touchend',function(e){const t=e.changedTouches[0],dx=t.clientX-this._tx,dy=t.clientY-this._ty;if(Math.max(Math.abs(dx),Math.abs(dy))>20)setDir(Math.abs(dx)>Math.abs(dy)?{x:Math.sign(dx),y:0}:{x:0,y:Math.sign(dy)});},{passive:true});
 loopId=setInterval(tick,125);draw();$('#instructions').textContent='حرکت: جهت‌های کیبورد، WASD، دسته بازی یا کشیدن انگشت روی صفحه. هدف: جمع کردن دایره نارنجی.';
 gameCleanup=()=>{document.removeEventListener('keydown',key);if(loopId)clearInterval(loopId);loopId=null;};
 gameState={move:d=>setDir(d),confirm:()=>{}};
}
function start2048(){
 let board=Array(16).fill(0),score=0,over=false;const wrap=document.createElement('div');wrap.style.textAlign='center';const sc=document.createElement('p');sc.style.color='#ffbd7b';wrap.appendChild(sc);const grid=document.createElement('div');grid.className='board2048';grid.tabIndex=0;wrap.appendChild(grid);area.appendChild(wrap);
 function spawn(){const e=[];board.forEach((v,i)=>{if(!v)e.push(i)});if(e.length)board[e[Math.floor(Math.random()*e.length)]]=Math.random()<.9?2:4;}
 function draw(){sc.textContent='امتیاز: '+faNum(score);grid.innerHTML=board.map(v=>'<div class="tile" data-v="'+v+'">'+(v||'')+'</div>').join('');}
 function move(d){if(over)return;let changed=false;for(let line=0;line<4;line++){let ids=[];for(let j=0;j<4;j++){let r=d==='left'?line:d==='right'?line:d==='up'?j:3-j,c=d==='left'?j:d==='right'?3-j:d==='up'?line:line;ids.push(r*4+c);}let vals=ids.map(i=>board[i]).filter(Boolean);for(let i=0;i<vals.length-1;i++){if(vals[i]===vals[i+1]){vals[i]*=2;score+=vals[i];vals.splice(i+1,1);}}while(vals.length<4)vals.push(0);ids.forEach((id,i)=>{if(board[id]!==vals[i])changed=true;board[id]=vals[i];});}if(changed){spawn();draw();if(!board.includes(0)&&!hasMoves()){over=true;say('حرکت دیگری باقی نمانده است.');}}}
 function hasMoves(){for(let r=0;r<4;r++)for(let c=0;c<4;c++){let i=r*4+c;if(c<3&&board[i]===board[i+1]||r<3&&board[i]===board[i+4])return true;}return false;}
 function key(e){let m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(m[e.key]){e.preventDefault();move(m[e.key]);}}
 document.addEventListener('keydown',key);spawn();spawn();draw();$('#instructions').textContent='با جهت‌ها یا دکمه‌های دسته، کاشی‌ها را حرکت بده. روی موبایل می‌توانی صفحه را بکشانی.';area.addEventListener('touchstart',function(e){const t=e.changedTouches[0];this._tx=t.clientX;this._ty=t.clientY;},{passive:true});area.addEventListener('touchend',function(e){const t=e.changedTouches[0],dx=t.clientX-this._tx,dy=t.clientY-this._ty;if(Math.max(Math.abs(dx),Math.abs(dy))>20)move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));},{passive:true});
 gameCleanup=()=>document.removeEventListener('keydown',key);gameState={move:d=>move(d),confirm:()=>{}};
}
function startTtt(){
 let cells=Array(9).fill(''),turn='X',done=false,cursor=0;const grid=document.createElement('div');grid.className='ttt';area.appendChild(grid);
 function draw(){grid.innerHTML=cells.map((v,i)=>'<button data-i="'+i+'" aria-label="خانه '+faNum(i+1)+'">'+v+'</button>').join('');$$('.ttt button').forEach(b=>b.addEventListener('click',()=>play(+b.dataset.i)));if(consoleMode&&!modal.classList.contains('open'))return;}
 function play(i){if(done||cells[i])return;cells[i]=turn;let win=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].some(a=>a.every(n=>cells[n]===turn));if(win){done=true;say('برنده: '+(turn==='X'?'بازیکن اول':'بازیکن دوم'));}else if(cells.every(Boolean)){done=true;say('مساوی شد!');}else turn=turn==='X'?'O':'X';draw();}
 function key(e){let m={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3};if(e.key in m){e.preventDefault();cursor=(cursor+m[e.key]+9)%9;const b=grid.querySelector('[data-i="'+cursor+'"]');if(b)b.focus();}if(e.key==='Enter'||e.key===' '){e.preventDefault();play(cursor);}}
 document.addEventListener('keydown',key);draw();$('#instructions').textContent='دو نفره روی یک دستگاه: خانه‌ای را انتخاب کن. با دسته بین خانه‌ها حرکت کن و با تأیید انتخاب کن.';gameState={move:d=>{cursor=(cursor+(d==='left'?-1:d==='right'?1:d==='up'?-3:3)+9)%9;const b=grid.querySelector('[data-i="'+cursor+'"]');if(b)b.focus();},confirm:()=>play(cursor)};gameCleanup=()=>document.removeEventListener('keydown',key);
}
function startMemory(){
 const symbols=['🍊','🍋','🍇','🍉','🍒','🥝','🍍','🍓'];let vals=symbols.concat(symbols).sort(()=>Math.random()-.5),open=[],matched=new Set(),moves=0,cursor=0,locked=false;const wrap=document.createElement('div');wrap.style.textAlign='center';const label=document.createElement('p');label.style.color='#ffbd7b';wrap.appendChild(label);const grid=document.createElement('div');grid.className='ttt';grid.style.gridTemplateColumns='repeat(4,minmax(52px,86px))';wrap.appendChild(grid);area.appendChild(wrap);
 function draw(){label.textContent='حرکت‌ها: '+faNum(moves)+' · جفت‌ها: '+faNum(matched.size/2);grid.innerHTML=vals.map((v,i)=>'<button data-i="'+i+'" style="font-size:30px" aria-label="کارت '+faNum(i+1)+'">'+(matched.has(i)||open.includes(i)?v:'?')+'</button>').join('');$$('#gameArea [data-i]').forEach(b=>b.addEventListener('click',()=>flip(+b.dataset.i)));}
 function flip(i){if(locked||matched.has(i)||open.includes(i))return;open.push(i);if(open.length===2){moves++;if(vals[open[0]]===vals[open[1]]){open.forEach(n=>matched.add(n));open=[];if(matched.size===vals.length)say('آفرین! همه جفت‌ها پیدا شدند.');}else{locked=true;const pair=open.slice();setTimeout(()=>{open=[];locked=false;draw();},650);}}draw();}
 function key(e){let m={ArrowLeft:-1,ArrowRight:1,ArrowUp:-4,ArrowDown:4};if(e.key in m){e.preventDefault();cursor=(cursor+m[e.key]+16)%16;const b=grid.querySelector('[data-i="'+cursor+'"]');if(b)b.focus();}if(e.key==='Enter'||e.key===' '){e.preventDefault();flip(cursor);}}
 document.addEventListener('keydown',key);draw();$('#instructions').textContent='با دسته یا لمس، کارت‌ها را برگردان و دو تصویر یکسان پیدا کن.';gameState={move:d=>{cursor=(cursor+(d==='left'?-1:d==='right'?1:d==='up'?-4:4)+16)%16;const b=grid.querySelector('[data-i="'+cursor+'"]');if(b)b.focus();},confirm:()=>flip(cursor)};gameCleanup=()=>document.removeEventListener('keydown',key);
}
$$('[data-dir]').forEach(b=>b.addEventListener('click',()=>gameState&&gameState.move(b.dataset.dir)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeGame();if(!consoleMode||modal.classList.contains('open'))return;const cards=$$('.game-card');if(!cards.length)return;const cols=window.innerWidth<620?2:window.innerWidth<900?3:4;let d={ArrowLeft:-1,ArrowRight:1,ArrowUp:-cols,ArrowDown:cols};if(e.key in d){e.preventDefault();focusIndex=(focusIndex+d[e.key]+cards.length)%cards.length;cards[focusIndex].focus();}if(e.key==='Enter'&&document.activeElement.classList.contains('game-card')){e.preventDefault();openGame(document.activeElement.dataset.game);}});
function pollGamepad(){const pads=navigator.getGamepads?navigator.getGamepads():[];let p=Array.from(pads).find(Boolean);if(p){if(!padConnected){padConnected=true;$('#padStatus').textContent='دسته متصل شد';$('#padStatus').style.color='#9de4ad';say('دسته شناسایی شد: '+p.id);}let b=p.buttons.map(x=>x.pressed);if(consoleMode){let dx=(p.axes[0]||0),dy=(p.axes[1]||0);let dir=null;if(p.buttons[14]?.pressed)dir='left';else if(p.buttons[15]?.pressed)dir='right';else if(p.buttons[12]?.pressed)dir='up';else if(p.buttons[13]?.pressed)dir='down';else if(Math.abs(dx)>.65)dir=dx<0?'left':'right';else if(Math.abs(dy)>.65)dir=dy<0?'up':'down';if(dir&&lastPadDir!==dir){if(modal.classList.contains('open')){if(gameState)gameState.move(dir);}else{const cards=$('.game-card');if(cards.length){let cols=window.innerWidth<620?2:window.innerWidth<900?3:4;let delta={left:-1,right:1,up:-cols,down:cols}[dir];focusIndex=(focusIndex+delta+cards.length)%cards.length;cards[focusIndex].focus();}}}lastPadDir=dir;if(!dir)lastPadDir=null;if(b[0]&&!lastPadButtons[0]){if(modal.classList.contains('open')){if(gameState)gameState.confirm();}else{const card=document.activeElement.closest&&document.activeElement.closest('.game-card');if(card)openGame(card.dataset.game);}}if(b[1]&&!lastPadButtons[1]&&modal.classList.contains('open'))closeGame();lastPadButtons=b;}}
 else if(padConnected){padConnected=false;$('#padStatus').textContent='دسته قطع شد';$('#padStatus').style.color='var(--muted)';lastPadButtons=[];}requestAnimationFrame(pollGamepad);}
window.addEventListener('gamepadconnected',e=>{padConnected=true;$('#padStatus').textContent='دسته متصل شد';say('دسته آماده است.');});window.addEventListener('gamepaddisconnected',()=>{padConnected=false;$('#padStatus').textContent='دسته قطع شد';});
render();requestAnimationFrame(pollGamepad);
})();
