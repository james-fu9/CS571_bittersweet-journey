import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJourney } from '../../state/useJourney.js';
import { chapters } from '../../data/chapters.js';
import './ending.css';

const scenes = [
  {
    en: ['A map made of reading', 'Nine places now carry a trace of your journey. Each seal records a moment when you stopped, looked and read. Together, they form a route that belongs to you.'],
    zh: ['读出来的地图', '九处地点留下了你的阅读痕迹。每一枚印章，都记录了一次停步、观察与阅读。它们连在一起，成为属于你的路线。'],
  },
  {
    en: ['Water shapes a place', 'Rivers connect mountains, fields and cities. At Dujiangyan, managing water becomes part of daily life. A landscape is also a record of the ways people learn to live with it.'],
    zh: ['水塑造地方', '河流连接山地、田野和城市。在都江堰，与水相处成为日常生活的一部分。风景也记录着人们如何学习在这里生活。'],
  },
  {
    en: ['Routes carry more than travelers', 'Caves, passes and oasis towns invite us to think about exchange. Along a route, ideas and objects can move, while their meanings change. Reading asks us to notice both the journey and its consequences.'],
    zh: ['路上传递的不只是旅人', '石窟、关隘与绿洲城镇，让我们思考交流。沿着道路，观念和物品不断移动，意义也随之变化。阅读让我们同时看见旅程与它的影响。'],
  },
  {
    en: ['Every view has a point of view', 'A palace garden and a lakeside lodge offer different ways of seeing. What enters the frame? What remains outside it? Carry these questions when you return to familiar places.'],
    zh: ['每一种观看都有立场', '山庄园林和湖畔小屋，提供了不同的观看方式。什么进入了画面？什么留在画面之外？回到熟悉的地方时，也请带上这些问题。'],
  },
  {
    en: ['Take the next step', 'Your seals will stay in this browser. Revisit a chapter, follow a question, or open the book that inspired this map. The next journey starts with your own attention.'],
    zh: ['继续走下去', '你的印章会保存在当前浏览器中。重读一章，追问一个问题，或翻开启发这张地图的书。下一段旅程，从你的关注开始。'],
  },
];

export default function EndingPage() {
  const { language, completedChapterIds, creditsUnlocked, storageAvailable } = useJourney();
  const [index, setIndex] = useState(0);
  const zh = language === 'zh';
  if (!creditsUnlocked) return <section className="page-sheet">
    <h1>{zh ? '旅程仍在展开' : 'Your journey is still unfolding'}</h1>
    <p>{zh ? `已收集 ${completedChapterIds.length}/9 枚印章。完成九章后即可打开终章。` : `You have collected ${completedChapterIds.length}/9 seals. Complete all nine chapters to open the ending.`}</p>
    <div className="button-row"><Link className="primary-button" to="/atlas">{zh ? '回到地图' : 'Return to atlas'}</Link><Link className="quiet-button" to="/seals">{zh ? '查看图章' : 'View my seals'}</Link></div>
  </section>;
  const [title, text] = scenes[index][language];
  return <section className="journey-ending page-sheet" aria-label={zh ? '旅程终章' : 'Journey ending'}>
    <p className="eyebrow">{zh ? '九枚图章 · 一段旅程' : 'Nine seals · One journey'}</p>
    <div className="ending-seals" aria-label={zh ? '九枚已收藏图章' : 'Nine collected seals'}>
      {chapters.map(chapter => <img key={chapter.id} src={`${import.meta.env.BASE_URL}${chapter.sealPath}`} alt={chapter.title[language]} width="62" height="62" />)}
    </div>
    <article aria-live="polite"><h1>{title}</h1><p>{index === 4 && !storageAvailable ? (zh ? '本次旅程的印章会保留到页面关闭。带着这些问题，继续探索身边的山河。' : 'Your seals remain for this visit. Carry these questions with you as you explore the landscapes around you.') : text}</p></article>
    <nav className="ending-navigation" aria-label={zh ? '终章段落' : 'Ending scenes'}>
      <button className="quiet-button" type="button" disabled={index === 0} onClick={() => setIndex(value => value - 1)}>{zh ? '上一页' : 'Previous'}</button>
      <span>{index + 1} / {scenes.length}</span>
      {index < scenes.length - 1
        ? <button className="primary-button" type="button" onClick={() => setIndex(value => value + 1)}>{zh ? '继续' : 'Continue'}</button>
        : <Link className="primary-button" to="/atlas">{zh ? '回到地图' : 'Return to atlas'}</Link>}
    </nav>
    <p className="ending-credits">{zh ? '项目作者' : 'Project authors'} · Yanbing Chen and Ganrong(James) Fu</p>
  </section>;
}
