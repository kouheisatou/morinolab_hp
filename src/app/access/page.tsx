'use client'
import { useLang } from '@/components/LanguageContext'
import { texts } from '@/components/i18n'
import { useState, useEffect } from 'react'

const Access = () => {
  const { lang } = useLang()
  const t = texts(lang).access
  const [selectedImg, setSelectedImg] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)

  const gallery = [
    {
      src: 'img/abm00022184.png',
      alt: lang === 'ja' ? '豊洲キャンパス外観' : 'Toyosu campus overview',
    },
    {
      src: 'img/toyosu_map.gif',
      alt: lang === 'ja' ? '豊洲キャンパスマップ' : 'Toyosu campus map',
    },
  ]

  // Close popup on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') startClose()
    }
    if (selectedImg) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [selectedImg])

  const startClose = () => {
    setClosing(true)
    setTimeout(() => {
      setSelectedImg(null)
      setClosing(false)
    }, 300) // match animation duration
  }

  return (
    <div>
      <h1>{t.title}</h1>
      <div className="space-y-1 mb-6 text-sm sm:text-base leading-6">
        {lang === 'ja' ? (
          <>
            <p>〒135-8548 東京都江東区豊洲3-7-5</p>
            <p>芝浦工業大学 豊洲キャンパス 研究棟12階 12-I-32</p>
            <p className="mt-1">有楽町線「豊洲」駅 徒歩7分</p>
          </>
        ) : (
          <>
            <p>Shibaura Institute of Technology, Toyosu Campus</p>
            <p>Room 12-I-32, 12F Research Bldg.</p>
            <p>3-7-5 Toyosu, Koto-ku, Tokyo 135-8548 Japan</p>
            <p className="mt-1">
              7 min walk from Toyosu Station (Tokyo Metro Yurakucho Line)
            </p>
          </>
        )}
      </div>
      <iframe
        title="SIT Toyosu Campus Map"
        src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d12966.674931045814!2d139.7845958!3d35.6605325!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601889a07930e2f9%3A0x62e41ee20b961991!2z6Iqd5rWm5bel5qWt5aSn5a2mIOixiua0suOCreODo-ODs-ODkeOCuQ!5e0!3m2!1sja!2sjp!4v1749751447357!5m2!1sja!2sjp"
        width="100%"
        height="450"
        style={{ border: 0 }}
        allowFullScreen={true}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <div className="access-img-grid">
        {gallery.map((g) => (
          <button
            key={g.src}
            onClick={() => setSelectedImg(g.src)}
            className="p-0 m-0 border-none bg-transparent"
          >
            <img src={g.src} alt={g.alt} className="access-img" />
          </button>
        ))}
      </div>

      {selectedImg && (
        <div
          className={`${closing ? 'fade-out' : 'fade-in'} fixed inset-0 bg-black/70 flex items-center justify-center z-50`}
          onClick={startClose}
        >
          <img
            src={selectedImg}
            alt="popup"
            className={`${closing ? 'fade-out' : 'fade-in'} max-w-4xl w-[90%] h-auto shadow-lg`}
            onClick={(e) => {
              e.stopPropagation()
              // no action on image click
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Access
