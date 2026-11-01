import { useEffect, useRef, useState } from 'react';
import GeographicScene from '../reader/GeographicScene';
import openingCopy from '../reader/openingCopy';
import '../reader/original.css';
import '../reader/reader.css';
import './onboarding.css';

function BookCover({ language }) {
  return <span className="book-cover"><small>{language === 'zh' ? '余秋雨' : 'YU QIUYU'}</small><strong>{language === 'zh' ? <>文化<br />苦旅</> : <>A Bittersweet<br />Journey Through<br />Culture</>}</strong></span>;
}

export default function Onboarding({ language, onLanguageChange, onBegin }) {
  const [step, setStep] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [portalPhase, setPortalPhase] = useState('');
  const [autoplay, setAutoplay] = useState(false);
  const heading = useRef(null);
  const chinese = language === 'zh';
  const copy = openingCopy[language];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!chosen) return;
    const timers = [
      setTimeout(() => setPortalPhase('is-centering'), 20),
      setTimeout(() => setPortalPhase('is-centering is-flipping'), 760),
      setTimeout(() => setPortalPhase('is-centering is-flipping is-filling'), 1650),
      setTimeout(() => { setStep(2); setPortalPhase('is-centering is-flipping is-filling is-leaving'); }, 2450),
      setTimeout(() => { setChosen(null); setPortalPhase(''); }, 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [chosen]);

  useEffect(() => {
    if (!autoplay || chosen || step < 2 || step > 4) return;
    const timer = setTimeout(() => setStep(value => value + 1), [6500, 6000, 8500][step - 2]);
    return () => clearTimeout(timer);
  }, [autoplay, chosen, step]);

  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [step]);

  function chooseBook(nextLanguage) {
    onLanguageChange(nextLanguage);
    if (reduced) setStep(2);
    else setChosen(nextLanguage);
  }

  return <section className="hometown-experience onboarding-experience" data-language={language} aria-label={chinese ? '旅程序章' : 'Journey prologue'}>
    <section className={`journey ${chosen ? 'book-transitioning' : ''}`} data-step={step}>
      {step >= 3 && <div className="journey-map-wrap"><GeographicScene prologue language={language} scene={step < 5 ? 'yellow' : 'yangtze'} /></div>}
      <div className="journey-topline"><span className="prologue-label">{chinese ? '山河显影 · 序章' : 'LAND, MADE VISIBLE · PROLOGUE'}</span><button type="button" className="journey-skip" onClick={onBegin}>{chinese ? '跳过序章，开始阅读 ↗' : 'Skip prologue · Begin reading ↗'}</button></div>

      {step === 0 && <div className="opening-scene scene-question" aria-hidden="false">
        <h1 ref={heading} tabIndex={-1}>{chinese ? '你从哪里开始认识一片土地？' : 'Where do you begin to know a land?'}</h1>
        <div className="question-answers"><span>{chinese ? '从一张照片？' : 'From a photograph?'}</span><span>{chinese ? '从社交媒体？' : 'From social media?'}</span><span>{chinese ? '从一次旅程？' : 'From a journey?'}</span><span>{chinese ? '从他人的记忆？' : 'From someone else’s memory?'}</span></div>
        <button className="opening-link" type="button" onClick={() => setStep(1)}><span className="opening-link-label">{chinese ? '或是，从一本书……' : 'Or, from a book…'}</span><span className="arrow-trail" aria-hidden="true"><i>›</i><i>›</i><i>›</i></span></button>
      </div>}

      {step === 1 && <div className={`opening-scene scene-books ${chosen ? 'is-choosing' : ''}`} aria-hidden="false">
        <h1 className="sr-only" ref={heading} tabIndex={-1}>{chinese ? '选择阅读语言' : 'Choose your reading language'}</h1>
        <p className="author-intro">{chinese ? '余秋雨走过中国的江河、山川与古迹，追寻它们在岁月中承载的记忆。' : 'Yu Qiuyu journeys through China’s rivers, mountains, and ancient sites, tracing the memories they have carried through time.'}</p>
        <div className="book-choices" role="group" aria-label={chinese ? '选择阅读语言' : 'Choose reading language'}>{['en', 'zh'].map(edition => <button key={edition} className={`book-choice book-${edition} ${chosen ? chosen === edition ? 'is-chosen' : 'is-dismissed' : ''}`} type="button" disabled={Boolean(chosen)} onClick={() => chooseBook(edition)}><span className="book-shadow" aria-hidden="true" /><span className="book-pages" aria-hidden="true" /><BookCover language={edition} /><span className="book-caption">{edition === 'zh' ? '中文' : 'English'}</span></button>)}</div>
      </div>}

      {step >= 2 && <div key={step} className={`opening-scene scene-${['', '', 'lines', 'yellow', 'yellow-stories', 'yangtze'][step]}`} aria-hidden="false">
        <h1 className="sr-only" ref={heading} tabIndex={-1}>{[null, null, chinese ? '三条天地之线' : 'Three lines across the land', chinese ? '黄河' : 'The Yellow River', chinese ? '黄河的故事' : 'Stories along the Yellow River', chinese ? '长江' : 'The Yangtze River'][step]}</h1>
        {step === 2 && <div className="three-lines-quote"><p>{copy.linesQuote}</p><p>{copy.linesSecond}</p><p>{copy.linesThird}</p></div>}
        {step === 3 && <blockquote>{copy.yellowQuote}</blockquote>}
        {step === 4 && <div className="quote-stack"><blockquote>{copy.yellowBirth}</blockquote><blockquote>{copy.yellowThinkers}</blockquote></div>}
        {step === 5 && <div className="quote-stack yangtze-quote-stack"><blockquote>{copy.migration}</blockquote><blockquote>{copy.yangtzeQuote}</blockquote></div>}
        <button className="opening-action primary" type="button" onClick={step === 5 ? onBegin : () => setStep(value => value + 1)}>{step === 5 ? copy.enter : chinese ? '继续' : 'Continue'}<i aria-hidden="true">→</i></button>
      </div>}

      <div className="prologue-controls">
        {step > 0 && !chosen && <button type="button" onClick={() => setStep(value => Math.max(0, value - 1))}>{chinese ? '← 上一页' : '← Previous'}</button>}
        <div className="journey-progress" role="img" aria-label={chinese ? `序章第 ${step + 1} 页，共 6 页` : `Prologue ${step + 1} of 6`}>{Array.from({ length: 6 }, (_, index) => <i key={index} className={index <= step ? 'is-done' : ''} />)}</div>
        {step >= 2 && step < 5 && !reduced && <button type="button" aria-pressed={autoplay} onClick={() => setAutoplay(value => !value)}>{autoplay ? chinese ? '暂停自动播放' : 'Pause autoplay' : chinese ? '自动播放' : 'Autoplay'}</button>}
      </div>
      {chosen && <div className={`book-portal book-${chosen} book-portal-${chosen} ${portalPhase}`} aria-hidden="true"><span className="book-portal-paper" /><span className="book-portal-pages" /><span className="book-portal-leaf leaf-one" /><span className="book-portal-leaf leaf-two" /><BookCover language={chosen} /></div>}
    </section>
  </section>;
}
