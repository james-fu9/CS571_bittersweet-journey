import { useJourney } from '../state/useJourney.js';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { chapters } from '../data/chapters.js';

// First independently deployable milestone. Replaced by the routed atlas integration.
export default function App() {
  const { language, setLanguage } = useJourney();
  const zh = language === 'zh';
  return <>
    <header className="site-header"><span className="site-wordmark">山河显影 <small>BITTERSWEET JOURNEY</small></span><LanguageToggle language={language} onChange={setLanguage} /></header>
    <main className="page-sheet" id="main-content">
      <p className="eyebrow">CS571 · AN INTERACTIVE LITERARY ATLAS</p>
      <h1>{zh ? '从山河出发' : 'Begin with the land.'}</h1>
      <p>{zh ? '沿着九个地点，展开一段文学旅程。React 阅读与地图体验正在迁移中。' : 'Nine places, connected through literature. The React reading and atlas experiences are being migrated.'}</p>
      <ol className="chapter-directory">{chapters.map(chapter => <li key={chapter.id}><span className="chapter-number">{String(chapter.number).padStart(2, '0')}</span><span>{chapter.title[language]}</span></li>)}</ol>
      <p className="fine-print">{zh ? '本版本支持中英切换并保存语言偏好。' : 'This first deployment supports Chinese / English and saves your language preference.'}</p>
    </main>
  </>;
}
