// Adapted from Yanbing Chen and Eugenie Huang's atlas-camera.js. Original geometry and interactions retained.
export function mountCamera(root, data, lifecycle, bus) {

  const svg = root.querySelector('.china-map');
  const stage = svg.closest('.atlas-map-stage');

  if (!data) return;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k,v]) => node.setAttribute(k,v));
    parent?.append(node); return node;
  };
  const layer = el('g', {class:'physical-atlas', 'aria-hidden':'true'});
  svg.querySelector('.river-skeleton').before(layer);
  const defs = svg.querySelector('defs');
  const wash=el('filter',{id:'atlas-wash',x:'-10%',y:'-10%',width:'120%',height:'120%'},defs);
  el('feGaussianBlur',{stdDeviation:1.4},wash);
  const sand = el('pattern',{id:'atlas-sand',width:7,height:9,patternUnits:'userSpaceOnUse'},defs);
  el('path',{d:'M1 3q1.5-1 3 0M4 7h.3',fill:'none',stroke:'#a88b57','stroke-width':'.4',opacity:'.45'},sand);
  el('rect',{x:-500,y:-500,width:2500,height:2000,class:'atlas-sea'},layer);
  el('path',{d:data.land,class:'atlas-land','fill-rule':'evenodd'},layer);
  const regions = el('g',{class:'atlas-regions',filter:'url(#atlas-wash)'},layer);
  data.regions.forEach(f => {
    el('path',{d:f.d,class:`atlas-region atlas-region-${f.kind}`},regions);
    if(f.kind==='desert')el('path',{d:f.d,fill:'url(#atlas-sand)',opacity:'.55'},regions);
  });
  const relief=el('g',{class:'atlas-relief'},layer);
  data.hachures.forEach((d,i)=>el('path',{d,class:`atlas-hachures weight-${i}`},relief));
  data.contours.forEach(f=>el('path',{d:f.d,class:'atlas-contour','data-level':f.altitude===3000?1:2},relief));
  const water=el('g',{class:'atlas-water'},layer);
  data.rivers.forEach(f=>el('path',{d:f.d,class:'atlas-stream','data-level':f.level},water));
  data.lakes.forEach(f=>el('path',{d:f.d,class:'atlas-lake','data-level':f.level},water));
  const labels=el('g',{class:'physical-labels','aria-hidden':'true'});
  svg.querySelector('.ancient-routes').before(labels);
  const labelEntries=[];
  function label(f,level=f.level) {
    if(!f.at?.every(Number.isFinite))return;
    const node=el('text',{x:f.at[0],y:f.at[1],class:`physical-label ${f.kind||'lake'}`,'text-anchor':'middle'},labels);
    labelEntries.push({node,...f,level});
  }
  data.regions.sort((a,b)=>a.level-b.level).forEach(f=>label(f));
  const namedLakes=new Set(['Qinghai Hu','Dongting Hu','Poyang Hu','Tai Hu','Bosten Hu','Nam Co','Issyk-Kul','Lake Balkhash']);
  data.lakes.filter(f=>namedLakes.has(f.en)).forEach(f=>label(f,2));
  function project(lon,lat) {
    const {n,C,coeff}=data.projection, rad=Math.PI/180;
    const rho=Math.sqrt(C-2*n*Math.sin(lat*rad))/n,t=n*(lon-105)*rad;
    const raw=[rho*Math.sin(t),-rho*Math.cos(t),1];
    return coeff.map(c=>c.reduce((s,v,i)=>s+v*raw[i],0));
  }
  // WGS84 anchors from the chapter geodata builders; project once, never offset on zoom.
  const chapterCoordinates = {
    kashgar: [75.9898, 39.4704], yangguan: [94.05904, 39.92725],
    'secret-spring': [94.675, 40.084], 'taoist-tower': [94.809, 40.043],
    'mogao-caves': [94.80417, 40.03722], dujiangyan: [103.617, 30.988],
    chengde: [117.962, 40.954], 'fish-tail-lodge': [83.96404, 28.20095]
  };
  Object.entries(chapterCoordinates).forEach(([name, [lon, lat]]) => {
    const group = svg.querySelector('[data-story="' + name + '"]');
    const core = group?.querySelector('.point-core');
    if (!core) return;
    const [x, y] = project(lon, lat);
    group.dataset.longitude = lon;
    group.dataset.latitude = lat;
    group.setAttribute('transform', 'translate(' + (x - core.cx.baseVal.value) + ' ' + (y - core.cy.baseVal.value) + ')');
  });
  [ ['黄海','Yellow Sea',123,35,1],['东海','East China Sea',125,28,1],['南海','South China Sea',115,19,1],
    ['岷江','Min River',103.7,31.7,3],['塔里木河','Tarim River',84,41,2],
    ['敦煌','Dunhuang',94.662,40.142,3],['鸣沙山','Mingsha Dunes',94.67,40.05,3],
    ['成都','Chengdu',104.0665,30.5728,3],['博克拉','Pokhara',83.9856,28.2096,3]
  ].forEach(([zh,en,lon,lat,level])=>label({zh,en,at:project(lon,lat),kind:en.includes('Sea')?'sea':'local'},level));

  const ui=document.createElement('div'); ui.className='atlas-navigation';
  ui.innerHTML='<div class="atlas-zoom-controls" role="group"><button type="button" data-camera="in">+</button><button type="button" data-camera="out">−</button><button type="button" data-camera="home" class="atlas-home"></button></div><span class="atlas-scale"></span>';
  stage.append(ui);
  const storageKey='bittersweet-journey:atlas-camera:v1';
  let camera={x:556,y:407,k:1},baseWidth=720,baseHeight=450,queued=false,level=1;
  let dragged=false,suppressUntil=0,gesture=null;
  const pointers=new Map();
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const language=()=>root.dataset.language==='en'?'en':'zh';
  function dimensions(){
    const rect=svg.getBoundingClientRect(),aspect=rect.width/Math.max(1,rect.height);
    baseWidth=rect.width<=600?440:Math.max(700,365*aspect);
    baseHeight=baseWidth/aspect;
  }
  function save(){try{sessionStorage.setItem(storageKey,JSON.stringify(camera));}catch{}}
  function constrain(){
    camera.k=clamp(camera.k,.65,6);
    const w=baseWidth/camera.k,h=baseHeight/camera.k;
    // The regional dataset comfortably surrounds the story extent.
    camera.x=clamp(camera.x,230+w*.22,1000-w*.22);
    camera.y=clamp(camera.y,140+h*.2,650-h*.2);
  }
  function paint(){
    queued=false;constrain();
    const w=baseWidth/camera.k,h=baseHeight/camera.k;
    svg.setAttribute('viewBox',`${camera.x-w/2} ${camera.y-h/2} ${w} ${h}`);
    level=camera.k>=3.2?3:camera.k>=1.65?2:1;
    svg.dataset.detail=level;svg.dataset.zoom=camera.k.toFixed(3);
    root.classList.toggle('atlas-exploring',camera.k>1.1||Math.abs(camera.x-556)>8||Math.abs(camera.y-407)>8);
    svg.style.setProperty('--atlas-unit',w/svg.clientWidth);
    ui.querySelector('[data-camera="in"]').disabled=camera.k>=6;
    ui.querySelector('[data-camera="out"]').disabled=camera.k<=.65;
    ui.querySelector('.atlas-scale').textContent=language()==='en'?`${['','Landscape','Region','Local detail'][level]} · ${camera.k.toFixed(1)}×`:`${['','山河全览','区域地景','地方细节'][level]} · ${camera.k.toFixed(1)}×`;
    bus.dispatchEvent(new Event('camera-change'));
  }
  function requestPaint(){if(!queued){queued=true;lifecycle.frame(paint);}}
  function screenPoint(x,y){
    const p=new DOMPoint(x,y);return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  function zoomAt(k,x,y){
    const before=screenPoint(x,y),next=clamp(k,.65,6),ratio=camera.k/next;
    camera.x=before.x+(camera.x-before.x)*ratio;
    camera.y=before.y+(camera.y-before.y)*ratio;
    camera.k=next;paint();save();
  }
  function reset(){camera={x:556,y:407,k:Math.max(.65,Math.min(1,baseWidth/700))};paint();save();}
  function localize(){
    const en=language()==='en';
    const texts=en?['Zoom in','Zoom out','Show all chapters']:['放大地图','缩小地图','全图：显示全部章节'];
    ui.querySelector('.atlas-zoom-controls').setAttribute('aria-label',en?'Map navigation':'地图视野');
    ui.querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-label',texts[i]);b.title=texts[i];});
    ui.querySelector('.atlas-home').textContent=en?'All':'全图';
    svg.setAttribute('aria-label',en?'Interactive landscape atlas. Arrow keys pan, plus and minus zoom, Home shows all chapters.':'可交互山河地图：方向键移动，加减键缩放，Home 键返回全图。');
    labelEntries.forEach(f=>{f.node.textContent=en?f.en:f.zh||f.en;});
    requestPaint();
  }
  function layoutLabels(taken,area,scale){
    const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    const overlays=[ui].map(n=>n.getBoundingClientRect()).map(b=>{
      const a=screenPoint(b.left,b.top),c=screenPoint(b.right,b.bottom);return {left:a.x,top:a.y,right:c.x,bottom:c.y};
    });
    const occupied=[...taken,...overlays];
    labelEntries.forEach(f=>{
      const node=f.node;node.style.visibility='hidden';
      if(f.level>level)return;
      const font=(f.kind==='plateau'||f.kind==='desert'?16:14)/scale;
      node.style.fontSize=font+'px';node.style.strokeWidth=3/scale+'px';
      node.style.letterSpacing=(language()==='zh'?.12:.025)+'em';
      node.setAttribute('x',f.at[0]);
      for(const dy of [0,-16,16,-32,32]){
        node.setAttribute('y',f.at[1]+dy/scale);
        const b=node.getBBox(),pad=4/scale;
        const box={left:b.x-pad,right:b.x+b.width+pad,top:b.y-pad,bottom:b.y+b.height+pad};
        if(box.left<area.left||box.right>area.right||box.top<area.top||box.bottom>area.bottom||occupied.some(o=>intersects(box,o)))continue;
        node.style.visibility='visible';occupied.push(box);break;
      }
    });
  }
  svg.setAttribute('role','group');svg.setAttribute('tabindex','0');
  lifecycle.listen(svg,'wheel',e=>{e.preventDefault();zoomAt(camera.k*Math.exp(-clamp(e.deltaY*(e.deltaMode===1?16:1),-100,100)*.0025),e.clientX,e.clientY);},{passive:false});
  lifecycle.listen(ui,'click',e=>{
    const action=e.target.closest('button')?.dataset.camera;if(!action)return;
    if(action==='home'){reset();return;}
    const r=svg.getBoundingClientRect();zoomAt(camera.k*(action==='in'?1.4:1/1.4),r.left+r.width/2,r.top+r.height/2);
  });
  lifecycle.listen(svg,'keydown',e=>{
    // Arrow/zoom shortcuts belong to the focused map, not chapter activation.
    const step=baseWidth/camera.k*.09;
    if(['+','=','-','_'].includes(e.key)){e.preventDefault();const r=svg.getBoundingClientRect();zoomAt(camera.k*(['+','='].includes(e.key)?1.3:1/1.3),r.left+r.width/2,r.top+r.height/2);}
    else if(e.key==='Home'){e.preventDefault();reset();}
    else if(e.key.startsWith('Arrow')){e.preventDefault();camera.x+=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;camera.y+=e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0;paint();save();}
  });
  function begin(){
    const p=[...pointers.values()];if(!p.length){gesture=null;return;}
    const center=p.length>1?{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}:p[0];
    gesture={center,point:screenPoint(center.x,center.y),camera:{...camera},distance:p.length>1?Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y):0};
  }
  lifecycle.listen(svg,'pointerdown',e=>{
    if(e.button!==0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===1){dragged=false;svg.classList.add('is-panning');}
    if(pointers.size>1){dragged=true;suppressUntil=performance.now()+500;}
    // Capture on the initial target so a tap still activates its chapter.
    e.target.setPointerCapture?.(e.pointerId);begin();
  });
  lifecycle.listen(svg,'pointermove',e=>{
    if(!pointers.has(e.pointerId)||!gesture)return;
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...pointers.values()];
    const center=p.length>1?{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}:p[0];
    if(!dragged&&Math.hypot(center.x-gesture.center.x,center.y-gesture.center.y)<5)return;
    dragged=true;suppressUntil=performance.now()+500;
    const ratio=gesture.distance&&p.length>1?Math.hypot(p[1].x-p[0].x,p[1].y-p[0].y)/gesture.distance:1;
    camera.k=clamp(gesture.camera.k*ratio,.65,6);
    const r=svg.getBoundingClientRect(),units=baseWidth/camera.k/r.width;
    camera.x=gesture.point.x-(center.x-r.left-r.width/2)*units;
    camera.y=gesture.point.y-(center.y-r.top-r.height/2)*units;
    requestPaint();
  });
  function end(e){
    if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);
    if(dragged){suppressUntil=performance.now()+500;paint();save();}
    begin();if(!pointers.size)svg.classList.remove('is-panning');
  }
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>lifecycle.listen(svg,type,end));
  lifecycle.listen(svg,'click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
  lifecycle.listen(svg,'focusin',e=>{
    const core=e.target.closest('.story-point')?.querySelector('.point-core');if(!core)return;
    const b=core.getBoundingClientRect(),r=svg.getBoundingClientRect();
    if(b.left<r.left+25||b.right>r.right-25||b.top<r.top+25||b.bottom>r.bottom-25){
      const p=screenPoint(b.left+b.width/2,b.top+b.height/2);camera.x=p.x;camera.y=p.y;paint();
    }
  });
  lifecycle.resize(stage,()=>{dimensions();requestPaint();});

  dimensions();
  try{const saved=JSON.parse(sessionStorage.getItem(storageKey));if(saved&&['x','y','k'].every(k=>Number.isFinite(saved[k]))){camera=saved;}}catch{}

  lifecycle.listen(window,'pagehide',save);
  localize();paint();

  return { layoutLabels, project, reset, update: localize, get moving(){return pointers.size>0&&dragged;}, get state(){return {...camera};} };
}
