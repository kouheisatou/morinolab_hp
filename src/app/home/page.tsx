"use client";

import { useLang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";

interface Entry {
  date: string;
  text: string;
  img?: string;
}

export default function HomePage() {
  const { lang } = useLang();
  const t = texts(lang).home;

  const announcements: Entry[] = [
    {
      date: "2025-06-01",
      text: lang === "ja" ? "オープンキャンパス開催のお知らせ" : "Open Campus Announcement",
      img: "img/sample/opencampus.png",
    },
    {
      date: "2025-05-20",
      text: lang === "ja" ? "B4配属説明会のお知らせ" : "Orientation for New B4 Students",
      img: "img/sample/orientation.png",
    },
  ];

  const updates: Entry[] = [
    {
      date: "2025-05-10",
      text: lang === "ja" ? "研究室HPをリニューアルしました" : "Lab website renewed",
    },
    {
      date: "2025-04-01",
      text: lang === "ja" ? "2025年度メンバー情報を更新" : "Updated members for 2025",
    },
  ];

  const awards = [
    {
      img: 'img/sample/citation.png',
      text:
        lang === 'ja'
          ? 'IPSJ ITS 研究会 優秀発表賞 (2025.04) – 石川佳奈穂(M2)'
          : 'Best Presentation Award at IPSJ ITS (Apr 2025) – Kanaho Ishikawa (M2)',
    },
    {
      img: 'img/sample/medal.png',
      text:
        lang === 'ja'
          ? '芝浦工業大学 研究テーマ更新表彰 (2023.11)'
          : 'Research Theme Recognition by SIT (Nov 2023)',
    },
  ] as const;

  // Awards converted to news-like entries with date extraction
  const awardsNews = awards.map((a) => {
    const match = a.text.match(/[0-9]{4}\.[0-9]{2}/);
    const date = match ? match[0].replace('.', '-') : '2000-01';
    return { date, text: a.text, img: a.img } as Entry;
  });

  const themes = [
    {
      img: "img/sample/network.png",
      title: lang === "ja" ? "自律分散ネットワーク" : "Autonomous Distributed Networks",
      desc:
        lang === "ja"
          ? "ユーザ参加型のマルチホップ無線 LAN による自律分散ネットワーク制御について研究しています。"
          : "We study autonomous control of multi-hop wireless LAN formed by user devices.",
    },
    {
      img: "img/sample/blockchain.png",
      title: lang === "ja" ? "ブロックチェーン決済チャネル" : "Blockchain Payment Channels",
      desc:
        lang === "ja"
          ? "Lightning Network などのオフチェーン決済チャネルによる高速・低手数料トランザクションを研究。"
          : "Exploring high-speed, low-fee transactions with off-chain payment channels such as the Lightning Network.",
    },
    {
      img: "img/sample/lidar.png",
      title: lang === "ja" ? "3次元点群センシング" : "3D Point-Cloud Sensing",
      desc:
        lang === "ja"
          ? "LiDAR を用いた屋内外環境の高精度 3D 点群センシングとクラウド連携処理を行います。"
          : "High-precision 3D point-cloud sensing with LiDAR and cloud-based processing for indoor/outdoor environments.",
    },
  ];

  const sampleImagesForNews = [
    'img/sample/opencampus.png',
    'img/sample/orientation.png',
    'img/sample/network.png',
    'img/sample/blockchain.png',
    'img/sample/lidar.png',
    'img/sample/hero.png',
  ] as const;

  const withImage = (e: Entry, idx: number): Entry =>
    e.img
      ? e
      : { ...e, img: sampleImagesForNews[idx % sampleImagesForNews.length] };

  const news = [...announcements, ...updates, ...awardsNews]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((item, idx) => {
      const base = withImage(item, idx);
      // Generate description if not provided
      const desc =
        lang === 'ja'
          ? `${base.text} に関する詳細な情報です。`
          : `More details about: ${base.text}.`;
      return { ...base, desc } as Entry & { desc: string };
    });

  /* ==================== LAYOUT ==================== */
  return (
    <div className="space-y-20">
      {/* 1️⃣ HERO */}
      <header className="relative h-[60vh] rounded-[var(--radius)] overflow-hidden">
        <img
          src="img/sample/hero.png"
          alt="Lab hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
          <p className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow">
            {t.title}
          </p>
          <p className="max-w-2xl text-base sm:text-lg mb-6">
            {t.body}
          </p>
          {/* CTA if needed */}
        </div>
      </header>

      {/* 3️⃣ RESEARCH THEMES */}
      <section className="px-4" id="research">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t.researchTitle}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((th) => (
            <div key={th.title} className="theme-card flex flex-col" style={{ padding: 0 }}>
              <img
                src={th.img}
                alt={th.title}
                className="w-full h-40 object-cover rounded-t-[var(--radius)]"
              />
              <div className="p-4 flex-1 flex flex-col">
                <span className="font-semibold mb-1">{th.title}</span>
                <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                  {th.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4️⃣ NEWS (Unified) */}
      <section className="px-4" id="news">
        <h2 className="text-2xl font-bold text-center mb-8">
          {lang === 'ja' ? 'ニュース' : 'News'}
        </h2>
        <div className="space-y-4">
          {news.map((n, idx) => (
            <div
              key={n.date + idx}
              className="neu-container flex items-stretch overflow-hidden w-full h-32"
              style={{ padding: 0 }}
            >
              <div
                className="flex-none rounded-l-[var(--radius)] overflow-hidden"
                style={{ flexBasis: '20%', height: '100%' }}
              >
                <img
                  src={n.img}
                  alt={n.text}
                  className="w-full h-full object-cover"
                />
              </div>
              {(() => {
                const parts = n.text.split('–');
                const title = parts[0]?.trim() || n.text;
                const desc = parts.slice(1).join('–').trim();
                return (
                  <div className="flex flex-col gap-1 p-3 text-xs sm:text-sm flex-1">
                    <span className="font-semibold leading-snug text-sm">
                      {title}
                    </span>
                    <span className="text-[10px] text-gray-500">{n.date}</span>
                    {n.desc && (
                      <p
                        className="text-sm text-gray-600 dark:text-gray-300"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {n.desc}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      </section>

      {/* Awards section removed as merged into news */}
    </div>
  );
} 