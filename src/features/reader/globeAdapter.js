/* Offline orthographic 3D globe. Natural Earth coastlines from WORLD_LAND.
   Regional washes are literary geographic highlights, not political boundaries. */
export function mountGlobe(stage, worldLand) {
  const host = document.createElement('div');
  host.className = 'earth-scene';
  host.hidden = true;
  host.innerHTML = '<div class="earth-orb"><canvas role="img"></canvas><svg viewBox="0 0 600 600" aria-hidden="true"></svg></div><aside class="earth-context" aria-live="polite"></aside>';
  stage.append(host);
  const canvas = host.querySelector('canvas'), svg = host.querySelector('svg'), aside = host.querySelector('aside');
  function showFallback() {
    host.hidden = true;
    stage.classList.remove('has-earth');
    const land = stage.querySelector('[data-reader-globe-land]');
    if (land) land.setAttribute('d', (worldLand || []).map(ring => ring.map(([lon, lat], i) => `${i ? 'L' : 'M'}${170 + (lon + 180) / 360 * 860},${150 + (90 - lat) / 180 * 430}`).join('') + 'Z').join(''));
  }
  const gl = canvas.getContext('webgl', {alpha:true, antialias:true});
  if (!gl) {
    // Retain a readable offline world map on devices without WebGL.
    showFallback();
    host.remove(); return { set() {}, destroy() {} };
  }
  const vertex = 'attribute vec2 a; varying vec2 p; void main(){p=a;gl_Position=vec4(a,0.,1.);}';
  const fragment = `precision highp float;
    varying vec2 p; uniform sampler2D map; uniform float longitude; uniform float mode;
    const float PI=3.14159265359;
    float wash(vec2 at,vec2 centre,vec2 size){return 1.-smoothstep(.65,1.,length((at-centre)/size));}
    void main(){
      vec2 q=p/0.82; float r=dot(q,q); if(r>1.)discard;
      vec3 n=vec3(q,sqrt(1.-r)); float tilt=.38;
      vec3 globe=vec3(n.x,n.y*cos(tilt)+n.z*sin(tilt),n.z*cos(tilt)-n.y*sin(tilt));
      float lon=atan(globe.x,globe.z)+longitude; float lat=asin(globe.y);
      vec2 uv=vec2(fract(lon/(2.*PI)+.5),.5-lat/PI);
      vec4 tex=texture2D(map,uv); vec3 color=tex.rgb;
      vec2 geo=vec2((uv.x-.5)*360.,lat*180./PI);
      if(mode>0.5){
        float land=step(.5,tex.a);
        float eurasia=land*wash(geo,vec2(72.,49.),vec2(100.,44.));
        color=mix(color,vec3(.68,.57,.34),eurasia*.48);
        float china=land*wash(geo,vec2(106.,34.),vec2(17.,13.));
        color=mix(color,vec3(.57,.23,.18),china*.52);
        if(mode>1.5){
          color=mix(color,vec3(.24,.47,.51),wash(geo,vec2(147.,26.),vec2(20.,28.))*(1.-land)*.72);
          color=mix(color,vec3(.72,.47,.20),wash(geo,vec2(88.,42.),vec2(17.,8.))*land*.8);
          color=mix(color,vec3(.44,.43,.30),wash(geo,vec2(86.,31.),vec2(14.,7.))*land*.8);
        }
      }
      float light=.64+.36*max(0.,dot(n,normalize(vec3(-.5,.55,1.))));
      float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
      color=color*light+(grain-.5)*.018;
      gl_FragColor=vec4(color,1.-smoothstep(.993,1.,r));
    }`;
  function shader(type, source) { const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s; }
  const vertexShader=shader(gl.VERTEX_SHADER,vertex), fragmentShader=shader(gl.FRAGMENT_SHADER,fragment);
  const program=gl.createProgram();gl.attachShader(program,vertexShader);gl.attachShader(program,fragmentShader);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const attr=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const texture=document.createElement('canvas');texture.width=2048;texture.height=1024;
  const ctx=texture.getContext('2d');
  // Alpha encodes land; ocean RGB is supplied after drawing the land mask.
  ctx.fillStyle='#d8c7a4';ctx.strokeStyle='#827c62';ctx.lineWidth=1;
  const point=([lon,lat])=>[(lon+180)/360*2048,(90-lat)/180*1024];
  for(const ring of worldLand||[]){ctx.beginPath();ring.forEach((c,i)=>{const [x,y]=point(c);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.closePath();ctx.fill();ctx.stroke();}
  const pixels=ctx.getImageData(0,0,2048,1024);
  for(let i=0;i<pixels.data.length;i+=4)if(pixels.data[i+3]<128){pixels.data[i]=122;pixels.data[i+1]=158;pixels.data[i+2]=158;pixels.data[i+3]=0;}
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,2048,1024,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels.data);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const uLon=gl.getUniformLocation(program,'longitude'),uMode=gl.getUniformLocation(program,'mode');
  const copy={
    zh:{earth:'山河大地',intro:'路，就是书。',ratio:'海洋与陆地',ocean:'海洋',land:'陆地',eurasia:'欧亚大陆',china:'中国',pacific:'太平洋 · 东部',desert:'西北沙漠',plateau:'青藏高原 · 西至西南',largest:'最大的陆块：欧亚大陆',east:'中国位于欧亚大陆东部',enclosed:'山隔海围',dialogue:'文明之间的对话',nomadic:'游牧',agrarian:'农耕',maritime:'海洋'},
    en:{earth:'Mountains and rivers',intro:'The road is the book.',ratio:'Ocean and land',ocean:'Ocean',land:'Land',eurasia:'Eurasia',china:'China',pacific:'Pacific · east',desert:'Northwestern deserts',plateau:'Tibetan Plateau · west / southwest',largest:'The largest landmass: Eurasia',east:'China, in eastern Eurasia',enclosed:'Mountains and sea',dialogue:'A dialogue of civilizations',nomadic:'Nomadic',agrarian:'Agrarian',maritime:'Maritime'}
  };
  let scene='earth',language='en',angle=105*Math.PI/180,last=0,frame=0,labels=[];
  let contextLost = false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function set(next,lang){
    if (contextLost) { showFallback(); return; }
    const visible=['earth','eurasia','sealed','earth-return'].includes(next);
    host.hidden=!visible;stage.classList.toggle('has-earth',visible);
    if(!visible){cancelAnimationFrame(frame);frame=0;last=0;return;}
    if(scene!==next||language!==lang||!aside.childNodes.length){
      scene=next;language=lang;const c=copy[lang]||copy.en;host.dataset.scene=scene;
      canvas.setAttribute('aria-label',`${c.earth}: ${scene==='earth'?c.intro:c.largest}`);
      const ratio=`<h2>${c.ratio}</h2><div class="earth-fractions"><span><b>7/10</b>${c.ocean}</span><span><b>3/10</b>${c.land}</span></div><div class="earth-ratio" role="img" aria-label="${c.ocean} 70%, ${c.land} 30%">${Array.from({length:10},(_,i)=>`<i class="${i<7?'water':'land'}"></i>`).join('')}</div>`;
      aside.innerHTML=scene==='earth'?`<h2>${c.earth}</h2><p>${c.intro}</p>`:scene==='earth-return'?`<h2>${c.dialogue}</h2><ul class="civilization-list"><li>${c.nomadic}</li><li>${c.agrarian}</li><li>${c.maritime}</li></ul>`:ratio+`<p class="earth-landmass">${c.largest}</p><p>${c.east}</p>`+(scene==='sealed'?`<h3>${c.enclosed}</h3><ul><li>${c.pacific}</li><li>${c.desert}</li><li>${c.plateau}</li></ul>`:'');
      labels=scene==='eurasia'?[[65,52,c.eurasia,-55,-40],[110,34,c.china,65,20]]:scene==='sealed'?[[145,23,c.pacific,12,65],[87,43,c.desert,-55,-65],[86,30,c.plateau,-45,80],[112,34,c.china,55,-25]]:[];
      svg.innerHTML=labels.map(()=>'<g><path/><circle r="3"/><text/></g>').join('');
    }
    if(!frame)frame=requestAnimationFrame(draw);
  }
  function draw(now){
    frame=0;if(contextLost||host.hidden||document.hidden){last=0;return;}
    const dt=last?Math.min(.08,(now-last)/1000):0;last=now;
    const rotating=scene==='earth'||scene==='earth-return';
    if(rotating&&!reduced.matches)angle+=dt*.035;
    else {const target=108*Math.PI/180;const delta=Math.atan2(Math.sin(target-angle),Math.cos(target-angle));angle+=delta*(reduced.matches?1:Math.min(1,dt*2.5));}
    const size=Math.max(1,Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,2)));if(canvas.width!==size){canvas.width=canvas.height=size;gl.viewport(0,0,size,size);}
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(uLon,angle);gl.uniform1f(uMode,scene==='sealed'?2:scene==='eurasia'?1:0);gl.drawArrays(gl.TRIANGLES,0,6);
    labels.forEach(([lon,lat,text,dx,dy],i)=>{
      const a=lon*Math.PI/180-angle,b=lat*Math.PI/180,x=Math.cos(b)*Math.sin(a),y=Math.sin(b)*Math.cos(.38)-Math.cos(b)*Math.cos(a)*Math.sin(.38),z=Math.sin(b)*Math.sin(.38)+Math.cos(b)*Math.cos(a)*Math.cos(.38);
      const g=svg.children[i];g.style.opacity=z>.1?'1':'0';const px=300+x*246,py=300-y*246,tx=Math.max(60,Math.min(540,px+dx)),ty=py+dy;
      g.children[0].setAttribute('d',`M${px},${py}L${tx},${ty}`);g.children[1].setAttribute('cx',px);g.children[1].setAttribute('cy',py);g.children[2].setAttribute('x',tx);g.children[2].setAttribute('y',ty-7);g.children[2].textContent=text;
    });
    if(!reduced.matches)frame=requestAnimationFrame(draw);
  }
  const observer = new ResizeObserver(()=>{if(!host.hidden&&!frame)frame=requestAnimationFrame(draw);});
  observer.observe(canvas);
  const onVisibility=()=>{if(!document.hidden&&!host.hidden&&!frame)frame=requestAnimationFrame(draw);};
  document.addEventListener('visibilitychange',onVisibility);
  const onContextLost = event => {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    frame = 0;
    showFallback();
  };
  // Keep the readable SVG for this mount even if the GPU later recovers. A new
  // reader visit creates fresh resources instead of reusing invalid GL handles.
  const onContextRestored = () => { if (contextLost) showFallback(); };
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  return { set, destroy() {
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    canvas.removeEventListener('webglcontextrestored', onContextRestored);
    if (!contextLost) {
      gl.deleteTexture(tex); gl.deleteBuffer(buffer); gl.deleteProgram(program);
      gl.deleteShader(vertexShader); gl.deleteShader(fragmentShader);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    host.remove(); stage.classList.remove('has-earth');
  } };
}
