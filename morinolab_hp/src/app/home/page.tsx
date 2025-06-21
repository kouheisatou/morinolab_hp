"use client";

import { useLang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { Theme } from "@/models/theme";
import { NewsItem } from "@/models/news";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { loadNews, loadThemes } from "@/app/dataLoader";

// Adjustable ratio: if copy height / image height is below this, overlay text stays on the image. Otherwise text is rendered below.
// You can override the default 0.3 threshold by defining NEXT_PUBLIC_HERO_OVERLAY_THRESHOLD in .env.local (must start with NEXT_PUBLIC_ to be exposed to the client).
const HERO_OVERLAY_THRESHOLD: number = Number(
  process.env.NEXT_PUBLIC_HERO_OVERLAY_THRESHOLD ?? "0.4",
);

export default function HomePage() {
  const { lang } = useLang();
  const t = texts(lang).home;

  const [themes, setThemes] = useState<Theme[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    loadThemes().then(setThemes);
    loadNews().then(setNewsItems);
  }, []);

  /* hero overlay visibility logic */
  const headerRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  const recalc = () => {
    if (!headerRef.current || !copyRef.current) return;
    const h = headerRef.current.offsetHeight;
    const ch = copyRef.current.offsetHeight;
    if (h === 0) return;
    setShowOverlay(ch / h <= HERO_OVERLAY_THRESHOLD);
  };

  useEffect(() => {
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  /* ==================== LAYOUT ==================== */
  return (
    <div className="space-y-20">
      {/* 1️⃣ HERO */}
      <header
        ref={headerRef}
        className="relative w-full rounded-[var(--radius)] overflow-hidden"
      >
        {/* Hero background image */}
        <img
          src="img/lab-group2023.png"
          alt="Lab group photo 2023"
          className="w-full h-auto object-contain"
          onLoad={recalc}
        />

        {/* Gradient overlay – covers entire image height dynamically */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Hero copy – absolute at the bottom so it doesn't hide faces */}
        <div
          ref={copyRef}
          className={`absolute bottom-0 left-0 right-0 z-10 flex flex-col items-start text-white text-left px-6 pb-10 sm:px-10 transition-opacity ${showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <p className="text-3xl sm:text-5xl font-extrabold mb-2 drop-shadow-lg">
            {t.title}
          </p>
          <p className="max-w-2xl text-sm sm:text-lg leading-relaxed drop-shadow">
            {t.body}
          </p>
          {/* CTA if needed */}
        </div>
      </header>

      {/* Fallback copy below hero when overlay hidden */}
      {!showOverlay && (
        <div className="px-4 mt-4 text-left" id="hero-copy-fallback">
          <p className="text-3xl sm:text-5xl font-extrabold mb-2">{t.title}</p>
          <p className="max-w-2xl text-sm sm:text-lg leading-relaxed">
            {t.body}
          </p>
        </div>
      )}

      {/* 3️⃣ RESEARCH THEMES */}
      <section className="px-4" id="research">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t.researchTitle}
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((th: Theme) => {
            const title = lang === "ja" ? th.titleJa : th.titleEn;
            const desc = lang === "ja" ? th.descJa : th.descEn;
            return (
              <Link
                key={th.id}
                href={`/articles/theme/${th.id}`}
                className="theme-card clickable-card flex flex-col"
                style={{ padding: 0 }}
              >
                <img
                  src={th.thumbnail || "img/noimage_theme.png"}
                  alt={title}
                  className="w-full h-40 object-cover rounded-t-[var(--radius)]"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <span className="font-semibold mb-1">{title}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                    {desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4️⃣ NEWS (Unified) */}
      <section className="px-4" id="news">
        <h2 className="text-2xl font-bold text-center mb-8">
          {lang === "ja" ? "ニュース" : "News"}
        </h2>
        <div className="space-y-4">
          {newsItems.map((n, idx) => (
            <Link
              key={n.id ?? idx}
              href={`/articles/news/${n.id}`}
              className="neu-container clickable-card flex items-stretch overflow-hidden w-full h-32"
              style={{ padding: 0 }}
            >
              <div
                className="flex-none rounded-l-[var(--radius)] overflow-hidden"
                style={{ flexBasis: "20%", height: "100%" }}
              >
                <img
                  src={n.thumbnail || "img/noimage_news.png"}
                  alt={lang === "ja" ? n.textJa : n.textEn}
                  className="w-full h-full object-cover"
                />
              </div>
              {(() => {
                const text = lang === "ja" ? n.textJa : n.textEn;
                const parts = text.split("–");
                const title = parts[0]?.trim() || text;
                const descText = parts.slice(1).join("–").trim();
                return (
                  <div className="flex flex-col gap-1 p-3 text-xs sm:text-sm flex-1">
                    <span className="font-semibold leading-snug text-sm">
                      {title}
                    </span>
                    <span className="text-[10px] text-gray-500">{n.date}</span>
                    {descText && (
                      <p
                        className="text-sm text-gray-600 dark:text-gray-300"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {descText}
                      </p>
                    )}
                  </div>
                );
              })()}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
