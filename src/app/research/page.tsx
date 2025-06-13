"use client";
import { useLang } from '@/components/LanguageContext'
import { texts } from '@/components/i18n'

const Research = () => {
  const { lang } = useLang()
  const t = texts(lang).research

  const topics = [
    {
      img: 'img/theme-network.jpg',
      title: lang === 'ja' ? '自律分散ネットワーク' : 'Autonomous Distributed Networks',
      desc: lang === 'ja' ? 'ユーザ参加型の自律分散通信を実現するアルゴリズムを研究。' : 'Algorithms enabling user-participatory autonomous networks.' ,
    },
    {
      img: 'img/theme-blockchain.jpg',
      title: lang === 'ja' ? 'ブロックチェーン決済チャネル' : 'Blockchain Payment Channels',
      desc: lang === 'ja' ? '高速かつ匿名性の高い決済チャネルの最適化。' : 'Optimising fast and privacy-preserving payment channels.' ,
    },
    {
      img: 'img/theme-pointcloud.jpg',
      title: lang === 'ja' ? '3次元点群センシング' : '3D Point-Cloud Sensing',
      desc: lang === 'ja' ? 'LiDAR や RGB-D カメラを用いた人混み検出・認識。' : 'Crowd detection and recognition using LiDAR and RGB-D.' ,
    },
  ]

  return (
    <div>
      <h1>{t.title}</h1>
      <p>{t.body}</p>
      <div className="pub-grid">
        {topics.map((tp) => (
          <div className="pub-card" key={tp.title}>
            <img src={tp.img} alt={tp.title} />
            <div className="pub-meta">
              <span className="pub-title">{tp.title}</span>
              <span className="pub-date">{tp.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Research 