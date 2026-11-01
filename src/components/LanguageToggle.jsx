export default function LanguageToggle({ language, onChange }) {
  return <div className="language-toggle" role="group" aria-label={language === 'zh' ? '语言' : 'Language'}>
    <button lang="zh" type="button" aria-pressed={language === 'zh'} onClick={() => onChange('zh')}>中文</button>
    <span aria-hidden="true">/</span>
    <button lang="en" type="button" aria-pressed={language === 'en'} onClick={() => onChange('en')}>EN</button>
  </div>;
}
