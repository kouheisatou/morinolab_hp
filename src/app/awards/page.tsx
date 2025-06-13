"use client";
import { useLang } from '@/components/LanguageContext'
import { texts } from '@/components/i18n'

const Awards = () => {
  const { lang } = useLang()
  const title = texts(lang).awards.title

  const awards = [
    {
      img: 'https://source.unsplash.com/400x300?trophy',
      text: lang === 'ja'
        ? 'IPSJ ITS 研究会 優秀発表賞 (2025.04) – 石川佳奈穂(M2)'
        : 'Best Presentation Award at IPSJ ITS (Apr 2025) – Kanaho Ishikawa (M2)',
    },
    {
      img: 'https://source.unsplash.com/400x300?certificate',
      text: lang === 'ja'
        ? 'IEICE 論文採択 (2024.10) – 佐藤耕平(M1)'
        : 'Paper accepted to IEICE Journal (Oct 2024) – Kouhei Sato (M1)',
    },
    {
      img: 'https://source.unsplash.com/400x300?medal',
      text: lang === 'ja'
        ? '芝浦工業大学 研究テーマ更新表彰 (2023.11)'
        : 'Research Theme Recognition by SIT (Nov 2023)',
    },
  ]

  return (
    <div>
      <h1>{title}</h1>
      <div className="pub-grid">
        {awards.map((a) => (
          <div className="pub-card" key={a.text}>
            <img src={a.img} alt={a.text} />
            <div className="pub-meta">
              <span className="pub-title">{a.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Awards 