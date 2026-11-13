import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chapters } from '../../data/chapters.js';
import { useJourney } from '../../state/useJourney.js';

export default function SealsPage() {
  const { language, completedChapterIds, resetProgress, creditsUnlocked, storageAvailable } = useJourney();
  const dialog = useRef(null);
  const navigate = useNavigate();
  const zh = language === 'zh';
  function reset() { resetProgress(); dialog.current.close(); navigate('/intro'); }
  return <section className="page-sheet">
    <p className="eyebrow">{zh ? '每一枚图章，都是一段旅程' : 'A place remembered, a story collected'}</p>
    <h1>{zh ? '我的图章' : 'My seals'} <small>{completedChapterIds.length} / 9</small></h1>
    <p>{zh ? '读完一个章节，留下一枚山河图章。九处地点都已开放，完成后可以进入终章。' : 'Finish a chapter to collect its seal. All nine locations are open. Complete them to discover the ending.'}</p>
    <p className="fine-print">{storageAvailable ? (zh ? '阅读位置和印章保存在当前浏览器中。' : 'Your reading places and seals are saved in this browser.') : (zh ? '浏览器无法保存进度，印章会保留到本页关闭。' : 'Browser storage is unavailable. Seals remain for this visit.')}</p>
    <ul className="seal-grid">{chapters.map(chapter => {
      const earned = completedChapterIds.includes(chapter.id);
      return <li className={`seal-card ${earned ? 'earned' : 'locked'}`} key={chapter.id}>
        <img src={`${import.meta.env.BASE_URL}${chapter.sealPath}`} alt="" width="88" height="88" />
        <h2>{chapter.title[language]}</h2>
        <p>{earned ? (zh ? '已收藏' : 'Collected') : (zh ? '尚未完成' : 'Not yet collected')}</p>
        <Link to={`/read/${chapter.folder}`}>{chapter.id === 'my-hometown' ? (zh ? '阅读章节' : 'Read chapter') : (zh ? '阅读导读' : 'Read guide')}</Link>
      </li>;
    })}</ul>
    <div className="ending-note" data-testid={creditsUnlocked ? 'ending-unlocked' : 'ending-locked'}>
      <strong>{creditsUnlocked ? (zh ? '九枚图章已集齐' : 'All nine seals collected') : (zh ? '继续点亮山河' : 'Keep the journey growing')}</strong>
      <p>{creditsUnlocked ? (zh ? '最后一段旅程正在等待你。' : 'The final part of your journey is ready.') : (zh ? `再收集 ${9 - completedChapterIds.length} 枚图章，即可打开五段终章。` : `Collect ${9 - completedChapterIds.length} more seals to open the five-scene ending.`)}</p>
      {creditsUnlocked && <Link className="primary-button" to="/ending">{zh ? '进入终章' : 'Open the ending'}</Link>}
    </div>
    <div className="button-row"><Link className="primary-button" to="/atlas">{zh ? '回到地图' : 'Return to atlas'}</Link><button className="quiet-button" onClick={() => dialog.current.showModal()}>{zh ? '重置旅程' : 'Reset journey'}</button></div>
    <dialog ref={dialog} className="reset-dialog" aria-labelledby="reset-title">
      <h2 id="reset-title">{zh ? '重新开始这段旅程？' : 'Begin this journey again?'}</h2>
      <p>{zh ? '这会清除当前浏览器的阅读位置、阅读进度和图章，语言选择会保留。' : 'This clears your saved reading place, chapter progress and collected seals in this browser. Your language choice will stay.'}</p>
      <div className="button-row"><button autoFocus className="quiet-button" onClick={() => dialog.current.close()}>{zh ? '保留旅程' : 'Keep my journey'}</button><button className="primary-button" onClick={reset}>{zh ? '确认重置' : 'Reset progress'}</button></div>
    </dialog>
  </section>;
}
