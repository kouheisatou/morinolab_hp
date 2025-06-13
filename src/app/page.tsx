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
      img: "/img/lab-group2023.png",
    },
    {
      date: "2025-05-20",
      text: lang === "ja" ? "B4配属説明会のお知らせ" : "Orientation for New B4 Students",
      img: "/img/office.jpeg",
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

  const themes = [
    {
      img: "/img/theme-network.jpg",
      title: lang === "ja" ? "自律分散ネットワーク" : "Autonomous Distributed Networks",
    },
    {
      img: "/img/theme-blockchain.jpg",
      title: lang === "ja" ? "ブロックチェーン決済チャネル" : "Blockchain Payment Channels",
    },
    {
      img: "/img/theme-pointcloud.jpg",
      title: lang === "ja" ? "3次元点群センシング" : "3D Point-Cloud Sensing",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[var(--radius)] mb-12">
        <img
          src="/img/office.jpeg"
          alt="Lab office"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white py-20 md:py-32 px-6">
          <p className="text-4xl sm:text-5xl md:text-4xl font-extrabold mb-8">
            {t.title}
          </p>
          <p className="max-w-3xl text-base sm:text-lg md:text-xl mb-8">
            {t.body}
          </p>
        </div>
      </section>

      {/* Research Themes */}
      <section id="research" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t.researchTitle}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {themes.map((th) => (
            <div className="theme-card" key={th.title}>
              <img src={th.img} alt={th.title} />
              <span>{th.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements & Updates */}
      <section className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t.announcementsTitle}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {announcements.map((a) => (
              <div key={a.date} className="neu-container p-0 overflow-hidden">
                {a.img && (
                  <img
                    src={a.img}
                    alt={a.text}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3 flex flex-col gap-1 text-sm">
                  <span className="text-xs text-gray-500">{a.date}</span>
                  <span className="font-semibold">{a.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t.updatesTitle}
          </h2>
          <ul className="space-y-5">
            {updates.map((u) => (
              <li
                key={u.date}
                className="neu-container flex items-start gap-3 text-sm"
              >
                <strong className="whitespace-nowrap text-xs sm:text-sm">
                  {u.date}
                </strong>
                <span>{u.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
