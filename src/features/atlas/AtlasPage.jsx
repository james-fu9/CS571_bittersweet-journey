import { useEffect, useRef, useState } from 'react';
import { chapters } from '../../data/chapters';
import { mountAtlas } from './atlasEngineAdapter';
import './atlas-original.css';
import './atlas-react.css';

export default function AtlasPage({ language, completedChapterIds, onSelectChapter }) {
  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [traveling, setTraveling] = useState(false);
  const panelRef = useRef(null);
  const zh = language === 'zh';
  const active = chapters.find(chapter => chapter.id === selected);

  useEffect(() => {
    const engine = mountAtlas(rootRef.current);
    engineRef.current = engine;
    return () => { engine.destroy(); engineRef.current = null; };
  }, []);

  useEffect(() => {
    engineRef.current?.update({ language, completedChapterIds, onSelectChapter: setSelected });
  }, [language, completedChapterIds]);

  useEffect(() => {
    engineRef.current?.select(selected);
    if (selected) panelRef.current?.focus({ preventScroll: true });
  }, [selected, guideOpen]);

  async function enterChapter() {
    if (!active || traveling) return;
    setTraveling(true);
    const arrived = await engineRef.current?.travelTo(active.id);
    if (arrived) onSelectChapter(active.id);
    setTraveling(false);
  }

  return (
    <section ref={rootRef} className="journey-atlas" data-language={language} aria-label={zh ? '山河地图' : 'Literary atlas'}>
      <div className="paper-noise" aria-hidden="true" />
      <div className="atlas-intro">
        <p className="atlas-eyebrow">{zh ? '九个地点 · 一段文化旅程' : 'NINE PLACES · ONE CULTURAL JOURNEY'}</p>
        <h1>{zh ? <>一部书能够<br /><span className="question-accent">照亮</span>多少中国？</> : <>How much of China<br />can one book <span className="question-accent">illuminate?</span></>}</h1>
        <button className="atlas-guide-toggle" type="button" aria-expanded={guideOpen} onClick={() => setGuideOpen(!guideOpen)}>{zh ? '如何探索' : 'How to explore'} {guideOpen ? '−' : '+'}</button>
        {guideOpen && <div className="cta-callout"><span className="cta-text"><strong>{zh ? '提灯寻路，让山河慢慢亮起' : 'Follow the lantern. Let the landscape unfold.'}</strong><em>{zh ? '拖动地图探索，滚轮或双指缩放。选择地点，打开章节。键盘可用方向键、加减键和 Home 键操作地图。' : 'Drag to explore; scroll or pinch to zoom. Select a place to open its chapter. On the map, use arrow keys, +/− and Home.'}</em><small>{zh ? '完成章节后，印章与光圈会留在地图上。' : 'Complete a chapter to leave its seal and a circle of light.'}</small></span></div>}
      </div>
      <div className="atlas-map-stage" aria-label={zh ? '可拖动及缩放的地图' : 'Pannable and zoomable map'} />
      <details className="atlas-chapter-index">
        <summary>{zh ? '所有地点' : 'All locations'} <span>09</span></summary>
        <ol>{chapters.map(chapter => <li key={chapter.id}><button type="button" onClick={() => setSelected(chapter.id)} aria-pressed={selected === chapter.id}><span>{String(chapter.number).padStart(2, '0')}</span>{chapter.title[language]}{completedChapterIds.includes(chapter.id) && <span aria-label={zh ? '已完成' : 'Completed'}>✓</span>}</button></li>)}</ol>
      </details>
      {active && <aside className="atlas-location-panel" ref={panelRef} tabIndex={-1} aria-labelledby="location-title" onKeyDown={event => { if (event.key === 'Escape') setSelected(null); }}>
        <button className="atlas-panel-close" type="button" onClick={() => setSelected(null)} aria-label={zh ? '关闭地点详情' : 'Close location details'}>×</button>
        <p className="atlas-location-number">{zh ? '第' : 'CHAPTER '}{String(active.number).padStart(2, '0')}{zh ? '章' : ''}</p>
        <h2 id="location-title">{active.title[language]}</h2>
        <p>{active.implemented ? (zh ? '沿黄河、长江与雨的痕迹，重新认识这片土地。' : 'Follow the Yellow River, the Yangtze, and the traces of rain to see this land anew.') : (zh ? '这个地点的阅读体验将在下一阶段开放。' : 'This chapter’s reading experience is coming in the next milestone.')}</p>
        {completedChapterIds.includes(active.id) && <p className="atlas-completed-note">{zh ? '印章已收藏' : 'Seal collected'}</p>}
        <button type="button" className="atlas-enter" onClick={enterChapter} disabled={traveling}>{traveling ? (zh ? '旅人正赶往这一章…' : 'On our way…') : active.implemented ? (zh ? '沿三条线进入' : 'Follow the three lines') : (zh ? '查看章节进度' : 'View chapter status')} <span aria-hidden="true">↗</span></button>
      </aside>}
      <p className="atlas-legend">{zh ? '文学坐标 · 地理线索' : 'Literary places · Geographic traces'}</p>
    </section>
  );
}
