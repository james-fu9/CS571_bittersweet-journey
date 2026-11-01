// Original book order and WGS84 anchors; source: atlas.js and atlas-camera.js.
// My Hometown has a literary SVG anchor, not an invented geographic coordinate.
export const chapters = [
  { id: 'my-hometown', folder: 'my-hometown', number: 3, title: { en: 'My Hometown', zh: '我的山河' }, coordinate: null, literaryAnchor: [606, 414], implemented: true },
  { id: 'dujiangyan', folder: 'dujiangyan', number: 4, title: { en: 'Dujiangyan Irrigation System', zh: '都江堰' }, coordinate: [103.617, 30.988], implemented: false },
  { id: 'taoist-tower', folder: 'taoist-tower', number: 5, title: { en: 'The Taoist Priest’s Tower', zh: '道士塔' }, coordinate: [94.809, 40.043], implemented: false },
  { id: 'mogao-caves', folder: 'mogao-caves', number: 6, title: { en: 'Mogao Caves', zh: '莫高窟' }, coordinate: [94.80417, 40.03722], implemented: false },
  { id: 'secret-spring', folder: 'secret-spring', number: 7, title: { en: 'A Secret Spring in the Sand', zh: '沙原隐泉' }, coordinate: [94.675, 40.084], implemented: false },
  { id: 'yangguan', folder: 'yangguan', number: 8, title: { en: 'Snow on the Southern Pass', zh: '阳关雪' }, coordinate: [94.05904, 39.92725], implemented: false },
  { id: 'kashgar', folder: 'kashgar', number: 9, title: { en: 'Kashgar in the Western Regions', zh: '西域喀什' }, coordinate: [75.9898, 39.4704], implemented: false },
  { id: 'chengde', folder: 'mountain-resort', number: 10, title: { en: 'The Villa from Behind', zh: '山庄背影' }, coordinate: [117.962, 40.954], implemented: false },
  { id: 'fish-tail-lodge', folder: 'fish-tail-lodge', number: 11, title: { en: 'Fish Tail Lodge', zh: '鱼尾山屋' }, coordinate: [83.96404, 28.20095], implemented: false },
].map(chapter => ({ ...chapter, sealPath: `assets/atlas/seals/${chapter.id}.svg` }));

export const getChapter = id => chapters.find(chapter => chapter.id === id || chapter.folder === id);
