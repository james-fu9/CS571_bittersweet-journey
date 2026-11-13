import { useState } from 'react';
import worldLand from './data/world-land.json';
import './guide-map.css';

const project = ([longitude, latitude]) => [(longitude + 180) * 2.5, (90 - latitude) * 2.5];
const land = worldLand.map(ring => ring.map((point, index) => {
  const [x, y] = project(point);
  return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
}).join('') + 'Z').join('');
const scales = [650, 230, 90];

export default function GuideMap({ chapter, language, section }) {
  const [zoom, setZoom] = useState({ section, factor: 1 });
  const factor = zoom.section === section ? zoom.factor : 1;
  const width = Math.max(35, Math.min(900, scales[section] * factor));
  const height = width * 0.65;
  const [x, y] = project(chapter.coordinate);
  const left = Math.max(0, Math.min(900 - width, x - width / 2));
  const top = Math.max(-30, Math.min(450 - height + 30, y - height / 2));
  const radius = width * 0.012;
  const zh = language === 'zh';
  const title = chapter.title[language];
  function changeZoom(multiplier) {
    setZoom({ section, factor: Math.max(35 / scales[section], Math.min(900 / scales[section], factor * multiplier)) });
  }
  return <div className="guide-map">
    <svg viewBox={`${left} ${top} ${width} ${height}`} role="img" aria-label={zh ? `${title}的地理位置图` : `Location map for ${title}`}>
      <title>{title}</title>
      <desc>{zh ? '世界陆地轮廓和当前地点。此图用于文学地理导读。' : 'World land outlines and the selected location, for literary exploration.'}</desc>
      <path d={land} fill="#c9c8a6" stroke="#7e866b" strokeWidth={width * 0.0008} />
      <circle cx={x} cy={y} r={radius * 2.2} fill="#893f3220" />
      <circle cx={x} cy={y} r={radius} fill="#893f32" stroke="#f7efdf" strokeWidth={radius * 0.28} />
    </svg>
    <div className="guide-map-caption">
      <strong>{title}</strong>
      <span>{chapter.coordinate[1].toFixed(2)}° N · {chapter.coordinate[0].toFixed(2)}° E</span>
      <small>{zh ? '位置示意 · Natural Earth' : 'Location overview · Natural Earth'}</small>
    </div>
    <div className="guide-map-controls" aria-label={zh ? '地图控制' : 'Map controls'}>
      <button type="button" aria-label={zh ? '放大地点地图' : 'Zoom in on location map'} onClick={() => changeZoom(0.7)}>+</button>
      <button type="button" aria-label={zh ? '缩小地点地图' : 'Zoom out of location map'} onClick={() => changeZoom(1 / 0.7)}>−</button>
      <button type="button" onClick={() => setZoom({ section, factor: 1 })}>{zh ? '复位' : 'Reset view'}</button>
    </div>
  </div>;
}
