"use client";
import { useLang } from '@/components/LanguageContext'
import { texts } from '@/components/i18n'

const Access = () => {
  const { lang } = useLang()
  const t = texts(lang).access
  return (
    <div>
      <h1>{t.title}</h1>
      <p>{t.body}</p>
      <div className="map-wrapper">
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
      </div>

      <div className="access-img-grid">
        <img src="/img/abm00022184.png" alt="Toyosu campus overview" className="access-img" />
        <img src="/img/toyosu_map.gif" alt="Toyosu campus map" className="access-img" />
      </div>
    </div>
  )
}

export default Access 