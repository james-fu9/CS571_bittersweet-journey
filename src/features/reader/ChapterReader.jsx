import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import hometown from '../../data/hometown';
import sections from './sections';
import GeographicScene from './GeographicScene';
import './original.css';
import './reader.css';

function paragraphScene(section, paragraph, total) {
  if (section === 0) return 'earth';
  if (section === 1) return paragraph < 2 ? 'eurasia' : paragraph < 4 ? 'sealed' : 'climate';
  if (section === 2) return paragraph < 2 ? 'lines' : ['yellow', 'southward', 'yangtze'][paragraph - 2] || 'boundary';
  if (section === 3) return 'borderlands';
  return paragraph >= total - 2 ? 'earth-return' : 'ocean';
}

function sectionScrollTop(root, index) {
  if (index === 0) return 0;
  const heading = root.querySelector(`[data-section-heading="${index}"]`);
  const inset = Math.min(28, root.clientHeight * 0.25);
  return root.scrollTop + heading.getBoundingClientRect().top - root.getBoundingClientRect().top - inset;
}

function alignToSection(root, index) {
  const top = sectionScrollTop(root, index);
  root.scrollTo({ top, behavior: 'instant' });
  return { index, top };
}

export default function ChapterReader({ language, completed, savedSection, visitedSections, onSectionChange, paused, onComplete, onBack }) {
  const chinese = language === 'zh';
  const data = hometown[language];
  const [active, setActive] = useState(savedSection ?? 0);
  const [scene, setScene] = useState(() => paragraphScene(active, 0, data.sections[active].paragraphs.length));
  const [atEnd, setAtEnd] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const scroll = useRef(null);
  const alignedHeading = useRef(null);
  const currentSection = useRef(active);
  const completionStarted = useRef(false);
  const visitCount = visitedSections.length;
  const totalSections = data.sections.length;

  useLayoutEffect(() => {
    if (paused) return;
    const root = scroll.current;
    let positioned = false;
    const update = () => {
      if (!positioned || !root.clientHeight) return;
      // Rotation and font swaps can rewrap every preceding paragraph after
      // the viewport has resized. Keep the selected heading at its inset until
      // the reader actually scrolls away from it.
      const alignment = alignedHeading.current;
      if (alignment) {
        const top = sectionScrollTop(root, alignment.index);
        if (Math.abs(top - alignment.top) > 1) {
          alignedHeading.current = alignToSection(root, alignment.index);
        } else if (Math.abs(root.scrollTop - alignment.top) > 1) {
          alignedHeading.current = null;
        }
      }
      const anchor = root.getBoundingClientRect().top + root.clientHeight * 0.43;
      // A short landscape viewport may show the new section heading while its
      // first paragraph is still below the anchor. Resolve the section from its
      // heading first, then choose a paragraph only inside that section.
      let section = 0;
      for (const heading of root.querySelectorAll('[data-section-heading]')) {
        if (heading.getBoundingClientRect().top <= anchor) section = Number(heading.dataset.sectionHeading);
        else break;
      }
      const paragraphs = [...root.querySelectorAll(`[data-section="${section}"][data-paragraph]`)];
      let paragraph = paragraphs[0];
      for (const candidate of paragraphs) {
        if (candidate.getBoundingClientRect().top <= anchor) paragraph = candidate;
        else break;
      }
      if (!paragraph) return;
      const index = Number(paragraph.dataset.paragraph);
      if (currentSection.current !== section) {
        currentSection.current = section;
        onSectionChange(section);
      }
      setActive(section);
      setScene(paragraphScene(section, index, data.sections[section].paragraphs.length));
      setAtEnd(root.scrollTop + root.clientHeight >= root.scrollHeight - 18);
    };
    // Measure only after the stored section is in view. This also protects the
    // bookmark when a phone opens the reader behind the portrait overlay.
    const position = () => {
      if (!root.clientHeight) return;
      alignedHeading.current = alignToSection(root, currentSection.current);
      positioned = true;
      onSectionChange(currentSection.current);
      update();
    };
    position();
    // Save a scroll transition during its event, so immediately leaving for
    // the atlas cannot cancel a pending animation-frame bookmark update.
    root.addEventListener('scroll', update, { passive: true });
    const releaseHeading = () => { alignedHeading.current = null; };
    const inputEvents = ['wheel', 'pointerdown', 'keydown'];
    for (const event of inputEvents) root.addEventListener(event, releaseHeading, { passive: true });
    const observer = new ResizeObserver(() => {
      if (positioned) update();
      else position();
    });
    observer.observe(root);
    observer.observe(root.querySelector('.reading-copy'));
    return () => {
      root.removeEventListener('scroll', update);
      for (const event of inputEvents) root.removeEventListener(event, releaseHeading);
      observer.disconnect();
    };
  }, [data, onSectionChange, paused]);

  useEffect(() => {
    if (!celebrating) return;
    const timeout = setTimeout(onBack, matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 1400);
    return () => clearTimeout(timeout);
  }, [celebrating, onBack]);

  function finishReading() {
    if (completionStarted.current) return;
    if (completed) {
      onBack();
      return;
    }
    if (visitCount < totalSections || !atEnd) return;
    completionStarted.current = true;
    onComplete();
    setCelebrating(true);
  }

  function goToSection(index) {
    const root = scroll.current;
    currentSection.current = index;
    onSectionChange(index);
    setActive(index);
    alignedHeading.current = alignToSection(root, index);
    root.focus({ preventScroll: true });
  }

  return <section className="hometown-experience hometown-reader is-open" data-language={language} aria-label={data.title}>
    <div className="hometown-reading-grid">
      <section className="reader-geography-column" aria-label={chinese ? '互动地理' : 'Interactive geography'}>
        <GeographicScene language={language} scene={scene} />
        <p className="map-reading-hint">{chinese ? '地图随阅读展开 · 选择节次继续旅程' : 'The landscape follows your reading · Choose a section to continue'}</p>
      </section>
      <article className="reader-panel">
        <div className="reader-scroll" ref={scroll} tabIndex={0} aria-label={chinese ? '章节正文，滚动阅读' : 'Chapter text, scroll to read'}>
          <div className="reader-chapter-heading"><p>{chinese ? '第 03 章 · 余秋雨' : 'CHAPTER 03 · YU QIUYU'}</p><h1>{data.title}</h1></div>
          <div className="reading-copy">
            {data.sections.map((section, sectionIndex) => <section key={`${language}-${sectionIndex}`} className="reading-section" aria-labelledby={`section-${sectionIndex}`}>
              <header className="reader-header" data-section-heading={sectionIndex}><h2 className="reader-section-label" id={`section-${sectionIndex}`}>{sections[language][sectionIndex].label}</h2></header>
              <div className="reader-rule" aria-hidden="true" />
              <div className="reading-section-body">{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} data-section={sectionIndex} data-paragraph={paragraphIndex} className={/^[一二三四五六七八九十〇○]/.test(paragraph) ? 'no-dropcap' : undefined}>{paragraph}</p>)}</div>
            </section>)}
          </div>
          <div className="reader-end">
            <img className="reader-seal" src={`${import.meta.env.BASE_URL}assets/reader/seal-my-hometown.svg`} alt={chinese ? '我的山河印章' : 'My Hometown seal'} />
            <p>{chinese ? '三条线留下了山河的底色。' : 'Three lines leave their trace upon the land.'}</p>
            <button className="finish-chapter" type="button" disabled={celebrating || (!completed && (visitCount < totalSections || !atEnd))} onClick={finishReading}>
              {completed ? (chinese ? '已收集印章 · 返回总图' : 'Seal collected · Return to atlas') : (chinese ? '完成本章 · 收集印章' : 'Complete chapter · Collect seal')} <span aria-hidden="true">→</span>
            </button>
            {!completed && visitCount < totalSections && <p className="reader-completion-hint">{chinese ? `已阅读 ${visitCount}/${totalSections} 节，请通过下方节次阅读其余部分。` : `${visitCount}/${totalSections} sections visited. Use the section buttons below to read the remaining sections.`}</p>}
          </div>
        </div>
        <nav className="section-rail" aria-label={chinese ? '章节段落' : 'Chapter sections'}>
          <span className="rail-caption">{chinese ? '原文章节' : 'Sections'}</span>
          <div className="section-buttons">{data.sections.map((section, index) => <button key={section.label} type="button" className="section-button" aria-label={chinese ? `第 ${index + 1} 节` : `Section ${index + 1}`} aria-current={active === index ? 'step' : undefined} onClick={() => goToSection(index)}>{index + 1}</button>)}</div>
          <span className="rail-line" aria-hidden="true"><i style={{ width: `${(active + 1) * 20}%` }} /></span>
        </nav>
      </article>
    </div>
    <footer className="reader-footer">
      <button type="button" onClick={onBack}>← {chinese ? '总地图' : 'Atlas'}</button>
      <span>{chinese ? '文本：余秋雨《文化苦旅》' : 'Text: Yu Qiuyu · English: CN Times Books team'}</span>
      <button type="button" aria-expanded={sourcesOpen} onClick={() => setSourcesOpen(value => !value)}>{chinese ? '数据来源' : 'Data sources'}</button>
    </footer>
    {sourcesOpen && <div className="reader-source-panel" role="region" aria-label={chinese ? '数据来源' : 'Data sources'}>
      <button type="button" onClick={() => setSourcesOpen(false)} aria-label={chinese ? '关闭数据来源' : 'Close data sources'}>×</button>
      <h2>{chinese ? '地图与文本' : 'Map and text'}</h2>
      <p>{chinese ? '余秋雨《我的山河》及 CN Times Books 英文译文。项目作者：Yanbing Chen and Ganrong(James) Fu。' : 'My Hometown by Yu Qiuyu; English translation by the CN Times Books team. Project authors: Yanbing Chen and Ganrong(James) Fu.'}</p>
      <p><a href="https://www.naturalearthdata.com/">Natural Earth</a> · <a href="https://www.worldclim.org/data/worldclim21.html">WorldClim 2.1 BIO12, 1970–2000</a> · <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors, ODbL</a></p>
      <p>{chinese ? '400 毫米线是多年平均降水量等值线，并非每年固定的边界。地图用于文学探索，不用于导航。' : 'The 400 mm line is a long-term average rainfall contour, not a fixed annual boundary. This literary map is not a navigation tool.'}</p>
    </div>}
    {celebrating && <div className="reader-celebration" role="status" aria-live="polite"><img src={`${import.meta.env.BASE_URL}assets/reader/seal-my-hometown.svg`} alt="" /><p>{chinese ? '一处山河已经显影' : 'One landscape brought to light'}</p></div>}
  </section>;
}
