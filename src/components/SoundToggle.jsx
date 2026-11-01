import { useEffect, useRef, useState } from 'react';

export default function SoundToggle({ language, atlas }) {
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef(null);
  useEffect(() => {
    const audio = audioRef.current;
    let cancelled = false;
    audio.volume = 0.22;
    if (enabled) audio.play().catch(() => { if (!cancelled) setFailed(true); });
    else audio.pause();
    return () => { cancelled = true; audio.pause(); };
  }, [enabled, atlas]);
  function toggle() {
    if (failed) {
      audioRef.current.play().then(() => { setFailed(false); setEnabled(true); }).catch(() => setFailed(true));
    } else setEnabled(previous => !previous);
  }
  const zh = language === 'zh';
  return <>
    <audio ref={audioRef} loop preload="none" src={`${import.meta.env.BASE_URL}assets/audio/${atlas ? 'atlas' : 'intro'}.mp3`} onError={() => setFailed(true)} />
    <button className="sound-toggle" type="button" aria-pressed={enabled && !failed} onClick={toggle}
      aria-label={zh ? (enabled && !failed ? '声音开' : '声音关') : (enabled && !failed ? 'Sound on' : 'Sound off')}
      title={failed ? (zh ? '声音暂时不可用，点击重试' : 'Sound unavailable. Click to retry.') : undefined}>
      <span aria-hidden="true">{enabled && !failed ? '♫' : '♪'}</span><span>{zh ? (enabled && !failed ? '声音开' : '声音关') : (enabled && !failed ? 'Sound on' : 'Sound off')}</span>
    </button>
  </>;
}
