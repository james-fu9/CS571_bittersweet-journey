import { useEffect, useRef } from 'react';
import { mountBasemap } from './mountBasemap';
import { mountGlobe } from './globeAdapter';
import worldLand from './data/world-land.json';
import readerMarkup from './map.svg?raw';
import tourMarkup from '../onboarding/map.svg?raw';

const cameras = {
  earth: [120, 65, 960, 608], eurasia: [160, 100, 880, 557],
  sealed: [200, 126, 800, 507], climate: [225, 142, 750, 475],
  lines: [255, 155, 700, 443], yellow: [360, 235, 650, 412],
  southward: [450, 325, 650, 412], yangtze: [450, 325, 650, 412],
  boundary: [360, 118, 640, 405], borderlands: [360, 118, 640, 405],
  ocean: [255, 155, 700, 443], 'earth-return': [120, 65, 960, 608],
};

/** Owns the original SVG geography and WebGL globe inside a React effect. */
export default function GeographicScene({ language, scene = 'earth', prologue = false }) {
  const host = useRef(null);
  const controls = useRef(null);
  useEffect(() => {
    const root = host.current;
    root.innerHTML = prologue ? tourMarkup : readerMarkup;
    mountBasemap(root);
    const svg = root.querySelector('svg');
    const abort = new AbortController();
    let globe;
    if (!prologue) {
      try { globe = mountGlobe(root, worldLand); }
      catch {
        root.querySelector('.earth-scene')?.remove();
        root.classList.remove('has-earth');
        // Same Natural Earth coastline data provides the offline SVG fallback.
        root.querySelector('[data-reader-globe-land]')?.setAttribute('d', worldLand.map(ring => ring.map(([lon, lat], i) => `${i ? 'L' : 'M'}${170 + (lon + 180) / 360 * 860},${150 + (90 - lat) / 180 * 430}`).join('') + 'Z').join(''));
      }
    }
    let camera = prologue ? [46, 98, 944, 590] : [...cameras.earth];
    let drag;
    const apply = () => {
      svg.setAttribute('viewBox', camera.join(' '));
      svg.dataset.mapDetail = camera[2] < 760 ? '2' : '1';
    };
    const zoom = factor => {
      const width = Math.max(380, Math.min(1400, camera[2] * factor));
      const scale = width / camera[2];
      camera = [camera[0] + camera[2] * (1 - scale) / 2, camera[1] + camera[3] * (1 - scale) / 2, width, camera[3] * scale];
      apply();
    };
    const on = (name, fn, options = {}) => svg.addEventListener(name, fn, { ...options, signal: abort.signal });
    on('pointerdown', event => {
      if (event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, camera: [...camera] };
      svg.setPointerCapture(event.pointerId);
    });
    on('pointermove', event => {
      if (!drag) return;
      const box = svg.getBoundingClientRect();
      camera = [drag.camera[0] - (event.clientX - drag.x) * camera[2] / box.width, drag.camera[1] - (event.clientY - drag.y) * camera[3] / box.height, camera[2], camera[3]];
      apply();
    });
    on('pointerup', () => { drag = null; });
    on('pointercancel', () => { drag = null; });
    on('wheel', event => { event.preventDefault(); zoom(event.deltaY < 0 ? 0.86 : 1 / 0.86); }, { passive: false });
    controls.current = {
      zoom,
      reset() { camera = prologue ? [46, 98, 944, 590] : [...(cameras[svg.dataset.scene] || cameras.earth)]; apply(); },
      set(nextScene, nextLanguage) {
        svg.dataset.scene = nextScene;
        svg.querySelector('title')?.replaceChildren(nextLanguage === 'zh' ? '我的山河 · 三条天地之线' : 'My Hometown · Three lines across the land');
        svg.querySelector('desc')?.replaceChildren(nextLanguage === 'zh' ? '黄河、长江、珠江、四百毫米等降水量线与长城的文学地理图。' : 'A literary geography of the Yellow, Yangtze and Pearl rivers, the 400 mm rainfall contour, and the Great Wall.');
        const section = { earth: 0, eurasia: 1, sealed: 1, climate: 1, lines: 2, yellow: 2, southward: 2, yangtze: 2, boundary: 2, borderlands: 3, ocean: 4, 'earth-return': 4 }[nextScene] || 0;
        svg.dataset.section = section;
        for (const node of root.querySelectorAll('[data-map-en], [data-atlas-en]')) {
          node.textContent = node.dataset[nextLanguage === 'zh' ? (node.dataset.mapZh ? 'mapZh' : 'atlasZh') : (node.dataset.mapEn ? 'mapEn' : 'atlasEn')];
        }
        root.querySelector('[data-rain-label]')?.replaceChildren(nextLanguage === 'zh' ? '400 毫米等降水量线' : '400 mm isohyet');
        if (!prologue) camera = [...(cameras[nextScene] || cameras.earth)];
        globe?.set(nextScene, nextLanguage);
        apply();
      },
    };
    apply();
    return () => { abort.abort(); globe?.destroy(); controls.current = null; root.replaceChildren(); };
  }, [prologue]);

  useEffect(() => { controls.current?.set(scene, language); }, [scene, language, prologue]);

  return <div className={`geographic-scene ${prologue ? 'prologue-geography' : ''}`}>
    <div ref={host} className="map-stage geographic-art" role="group" aria-label={language === 'zh' ? '章节地理地图' : 'Chapter geographic map'} />
    {!prologue && !['earth', 'eurasia', 'sealed', 'earth-return'].includes(scene) && <div className="reader-map-tools" aria-label={language === 'zh' ? '地图控制' : 'Map controls'}>
      <button type="button" onClick={() => controls.current?.zoom(0.8)} aria-label={language === 'zh' ? '放大地图' : 'Zoom in on reader map'}>+</button>
      <button type="button" onClick={() => controls.current?.zoom(1.25)} aria-label={language === 'zh' ? '缩小地图' : 'Zoom out of reader map'}>−</button>
      <button type="button" onClick={() => controls.current?.reset()}>{language === 'zh' ? '复位' : 'Reset view'}</button>
    </div>}
  </div>;
}
