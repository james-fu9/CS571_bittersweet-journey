// Original lantern, fog, and traveler engine, adapted to effect-owned lifecycle and React progress.
export function mountJourney(root, camera, state, lifecycle, bus) {

  const map=root.querySelector('.china-map'), stage=map?.closest('.atlas-map-stage');
  if(!stage||!camera)return;
  const canvas=document.createElement('canvas');canvas.className='journey-fog';canvas.setAttribute('aria-hidden','true');
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const NS='http://www.w3.org/2000/svg';
  const traveler=document.createElementNS(NS,'svg');traveler.classList.add('journey-traveler');
  traveler.setAttribute('viewBox','0 0 120 96');traveler.setAttribute('aria-hidden','true');
  traveler.innerHTML=`<g class="journey-facing">
    <ellipse cx="52" cy="86" rx="34" ry="3" fill="#000" opacity=".2"/>
    <g fill="none" stroke="#b48e56" stroke-width="5" stroke-linecap="round">
      <path class="journey-leg" d="M32 57L30 73L25 84H32"/>
      <path class="journey-leg" d="M42 58L46 74L48 84H54"/>
      <path class="journey-leg" d="M65 57L62 72L59 84H66"/>
      <path class="journey-leg" d="M73 55L78 73L77 84H84"/>
    </g>
    <path d="M28 45Q17 38 16 55L11 65Q22 61 24 49" fill="#524334"/>
    <path d="M25 47Q27 36 41 38L66 39L75 28L81 18L88 22L99 33L96 39L84 35L79 52Q73 58 64 58L39 57Q26 57 25 47Z" fill="#a88b67" stroke="#d6bd93" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M76 33L76 21L82 15L85 21L82 29L78 39M85 22L85 14L89 21" fill="#524334" stroke="#524334" stroke-width="1.5"/>
    <path d="M35 40Q49 44 64 40L61 52H37Z" fill="#795549" stroke="#c3a47b" stroke-width="1.4"/>
    <circle cx="89" cy="28" r="1.3" fill="#302a22"/>
    <path d="M95 36Q80 43 59 32" fill="none" stroke="#574632" stroke-width="1.2"/>
    <path d="M32 48L43 50L42 63L31 60Z" fill="#82704f" stroke="#d1bd92" stroke-width="1.2"/>
    <path d="M33 45L41 47M34 44V50M39 45V51" stroke="#e4d7b7" stroke-width="2"/>
    <g class="journey-rider">
      <path class="journey-robe" d="M46 23L40 36L36 52L51 48L58 55L58 35L54 24Z" fill="#53666a" stroke="#c5bea6" stroke-width="1.1"/>
      <path d="M47 40L55 47L57 61H63" fill="none" stroke="#414d50" stroke-width="4" stroke-linecap="round"/>
      <path d="M54 28L61 34L71 32" fill="none" stroke="#82908b" stroke-width="3" stroke-linecap="round"/>
      <circle cx="51" cy="19" r="5" fill="#c9a67a"/>
      <path d="M52 22L55 28L49 25" fill="#40382f"/>
      <path d="M34 18L49 8L65 20Q49 23 34 18Z" fill="#aa8c5b" stroke="#deca9d" stroke-width="1.2"/>
      <path d="M49 9L45 20M49 9L56 21" stroke="#70593e" stroke-width=".8"/>
    </g>
    <g class="journey-dust" fill="#c3aa7c" opacity=".35"><circle cx="14" cy="84" r="2"/><circle cx="6" cy="81" r="1.3"/><circle cx="20" cy="87" r="1.2"/></g>
  </g>`;
  stage.append(canvas,traveler);
  const status=document.createElement('span');status.className='journey-status';status.setAttribute('role','status');
  root.querySelector('.atlas-intro').append(status);
  root.classList.add('journey-ready');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const points=[...map.querySelectorAll('.story-point.available, .story-point.primary')];
  let pendingLight=points.find(point=>point.dataset.story===root.dataset.returningStory)||null;
  let lightReveal=null;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let box, matrix, inverse, width=1,height=1,dpr=1,dirty=true,frame=0,previous=0;
  let light=null,follow=null,position=null,roam=null,lastPointer=0,nextRoam=0,trip=null,completed=[];
  let paused=false,heading=1,illumination=0,revealStart=null;
  const world=(x,y)=>new DOMPoint(x,y).matrixTransform(inverse);
  const screen=p=>{const a=new DOMPoint(p.x,p.y).matrixTransform(matrix);return {x:a.x-box.left,y:a.y-box.top};};
  const pointWorld=point=>{const b=point.querySelector('.point-core').getBoundingClientRect();return world(b.left+b.width/2,b.top+b.height/2);};
  function dimensions(){
    box=stage.getBoundingClientRect();matrix=map.getScreenCTM();if(!matrix)return;
    inverse=matrix.inverse();width=Math.max(1,box.width);height=Math.max(1,box.height);
    dpr=Math.min(devicePixelRatio||1,1.5);
    const w=Math.ceil(width*dpr),h=Math.ceil(height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    if(!position){const seed=points.find(p=>p.dataset.story==='dujiangyan')||points[0];position=seed?pointWorld(seed):world(box.left+width/2,box.top+height/2);position={x:position.x-30,y:position.y+20};}
    dirty=true;wake();
  }
  function refresh(){
    completed=points.filter(point=>state.complete[point.dataset.story]);
    if(pendingLight&&!completed.includes(pendingLight)){pendingLight=null;lightReveal?.resolve();lightReveal=null;}
    const allChaptersRead=points.length===9 && completed.length===9;
    illumination=allChaptersRead?1:0;
    root.classList.toggle('journey-illuminated',allChaptersRead);
    canvas.dataset.completed=String(completed.length);dirty=true;wake();
  }
  function hole(x,y,r,strength=1){
    if(r<=0)return;
    ctx.globalAlpha=strength;
    const gradient=ctx.createRadialGradient(x,y,r*.48,x,y,r);
    gradient.addColorStop(0,'rgba(0,0,0,1)');gradient.addColorStop(.5,'rgba(0,0,0,.8)');gradient.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
  }
  function paintFog(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation='source-over';ctx.fillStyle=`rgba(54,35,23,${.75*(1-illumination)})`;ctx.fillRect(0,0,width,height);
    ctx.globalCompositeOperation='destination-out';
    completed.forEach(point=>{const p=screen(pointWorld(point));const growth=point===pendingLight?(lightReveal?.progress||0):1;hole(p.x,p.y,Math.min(76*matrix.a*growth+illumination*Math.hypot(width,height),Math.hypot(width,height)*2));});
    if(light)hole(light.x,light.y,width<600?125:170,.68);
    ctx.globalCompositeOperation='source-over';dirty=false;
  }
  function paintTraveler(moving){
    const p=screen(position);traveler.style.transform=`translate(${p.x-40}px,${p.y-57}px)`;
    traveler.querySelector('.journey-facing').style.transform=`scaleX(${heading})`;
    traveler.classList.toggle('is-walking',moving&&!reduced.matches);
    traveler.classList.toggle('is-running',Boolean(trip)&&!reduced.matches);
  }
  function chooseRoam(now){
    nextRoam=now+2600+Math.random()*2500;const land=map.querySelector('.atlas-land');
    for(let i=0;i<12;i++){
      const angle=Math.random()*Math.PI*2,distance=(20+Math.random()*65)/matrix.a;
      const candidate={x:position.x+Math.cos(angle)*distance,y:position.y+Math.sin(angle)*distance},p=screen(candidate);
      if(p.x>35&&p.x<width-35&&p.y>65&&p.y<height-35&&(!land?.isPointInFill||land.isPointInFill(new DOMPoint(candidate.x,candidate.y)))){roam=candidate;return;}
    }
    // A camera pan may leave the traveler offscreen: walk back into its current viewport.
    roam=world(box.left+width*.5,box.top+height*.55);
  }
  function tick(now){
    frame=0;if(paused||document.hidden)return;
    const dt=Math.min((now-(previous||now))/1000,.05);previous=now;let moving=false;
    if(lightReveal){
      const t=reduced.matches?1:clamp((now-lightReveal.start)/1100,0,1);
      lightReveal.progress=1-Math.pow(1-t,2);dirty=true;
      if(t===1){const done=lightReveal.resolve;lightReveal=null;pendingLight=null;done();}
    }
    if(revealStart!==null){
      const t=reduced.matches?1:clamp((now-revealStart)/2400,0,1);illumination=t*t*(3-2*t);dirty=true;
      if(t===1){revealStart=null;root.classList.add('journey-illuminated');bus.dispatchEvent(new Event('map-illuminated'));}
    }
    if(trip){
      const job=trip,end=pointWorld(job.point),t=clamp((now-job.start)/job.duration,0,1),ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      heading=end.x>=position.x?1:-1;position={x:job.from.x+(end.x-job.from.x)*ease,y:job.from.y+(end.y-job.from.y)*ease};
      light=screen(position);dirty=true;moving=t<1;
      if(t===1){trip=null;root.classList.remove('is-journey-running');traveler.dataset.state='arrived';status.textContent='';job.resolve(true);}
    }else if(!reduced.matches){
      if(follow&&now-lastPointer>=2200&&Math.hypot(follow.x-position.x,follow.y-position.y)<=23/matrix.a)follow=null;
      const following=Boolean(follow);
      if(!following&&now>nextRoam)chooseRoam(now);
      const target=following?follow:roam;
      if(target){
        const dx=target.x-position.x,dy=target.y-position.y,distance=Math.hypot(dx,dy),stop=following?22/matrix.a:3/matrix.a;
        if(distance>stop){const step=Math.min(distance-stop,(following?48:17)*dt/matrix.a);position.x+=dx/distance*step;position.y+=dy/distance*step;heading=dx>=0?1:-1;moving=step>0;}
      }
    }
    if(dirty)paintFog();paintTraveler(moving);
    if(!reduced.matches||trip||revealStart!==null||lightReveal)wake();
  }
  function wake(){if(!frame&&!paused&&!document.hidden)frame=lifecycle.frame(tick);}
  function pointer(e){
    if(trip||e.target.closest('.atlas-navigation'))return;
    const x=clamp(e.clientX-box.left,0,width),y=clamp(e.clientY-box.top,0,height);
    light={x,y};follow=world(box.left+x,box.top+y);lastPointer=performance.now();
    if(reduced.matches)position={x:follow.x-22/matrix.a,y:follow.y};
    dirty=true;wake();
  }
  function cancel(){
    if(trip){const job=trip;trip=null;job.resolve(false);}
    root.classList.remove('is-journey-running');status.textContent='';traveler.dataset.state='idle';
  }
  function travelTo(point){
    if(trip||!point)return Promise.resolve(false);
    dimensions();const end=pointWorld(point);
    if(reduced.matches){position={x:end.x,y:end.y};light=screen(position);dirty=true;paintFog();paintTraveler(false);traveler.dataset.state='arrived';return Promise.resolve(true);}
    const distance=Math.hypot(end.x-position.x,end.y-position.y)*matrix.a;
    traveler.dataset.state='running';root.classList.add('is-journey-running');
    status.textContent=root.dataset.language==='en'?'On our way to the next chapter…':'旅人正赶往这一章…';
    return new Promise(resolve=>{trip={point,from:{...position},start:performance.now(),duration:clamp(distance/650*1000,550,1600),resolve};wake();});
  }
  lifecycle.listen(stage,'pointermove',pointer,{passive:true});lifecycle.listen(stage,'pointerdown',pointer,{passive:true});
  lifecycle.listen(stage,'pointerleave',()=>{if(!trip){follow=null;light=null;dirty=true;wake();}});
  lifecycle.listen(map,'focusin',e=>{
    const point=e.target.closest('.story-point');dimensions();
    const p=point?screen(pointWorld(point)):{x:width/2,y:height/2};light=p;follow=world(box.left+p.x,box.top+p.y);lastPointer=performance.now();dirty=true;wake();
  });
  lifecycle.listen(bus,'camera-change',dimensions);
  lifecycle.listen(window,'scroll',dimensions,{passive:true});
  lifecycle.listen(bus,'progress-change',refresh);
  lifecycle.listen(bus,'illuminate',()=>{revealStart=performance.now();dirty=true;wake();});

  lifecycle.resize(stage,dimensions);
  lifecycle.listen(reduced,'change',()=>{if(reduced.matches&&trip){const job=trip;position=pointWorld(job.point);trip=null;root.classList.remove('is-journey-running');status.textContent='';job.resolve(true);}dirty=true;wake();});
  lifecycle.listen(document,'visibilitychange',()=>{previous=0;if(!document.hidden)wake();});
  lifecycle.listen(window,'pagehide',()=>{paused=true;lifecycle.cancelFrame(frame);frame=0;cancel();});
  lifecycle.listen(window,'pageshow',()=>{paused=false;previous=0;dimensions();refresh();});
  dimensions();refresh();
  paintFog();paintTraveler(false);root.classList.add('journey-mounted');
  function revealChapter(name){
    const point=points.find(p=>p.dataset.story===name);
    if(!point||!completed.includes(point))return Promise.resolve();
    lightReveal?.resolve();
    if(reduced.matches){pendingLight=null;lightReveal=null;dirty=true;wake();return Promise.resolve();}
    pendingLight=point;
    return new Promise(resolve=>{lightReveal={start:performance.now(),progress:0,resolve};dirty=true;wake();});
  }
  const api=Object.freeze({travelTo,revealChapter,get state(){return {position:{...position},light:light?{...light}:null,running:Boolean(trip),completed:completed.map(p=>p.dataset.story)};}});

  lifecycle.cleanup(()=>{paused=true;cancel();lightReveal?.resolve();canvas.remove();traveler.remove();status.remove();});
  return api;
}
