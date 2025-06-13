"use client";
import { useLang } from '@/components/LanguageContext'
import { texts } from '@/components/i18n'

const ClassPage = () => {
  const { lang } = useLang()
  const title = texts(lang).class.title

  const lectures = [
    {
      img: 'https://source.unsplash.com/400x300?networking',
      name: lang === 'ja' ? '情報ネットワーキング' : 'Information Networking',
    },
    {
      img: 'https://source.unsplash.com/400x300?iot',
      name: lang === 'ja' ? 'IoT システム' : 'IoT Systems',
    },
    {
      img: 'https://source.unsplash.com/400x300?wireless',
      name: lang === 'ja' ? '無線通信工学' : 'Wireless Communication Engineering',
    },
  ]

  return (
    <div>
      <h1>{title}</h1>
      <div className="pub-grid">
        {lectures.map((lec) => (
          <div className="pub-card" key={lec.name}>
            <img src={lec.img} alt={lec.name} />
            <div className="pub-meta">
              <span className="pub-title">{lec.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClassPage 