import template from './atlas-template.svg?raw';
import physical from './data/atlas-physical.json';
import geography from './data/real-geography.json';
import { chapters } from '../../data/chapters';
import { createLifecycle } from './lifecycle';
import { mountCamera } from './mountCamera';
import { mountJourney } from './mountJourney';
import { mountLabels } from './mountLabels';

const NS = 'http://www.w3.org/2000/svg';

function applyRealGeography(root) {
  const data = geography.global;
  root.querySelector('#global-yellow').setAttribute('d', data.major.yellow);
  root.querySelector('#global-yangtze').setAttribute('d', data.major.yangtze);
  const secondary = root.querySelector('#global-secondary-rivers');
  Object.entries(data.secondary).forEach(([name, path]) => {
    if (!path) return;
    const river = document.createElementNS(NS, 'path');
    river.dataset.river = name;
    river.setAttribute('d', path);
    secondary.append(river);
  });
  ['yellow', 'yangtze'].forEach(river => {
    ['cn', 'en'].forEach((language, index) => {
      const label = root.querySelector(`#global-${river}-label-${language}`);
      label.setAttribute('x', data.labels[river].x);
      label.setAttribute('y', data.labels[river].y + index * 15);
    });
  });
  const { kashgar, dunhuang, dujiangyan } = data.places;
  root.querySelector('.silk-road').setAttribute('d', `M${kashgar.x},${kashgar.y}C${kashgar.x + 64},${kashgar.y - 32} ${dunhuang.x - 65},${dunhuang.y + 10} ${dunhuang.x},${dunhuang.y}`);
  root.querySelector('.tea-road').setAttribute('d', `M${dujiangyan.x - 116},${dujiangyan.y + 96}C${dujiangyan.x - 78},${dujiangyan.y + 44} ${dujiangyan.x - 28},${dujiangyan.y + 28} ${dujiangyan.x},${dujiangyan.y}`);
}

/** Mount the original rendering engine inside one effect-owned DOM island. */
export function mountAtlas(root) {
  const stage = root.querySelector('.atlas-map-stage');
  // This is checked-in SVG from the original project, never user-supplied HTML.
  stage.innerHTML = template;
  const lifecycle = createLifecycle();
  const bus = new EventTarget();
  const state = { complete: {}, language: 'en' };
  let selectChapter = () => {};
  let disposed = false;
  const svg = root.querySelector('.china-map');
  const points = [...svg.querySelectorAll('.story-point')];
  applyRealGeography(root);
  const seals = Object.fromEntries(chapters.map(chapter => {
    const image = document.createElementNS(NS, 'image');
    image.setAttribute('href', `${import.meta.env.BASE_URL}${chapter.sealPath}`);
    image.setAttribute('class', 'chapter-seal');
    image.dataset.seal = chapter.id;
    root.querySelector('.chapter-seals').append(image);
    return [chapter.id, image];
  }));
  const camera = mountCamera(root, physical, lifecycle, bus);
  const scheduleLayout = mountLabels(root, state, seals, camera, lifecycle);
  const journey = mountJourney(root, camera, state, lifecycle, bus);
  function cameraChanged() {
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const scale = Math.hypot(matrix.a, matrix.b);
    points.forEach(group => {
      const core = group.querySelector('.point-core');
      core.style.r = `${(state.complete[group.dataset.story] ? 6 : 4) / scale}px`;
      core.style.strokeWidth = `${1.5 / scale}px`;
      group.querySelectorAll('.point-glow,.point-pulse,.point-orbit').forEach(node => {
        node.style.r = `${(node.classList.contains('point-glow') ? 23 : 10) / scale}px`;
      });
    });
    scheduleLayout();
  }
  lifecycle.listen(bus, 'camera-change', cameraChanged);
  lifecycle.resize(root, scheduleLayout);
  root.querySelectorAll('details').forEach(node => lifecycle.listen(node, 'toggle', scheduleLayout));
  points.forEach(point => {
    lifecycle.listen(point, 'click', () => selectChapter(point.dataset.story));
    lifecycle.listen(point, 'keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectChapter(point.dataset.story);
    });
  });
  cameraChanged();
  scheduleLayout();

  return {
    update({ language = 'en', completedChapterIds = [], onSelectChapter }) {
      if (disposed) return;
      state.language = language;
      selectChapter = onSelectChapter || (() => {});
      state.complete = Object.fromEntries(chapters.map(chapter => [chapter.id, completedChapterIds.includes(chapter.id)]));
      root.dataset.language = language;
      chapters.forEach(chapter => {
        root.classList.toggle(`${chapter.id}-complete`, state.complete[chapter.id]);
        const point = points.find(item => item.dataset.story === chapter.id);
        const clue = point.querySelector(`.point-clue.${state.complete[chapter.id] ? 'complete' : 'unread'}.${language === 'zh' ? 'cn' : 'en'}`)?.textContent || chapter.title[language];
        point.setAttribute('aria-label', `${String(chapter.number).padStart(2, '0')} ${clue} — ${chapter.title[language]}${state.complete[chapter.id] ? (language === 'zh' ? '，已完成' : ', completed') : ''}`);
        point.setAttribute('aria-pressed', String(root.dataset.selectedChapter === chapter.id));
      });
      camera.update();
      cameraChanged();
      bus.dispatchEvent(new Event('progress-change'));
    },
    select(id) {
      root.dataset.selectedChapter = id || '';
      points.forEach(point => point.setAttribute('aria-pressed', String(point.dataset.story === id)));
      scheduleLayout();
    },
    async travelTo(id) {
      if (disposed) return false;
      const point = points.find(item => item.dataset.story === id);
      return point && journey ? journey.travelTo(point) : Boolean(point);
    },
    destroy() {
      disposed = true;
      lifecycle.destroy();
      stage.replaceChildren();
      root.classList.remove('journey-ready', 'journey-mounted', 'journey-illuminated', 'is-journey-running', 'atlas-exploring');
      chapters.forEach(chapter => root.classList.remove(`${chapter.id}-complete`));
    },
  };
}
