import { lazy, Suspense, useEffect } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useJourney } from '../state/useJourney.js';
import { getChapter } from '../data/chapters.js';
import LanguageToggle from '../components/LanguageToggle.jsx';
import SoundToggle from '../components/SoundToggle.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { usePortraitGate } from '../components/usePortraitGate.js';
import SealsPage from '../features/seals/SealsPage.jsx';
import UnavailableChapter from '../features/reader/UnavailableChapter.jsx';

const Onboarding = lazy(() => import('../features/onboarding/Onboarding.jsx'));
const ChapterReader = lazy(() => import('../features/reader/ChapterReader.jsx'));
const AtlasPage = lazy(() => import('../features/atlas/AtlasPage.jsx'));

function ReaderRoute() {
  const { chapterId } = useParams();
  const journey = useJourney();
  const navigate = useNavigate();
  const chapter = getChapter(chapterId);
  if (!chapter) return <NotFound />;
  if (!chapter.implemented) return <UnavailableChapter chapter={chapter} language={journey.language} />;
  return <ChapterReader language={journey.language} completed={journey.completedChapterIds.includes(chapter.id)}
    onComplete={() => { journey.finishChapter(chapter.id); navigate('/atlas', { state: { collected: chapter.id } }); }}
    onBack={() => navigate('/atlas')} />;
}

function NotFound() {
  const { language } = useJourney();
  return <section className="page-sheet"><h1>{language === 'zh' ? '这条小径尚未通达' : 'This path is not on the map.'}</h1><Link className="primary-button" to="/atlas">{language === 'zh' ? '回到地图' : 'Return to atlas'}</Link></section>;
}

export default function App() {
  const journey = useJourney();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const zh = journey.language === 'zh';
  const portrait = usePortraitGate();
  useEffect(() => {
    if (portrait) document.getElementById('rotate-heading')?.focus();
    else document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [portrait]);
  useEffect(() => {
    document.documentElement.lang = zh ? 'zh-Hans' : 'en';
    const chapter = pathname.startsWith('/read/') ? getChapter(pathname.split('/')[2]) : null;
    document.title = `${chapter ? chapter.title[journey.language] + ' · ' : ''}Bittersweet Journey · 山河显影`;
  }, [zh, journey.language, pathname]);
  useEffect(() => {
    document.getElementById('main-content')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);
  function openChapter(id) {
    const chapter = getChapter(id);
    if (chapter) { journey.visitChapter(chapter.id); navigate(`/read/${chapter.folder}`); }
  }
  return <>
    <div className="app-shell" inert={portrait ? true : undefined} aria-hidden={portrait ? true : undefined}>
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>{zh ? '跳转到正文' : 'Skip to content'}</a>
    <header className="site-header">
      <Link className="site-wordmark" to={journey.onboardingComplete ? '/atlas' : '/intro'} aria-label={zh ? '山河显影首页' : 'Bittersweet Journey home'}>山河显影 <small>BITTERSWEET JOURNEY</small></Link>
      <nav className="site-nav" aria-label={zh ? '主导航' : 'Main navigation'}>
        <NavLink className="nav-link" to="/atlas">{zh ? '地图' : 'Atlas'}</NavLink>
        <NavLink className="nav-link seals-link" to="/seals">{zh ? '我的图章' : 'My seals'} <b data-testid="progress-count">{journey.completedChapterIds.length} / 9</b></NavLink>
        <SoundToggle language={journey.language} atlas={pathname === '/atlas'} />
        <LanguageToggle language={journey.language} onChange={journey.setLanguage} />
      </nav>
    </header>
    {!journey.storageAvailable && <p className="storage-notice" role="status">{zh ? '浏览器无法保存进度。你仍可阅读，进度会保留到本页关闭。' : 'Browser storage is unavailable. You can still read; progress will last until this page closes.'}</p>}
    <main id="main-content" tabIndex="-1">
      <ErrorBoundary key={pathname} language={journey.language}>
        <Suspense fallback={<div className="route-loading" role="status">{zh ? '正在展开山河…' : 'Unfolding the landscape…'}</div>}>
          <Routes>
            <Route path="/" element={<Navigate replace to={journey.onboardingComplete ? '/atlas' : '/intro'} />} />
            <Route path="/intro" element={<Onboarding language={journey.language} onLanguageChange={journey.setLanguage} onBegin={() => navigate('/read/my-hometown')} />} />
            <Route path="/read/:chapterId" element={<ReaderRoute />} />
            <Route path="/atlas" element={<AtlasPage language={journey.language} completedChapterIds={journey.completedChapterIds} onSelectChapter={openChapter} />} />
            <Route path="/seals" element={<SealsPage />} />
            <Route path="/credits" element={<SealsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </main>
    <footer className="site-footer"><span>{zh ? '原著：余秋雨 · 英译：CN Times Books 团队' : 'Text: Yu Qiuyu · Translation: CN Times Books team'}</span><a href="https://github.com/esstherc/bittersweet-journey" target="_blank" rel="noreferrer">{zh ? '项目作者：Yanbing Chen and Ganrong(James) Fu' : 'Project authors: Yanbing Chen and Ganrong(James) Fu'}</a><a href="https://github.com/james-fu9/CS571_bittersweet-journey" target="_blank" rel="noreferrer">CS571 · {zh ? '源代码' : 'Source'}</a></footer>
    </div>
    <div className="rotate-gate" role="note" aria-label={zh ? '请横屏浏览' : 'Please rotate your device'}><span className="rotate-icon" aria-hidden="true">↻</span><h2 id="rotate-heading" tabIndex="-1">{zh ? '让山河展开' : 'Give the landscape room.'}</h2><p>{zh ? '请将手机横过来，继续阅读与探索。' : 'Turn your device sideways to read and explore.'}</p><LanguageToggle language={journey.language} onChange={journey.setLanguage} /></div>
  </>;
}
