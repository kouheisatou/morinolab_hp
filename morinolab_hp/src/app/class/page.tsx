"use client";
import { useLang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { Lecture } from "@/models/lecture";
import Link from "next/link";
import { loadLectures } from "@/app/dataLoader";
import { useState, useEffect } from "react";

export default function ClassPage() {
  const { lang } = useLang();
  const title = texts(lang).class.title;

  const [lectures, setLectures] = useState<Lecture[]>([]);

  useEffect(() => {
    loadLectures().then(setLectures);
  }, []);

  const introTextJa =
    "森野研究室では、ネットワーク技術から IoT・無線通信まで、モバイル通信システムを支える幅広い講義を開講しています。各講義は理論だけでなく実践的な演習を通じて理解を深める構成となっています。";
  const introTextEn =
    "Morino Laboratory offers a broad range of courses covering mobile communication systems from networking fundamentals to IoT and wireless technologies. Each course combines theory with hands-on sessions to deepen understanding.";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{title}</h1>

      {/* Intro section */}
      <section className="mb-12">
        <img
          src="img/lecture.png"
          alt="Class overview"
          className="w-full h-48 object-cover rounded-[var(--radius)] mb-4"
        />
        <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 text-center max-w-3xl mx-auto">
          {lang === "ja" ? introTextJa : introTextEn}
        </p>
      </section>

      {/* Course catalog grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lectures.map((lec) => (
          <Link
            key={lec.id}
            href={`/articles/lecture/${lec.id}`}
            className="group neu-container clickable-card flex flex-col overflow-hidden aspect-[4/5] relative"
            style={{ padding: 0 }}
          >
            {/* Thumbnail image */}
            <div
              className="relative h-48 overflow-hidden"
              style={{ background: "var(--bg)" }}
            >
              <img
                src={lec.thumbnail || "img/noimage_lectures.png"}
                alt={lang === "ja" ? lec.titleJa : lec.titleEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Course content */}
            <div
              className="flex flex-col flex-1 p-4"
              style={{ background: "var(--bg)" }}
            >
              <h3
                className="font-bold text-lg mb-2 leading-tight"
                style={{ color: "var(--accent)" }}
              >
                {lang === "ja" ? lec.titleJa : lec.titleEn}
              </h3>

              <p
                className="text-sm leading-relaxed flex-1 line-clamp-4"
                style={{ color: "#555" }}
              >
                {lang === "ja" ? lec.descJa : lec.descEn}
              </p>

              {/* Course footer */}
              <div
                className="mt-3 pt-3"
                style={{ borderTop: "1px solid rgba(0, 0, 0, 0.1)" }}
              >
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "#888" }}
                  >
                    {lec.type}
                  </span>
                  <span
                    className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "#888" }}
                  >
                    ›
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Additional info section */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {lang === "ja"
            ? "各講義の詳細情報については、講義名をクリックしてご確認ください。"
            : "Click on each course title for detailed information and syllabus."}
        </p>
      </div>
    </div>
  );
}
