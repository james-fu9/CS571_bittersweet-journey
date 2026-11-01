import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chapters } from '../../data/chapters.js';
import { useJourney } from '../../state/useJourney.js';

export default function SealsPage() {
  const { language, completedChapterIds, resetProgress } = useJourney();
  const dialog = useRef(null);
  const navigate = useNavigate();
  const zh = language === 'zh';
  function reset() { resetProgress(); dialog.current.close(); navigate('/intro'); }
  return <section className="page-sheet">
    <p className="eyebrow">{zh ? '每一枚图章，都是一段旅程' : 'A place remembered, a story collected'}</p>
    <h1>{zh ? '我的图章' : 'My seals'} <small>{completedChapterIds.length} / 9</small></h1>
    <p>{zh ? '读完一个章节，留下一枚山河图章。你的旅程保存在当前浏览器中。' : 'Finish a chapter to collect its seal. Your journey is saved in this browser.'}</p>
    <ul className="seal-grid">{chapters.map(chapter => {
      const earned = completedChapterIds.includes(chapter.id);
      return <li className={`seal-card ${earned ? 'earned' : 'locked'}`} key={chapter.id}>
        <img src={`${import.meta.env.BASE_URL}${chapter.sealPath}`} alt="" width="88" height="88" />
        <h2>{chapter.title[language]}</h2>
        <p>{earned ? (zh ? '已收藏' : 'Collected') : chapter.implemented ? (zh ? '尚未完成' : 'Not yet collected') : (zh ? '下一阶段开放' : 'Next milestone')}</p>
        <Link to={`/read/${chapter.folder}`}>{chapter.implemented ? (zh ? '阅读章节' : 'Read chapter') : (zh ? '查看地点' : 'View location')}</Link>
      </li>;
    })}</ul>
    <div className="ending-note" data-testid="ending-locked"><strong>{zh ? '终章尚未解锁' : 'The ending is still locked'}</strong><p>{zh ? '完成全部九章后，才会揭开最后的旅程。目前可完成《我的山河》。' : 'The final journey opens after all nine chapters are complete. My Hometown is available in this milestone.'}</p></div>
    <div className="button-row"><Link className="primary-button" to="/atlas">{zh ? '回到地图' : 'Return to atlas'}</Link><button className="quiet-button" onClick={() => dialog.current.showModal()}>{zh ? '重置旅程' : 'Reset journey'}</button></div>
    <dialog ref={dialog} className="reset-dialog" aria-labelledby="reset-title">
      <h2 id="reset-title">{zh ? '重新开始这段旅程？' : 'Begin this journey again?'}</h2>
      <p>{zh ? '这会清除当前浏览器的已完成章节和图章，语言选择会保留。' : 'This clears completed chapters and collected seals in this browser. Your language choice will stay.'}</p>
      <div className="button-row"><button autoFocus className="quiet-button" onClick={() => dialog.current.close()}>{zh ? '保留旅程' : 'Keep my journey'}</button><button className="primary-button" onClick={reset}>{zh ? '确认重置' : 'Reset progress'}</button></div>
    </dialog>
  </section>;
}
