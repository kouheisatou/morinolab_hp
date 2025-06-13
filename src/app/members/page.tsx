"use client";
import { TAGS, TAG_OTHER, currentYear, members } from "@/common_resource";
import { useLang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { Member } from "@/models/member";
import { Tag } from "@/models/tag";
import { useMemo, useState } from "react";

// Helper to get tag display label
const tagLabel = (tag: Tag, lang: "ja" | "en") =>
  lang === "ja" ? tag.name : tag.name_english;

// Compute grade label from years since admission
const getGradeLabel = (
  admissionYear: number,
  repeats = 0,
  graduated = false,
): string => {
  if (graduated) return "Alumni";
  const diff = currentYear - admissionYear + repeats;
  const map = ["B1", "B2", "B3", "B4", "M1", "M2", "D1", "D2", "D3"];
  return diff >= 0 && diff < map.length ? map[diff] : "Unknown";
};

const Members = () => {
  const { lang } = useLang();
  const t = texts(lang).home;
  const title = texts(lang).members.title;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Faculty as Member array for bilingual support
  const faculty: Member[] = [
    new Member(
      0,
      "森野 博章",
      "教授",
      "Hiroaki Morino",
      "Professor",
      2000,
      "img/morino.jpg",
      [TAG_OTHER],
      0,
      false,
      true,
      false,
    ),
  ];

  const alumniMembers: Member[] = members.filter((m) => m.graduated);

  const currentStudents: Member[] = members.filter((m) => !m.graduated);

  const allTags = useMemo(() => TAGS, []);

  const filterFn = (m: Member) =>
    selectedTags.length === 0
      ? true
      : m.tags.some((t) => selectedTags.includes(t.name_english));

  const filteredStudents = currentStudents.filter(filterFn);
  const filteredAlumni = alumniMembers.filter(filterFn);

  // Categorize by grade
  const categorize = (members: Member[]) => {
    const map: Record<string, Member[]> = {};
    members.forEach((m) => {
      const label = getGradeLabel(m.admissionYear, m.repeats, m.graduated);
      if (!map[label]) map[label] = [];
      map[label].push(m);
    });
    return map;
  };

  const categoryMap = categorize(filteredStudents);

  return (
    <div className="members-page">
      <header className="relative w-full rounded-[var(--radius)] overflow-hidden mb-18">
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

      <div className="px-6 sm:px-10">
        <h1 className="text-3xl font-bold mb-5">{title}</h1>

        {/* Tag Filter */}
        <div className="filter-row">
          <span className="filter-label">
            {lang === "ja" ? "絞り込み" : "Filter"}
          </span>
          <button
            className={`tag-chip ${selectedTags.length === 0 ? "selected" : ""}`}
            onClick={() => setSelectedTags([])}
          >
            All
          </button>
          {allTags.map((tagObj) => (
            <button
              key={tagObj.name_english}
              className={`tag-chip ${selectedTags.includes(tagObj.name_english) ? "selected" : ""}`}
              onClick={() => {
                setSelectedTags((prev) => {
                  if (prev.includes(tagObj.name_english)) {
                    return prev.filter((t) => t !== tagObj.name_english);
                  } else {
                    return [...prev, tagObj.name_english];
                  }
                });
              }}
            >
              {tagLabel(tagObj, lang)}
            </button>
          ))}
        </div>

        <h2 className="section-title">Faculty</h2>
        <ul className="members-grid">
          {faculty.map((m) => (
            <li key={m.id} className="member-row">
              {m.img && <img src={m.img} alt={m.name} className="member-photo" />}
              <div>
                <strong>{lang === "ja" ? m.name : m.nameEnglish}</strong>
                <div className="member-desc">
                  {lang === "ja" ? m.desc : m.descEnglish}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* New categorized sections */}
        {["M2", "M1", "B4", "B3"].map((grade) =>
          categoryMap[grade] && categoryMap[grade].length > 0 ? (
            <div key={grade}>
              <h2 className="section-title">{grade}</h2>
              <ul className="members-grid">
                {categoryMap[grade].map((m) => (
                  <li key={m.id}>
                    <strong>{lang === "ja" ? m.name : m.nameEnglish}</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {m.tags.map((t) => (
                        <span key={t.name_english} className="tag-badge">
                          {tagLabel(t, lang)}
                        </span>
                      ))}
                    </div>
                    <div className="member-desc">
                      {lang === "ja" ? m.desc : m.descEnglish}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}

        {/* Alumni Section */}
        {filteredAlumni.length > 0 && (
          <>
            <h2 className="section-title">
              {lang === "ja" ? "卒業生" : "Alumni"}
            </h2>
            <ul className="members-grid">
              {filteredAlumni.map((m) => (
                <li key={m.id}>
                  <strong>{lang === "ja" ? m.name : m.nameEnglish}</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.tags.map((t) => (
                      <span key={t.name_english} className="tag-badge">
                        {tagLabel(t, lang)}
                      </span>
                    ))}
                  </div>
                  <div className="member-desc">
                    {lang === "ja"
                      ? `${m.gradYear}年 ${m.master ? "院卒" : "学部卒"} / ${m.desc}`
                      : `${m.gradYear} ${m.master ? "Master grad." : "Bachelor grad."} / ${m.descEnglish}`}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default Members;
