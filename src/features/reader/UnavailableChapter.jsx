import { Link } from 'react-router-dom';

export default function UnavailableChapter({ chapter, language }) {
  const zh = language === 'zh';
  return <section className="page-sheet unavailable-chapter">
    <p className="eyebrow">{zh ? '章节' : 'Chapter'} {String(chapter.number).padStart(2, '0')}</p>
    <h1>{chapter.title[language]}</h1>
    <p>{zh ? '将在下一阶段开放' : 'Coming in the next milestone'}</p>
    <p>{zh ? '这处地点已在地图上保留。它的完整阅读体验正在迁移中；现在浏览此页不会计入已完成章节。' : 'This location is part of the atlas. Its full reading experience is being migrated; visiting this page does not complete the chapter.'}</p>
    {chapter.coordinate && <p className="fine-print">{zh ? '原地图坐标' : 'Original atlas anchor'} · {chapter.coordinate[1]}° N, {chapter.coordinate[0]}° E</p>}
    <div className="button-row"><Link className="primary-button" to="/atlas">{zh ? '回到地图' : 'Return to atlas'}</Link><Link className="quiet-button" to="/read/my-hometown">{zh ? '阅读《我的山河》' : 'Read My Hometown'}</Link></div>
  </section>;
}
