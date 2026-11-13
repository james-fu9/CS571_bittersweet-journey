import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import GuideMap from './GuideMap';
import './original.css';
import './reader.css';
import './guide.css';

function headingTop(pane, index) {
  if (index === 0) return 0;
  const heading = pane.querySelector(`[data-section-heading="${index}"]`);
  const inset = Math.min(28, pane.clientHeight * 0.25);
  return pane.scrollTop + heading.getBoundingClientRect().top - pane.getBoundingClientRect().top - inset;
}

function alignHeading(pane, index) {
  const top = headingTop(pane, index);
  pane.scrollTo({ top, behavior: 'instant' });
  return { index, top };
}

/** A chapter-specific guide with a location map and saved reading state. */
export default function GuideReader({
  chapter, guide, language, completed, savedSection, visitedSections,
  onSectionChange, onComplete, onBack, paused,
}) {
  const totalSections = guide.sections.length;
  const validSavedSection = Number.isInteger(savedSection) && savedSection >= 0 && savedSection < totalSections;
  const [active, setActive] = useState(validSavedSection ? savedSection : 0);
  const [atEnd, setAtEnd] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const pane = useRef(null);
  const currentSection = useRef(active);
  const aligned = useRef(null);
  const completionStarted = useRef(false);
  const chinese = language === 'zh';
  const section = guide.sections[active];
  const visitCount = visitedSections.length;
  const seal = `${import.meta.env.BASE_URL}${chapter.sealPath}`;

  useLayoutEffect(() => {
    if (paused) return;
    const root = pane.current;
    let positioned = false;
    function update() {
      if (!positioned || !root.clientHeight) return;
      const alignment = aligned.current;
      if (alignment) {
        const top = headingTop(root, alignment.index);
        if (Math.abs(top - alignment.top) > 1) {
          aligned.current = alignHeading(root, alignment.index);
        } else if (Math.abs(root.scrollTop - alignment.top) > 1) {
          aligned.current = null;
        }
      }
      const anchor = root.getBoundingClientRect().top + root.clientHeight * 0.43;
      let index = 0;
      for (const heading of root.querySelectorAll('[data-section-heading]')) {
        if (heading.getBoundingClientRect().top > anchor) break;
        index = Number(heading.dataset.sectionHeading);
      }
      if (currentSection.current !== index) {
        currentSection.current = index;
        onSectionChange(index);
      }
      setActive(index);
      setAtEnd(root.scrollTop + root.clientHeight >= root.scrollHeight - 18);
    }
    function position() {
      if (!root.clientHeight) return;
      aligned.current = alignHeading(root, currentSection.current);
      positioned = true;
      onSectionChange(currentSection.current);
      update();
    }
    position();
    root.addEventListener('scroll', update, { passive: true });
    const releaseAlignment = () => { aligned.current = null; };
    const inputEvents = ['wheel', 'pointerdown', 'keydown'];
    for (const event of inputEvents) root.addEventListener(event, releaseAlignment, { passive: true });
    const observer = new ResizeObserver(() => {
      if (positioned) update();
      else position();
    });
    observer.observe(root);
    observer.observe(root.querySelector('.guide-copy'));
    return () => {
      root.removeEventListener('scroll', update);
      for (const event of inputEvents) root.removeEventListener(event, releaseAlignment);
      observer.disconnect();
    };
  }, [guide, language, onSectionChange, paused]);

  useEffect(() => {
    if (!celebrating) return;
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 250 : 1400;
    const timer = setTimeout(onBack, delay);
    return () => clearTimeout(timer);
  }, [celebrating, onBack]);

  function selectSection(index) {
    currentSection.current = index;
    onSectionChange(index);
    setActive(index);
    aligned.current = alignHeading(pane.current, index);
    pane.current.focus({ preventScroll: true });
  }

  function collectSeal() {
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

  return <section className="hometown-experience guide-reader" data-language={language} aria-label={chapter.title[language]}>
    <div className="guide-grid">
      <figure className="guide-geography">
        <GuideMap chapter={chapter} language={language} section={active} />
        <figcaption>{section.title[language]}</figcaption>
      </figure>
      <article className="guide-panel">
        <div className="guide-scroll reader-scroll" ref={pane} tabIndex={0} aria-label={chinese ? '章节导读，滚动阅读' : 'Chapter guide, scroll to read'}>
          <header className="guide-heading">
            <p className="guide-kind">{chinese ? '项目原创导读' : 'Original project guide'}</p>
            <h1>{chapter.title[language]}</h1>
            {guide.intro?.[language] && <p>{guide.intro[language]}</p>}
            <p className="guide-attribution">{chinese ? '本导读由项目团队撰写，结合地点背景与阅读提示，陪伴你探索余秋雨《文化苦旅》。' : 'Written by the project team, this guide connects place, context and reading prompts for exploring Yu Qiuyu’s A Bittersweet Journey Through Culture.'}</p>
          </header>
          <div className="guide-copy reading-copy">
            {guide.sections.map((entry, index) => <section className="guide-section reading-section" key={entry.id} aria-labelledby={`${chapter.id}-section-${entry.id}`}>
              <h2 data-section-heading={index} id={`${chapter.id}-section-${entry.id}`}>{entry.title[language]}</h2>
              {entry.body[language].map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            </section>)}
          </div>
          <section className="guide-sources" aria-labelledby={`${chapter.id}-sources`}>
            <h2 id={`${chapter.id}-sources`}>{chinese ? '进一步探索' : 'Explore further'}</h2>
            <ul>{guide.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{typeof source.title === 'string' ? source.title : source.title[language]} <span aria-hidden="true">↗</span></a></li>)}</ul>
          </section>
          <div className="guide-end">
            <img src={seal} width="88" height="88" alt={chinese ? `${chapter.title.zh}图章` : `${chapter.title.en} seal`} />
            <button
              className="finish-chapter"
              type="button"
              disabled={celebrating || (!completed && (visitCount < totalSections || !atEnd))}
              onClick={collectSeal}
            >
              {completed ? (chinese ? '图章已收藏 · 返回地图' : 'Seal collected · Return to atlas') : (chinese ? '完成导读 · 收藏图章' : 'Complete guide · Collect seal')}
              <span aria-hidden="true">→</span>
            </button>
            {!completed && visitCount < totalSections && <p className="guide-completion-hint">{chinese ? `已浏览 ${visitCount}/${totalSections} 节，请阅读其余部分后收藏图章。` : `${visitCount}/${totalSections} sections visited. Read the remaining sections to collect this seal.`}</p>}
          </div>
        </div>
        <nav className="guide-section-controls section-rail" aria-label={chinese ? '导读节次' : 'Guide sections'}>
          <span>{chinese ? '节次' : 'Sections'}</span>
          <div className="section-buttons">{guide.sections.map((entry, index) => <button
            type="button"
            className="section-button"
            key={entry.id}
            aria-label={chinese ? `第 ${index + 1} 节` : `Section ${index + 1}`}
            aria-current={index === active ? 'step' : undefined}
            onClick={() => selectSection(index)}
          >{index + 1}</button>)}</div>
          <span className="guide-section-count" aria-hidden="true">{active + 1} / {totalSections}</span>
        </nav>
      </article>
    </div>
    <footer className="guide-footer">
      <button type="button" onClick={onBack}>← {chinese ? '返回地图' : 'Back to atlas'}</button>
      <span>{chinese ? '项目原创导读' : 'Original project guide'}</span>
    </footer>
    {celebrating && <div className="guide-celebration" role="status" aria-live="polite">
      <img src={seal} width="130" height="130" alt="" />
      <p>{chinese ? '图章已收藏' : 'Seal collected'}</p>
      <button type="button" onClick={onBack}>{chinese ? '返回地图' : 'Return to atlas'}</button>
    </div>}
  </section>;
}
