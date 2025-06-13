"use client";

import { useLang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { themes } from "@/common_resource";
import { newsItems } from "@/common_resource";
import { Theme } from "@/models/theme";
import { NewsItem } from "@/models/news";
import { useState } from "react";

export default function HomePage() {
  const { lang } = useLang();
  const t = texts(lang).home;
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  /* ==================== LAYOUT ==================== */
  return (
    <div className="space-y-20">
      {/* 1️⃣ HERO */}
      <header className="relative w-full rounded-[var(--radius)] overflow-hidden">
        {/* Hero background image */}
        <img
          src="img/lab-group2023.png"
          alt="Lab group photo 2023"
          className="w-full h-auto object-contain"
        />

        {/* Gradient overlay – covers entire image height dynamically */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Hero copy – absolute at the bottom so it doesn't hide faces */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-start text-white px-6 pb-10 sm:px-10">
          <p className="text-3xl sm:text-5xl font-extrabold mb-2 drop-shadow-lg">
            {t.title}
          </p>
          <p className="max-w-2xl text-sm sm:text-lg leading-relaxed drop-shadow">
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
          {themes.map((th: Theme) => {
            const title = lang === "ja" ? th.titleJa : th.titleEn;
            const desc = lang === "ja" ? th.descJa : th.descEn;
            return (
              <div
                key={th.id}
                className="theme-card flex flex-col"
                style={{ padding: 0 }}
              >
                <img
                  src={th.img}
                  alt={title}
                  className="w-full h-40 object-cover rounded-t-[var(--radius)]"
                />
                <div className="p-4 flex-1 flex flex-col">
                  <span className="font-semibold mb-1">{title}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
                    {desc}
                  </p>
                </div>
              </div>
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
            <div
              key={n.date + idx}
              className="neu-container flex items-stretch overflow-hidden w-full h-32"
              style={{ padding: 0 }}
            >
              <div
                className="flex-none rounded-l-[var(--radius)] overflow-hidden"
                style={{ flexBasis: "20%", height: "100%" }}
              >
                <img
                  src={n.img}
                  alt={n.textJa}
                  className="w-full h-full object-cover"
                />
              </div>
              {(() => {
                const parts = n.textJa.split("–");
                const title = parts[0]?.trim() || n.textJa;
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
            </div>
          ))}
        </div>
      </section>

      {/* 5️⃣ CONTACT */}
      <section className="px-4" id="contact">
        <h2 className="text-2xl font-bold text-center mb-8">
          {lang === "ja" ? "お問い合わせ" : "Contact"}
        </h2>
        <form
          className="max-w-xl mx-auto space-y-4 neu-container p-6"
          onSubmit={(e) => {
            e.preventDefault();
            alert(
              lang === "ja"
                ? "送信ありがとうございました！"
                : "Thank you for your message!",
            );
            // TODO: send data to backend API
          }}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              {lang === "ja" ? "お名前" : "Name"}
            </label>
            <input
              id="name"
              type="text"
              required
              className="px-3 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="px-3 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="message" className="text-sm font-medium">
              {lang === "ja" ? "メッセージ" : "Message"}
            </label>
            <textarea
              id="message"
              rows={4}
              required
              className="px-3 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {lang === "ja" ? "送信" : "Send"}
          </button>
        </form>
      </section>
    </div>
  );
}
