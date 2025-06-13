"use client";
import { useLang } from '@/components/LanguageContext'
import { texts } from '@/components/i18n'

const ClassPage = () => {
  const { lang } = useLang()
  const title = texts(lang).class.title

  const lectures = [
    {
      img: 'img/sample/ethernet.png',
      titleJa: '情報ネットワーキング',
      titleEn: 'Information Networking',
      descJa:
        'OSI 参照モデル、TCP/IP スタック、ルーティング方式、トラフィック制御、SDN など、今日のインターネットを支えるネットワーク技術を講義と演習で体系的に理解する。',
      descEn:
        'Covers OSI reference model, TCP/IP stack, routing algorithms, traffic engineering, and SDN through lectures and hands-on labs to build a solid understanding of modern Internet technologies.',
    },
    {
      img: 'img/sample/network.png',
      titleJa: 'IoT システム',
      titleEn: 'IoT Systems',
      descJa:
        'センサノードのハード設計から、通信プロトコル選定、クラウド連携、データ解析基盤の構築、IoT アプリケーション開発まで一連の設計フローを学ぶ。',
      descEn:
        'Explores the full design workflow from sensor node hardware, connectivity protocols, cloud integration, data analytics pipelines to IoT application development.',
    },
    {
      img: 'img/sample/lidar.png',
      titleJa: '無線通信工学',
      titleEn: 'Wireless Communication Engineering',
      descJa:
        '電波伝搬特性、マルチパスフェージング、アンテナ・ MIMO 技術、セルラネットワーク設計、5G/6G 最新動向など無線通信技術の基礎と応用を詳解する。',
      descEn:
        'Detailed coverage of radio-wave propagation, multipath fading, antenna & MIMO techniques, cellular network design, and cutting-edge 5G/6G wireless technologies.',
    },
  ]

  const introTextJa =
    '森野研究室では、ネットワーク技術から IoT・無線通信まで、モバイル通信システムを支える幅広い講義を開講しています。各講義は理論だけでなく実践的な演習を通じて理解を深める構成となっています。';
  const introTextEn =
    'Morino Laboratory offers a broad range of courses covering mobile communication systems from networking fundamentals to IoT and wireless technologies. Each course combines theory with hands-on sessions to deepen understanding.';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{title}</h1>

      {/* Intro section */}
      <section className="mb-10">
        <img
          src="img/sample/orientation.png"
          alt="Class overview"
          className="w-full h-48 object-cover rounded-[var(--radius)] mb-4"
        />
        <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {lang === 'ja' ? introTextJa : introTextEn}
        </p>
      </section>

      <div className="space-y-8">
        {lectures.map((lec) => (
          <div
            key={lec.titleJa}
            className="neu-container flex items-stretch overflow-hidden h-40"
            style={{ padding: 0 }}
          >
            <img
              src={lec.img}
              alt={lang === 'ja' ? lec.titleJa : lec.titleEn}
              className="object-cover w-[20%] h-full rounded-l-[var(--radius)] flex-none"
              style={{ flexBasis: '20%' }}
            />
            <div className="flex flex-col gap-2 p-4 flex-1">
              <span className="font-semibold text-lg">
                {lang === 'ja' ? lec.titleJa : lec.titleEn}
              </span>
              <p
                className="text-sm text-gray-600 dark:text-gray-300"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {lang === 'ja' ? lec.descJa : lec.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClassPage 