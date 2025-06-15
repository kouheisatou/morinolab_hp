"use client";
import { tags, currentYear, members } from "@/common_resource";
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
  const title = texts(lang).members.title;

  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

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
      [],
      0,
      false, // graduated
      true, // master
      false, // bachelor
      undefined, // gradYear
      undefined, // url
    ),
  ];

  const alumniMembers: Member[] = members.filter((m) => m.graduated);

  const currentStudents: Member[] = members.filter((m) => !m.graduated);

  const allTags = useMemo(() => tags, []);
  const tagIdMap = useMemo(() => new Map(tags.map((t) => [t.id, t])), []);

  const filterFn = (m: Member) => {
    if (selectedTagIds.length === 0) return true;
    return m.tagIds.some((id) => selectedTagIds.includes(id));
  };

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
      <div className="px-6 sm:px-10">
        <h1 className="text-3xl font-bold mb-5">{title}</h1>

        {/* Tag Filter */}
        <div className="filter-row">
          <span className="filter-label">
            {lang === "ja" ? "絞り込み" : "Filter"}
          </span>
          <button
            className={`tag-chip ${selectedTagIds.length === 0 ? "selected" : ""}`}
            onClick={() => setSelectedTagIds([])}
          >
            All
          </button>
          {allTags.map((tagObj) => (
            <button
              key={tagObj.id}
              className={`tag-chip ${selectedTagIds.includes(tagObj.id) ? "selected" : ""}`}
              onClick={() => {
                setSelectedTagIds((prev) => {
                  if (prev.includes(tagObj.id)) {
                    return prev.filter((t) => t !== tagObj.id);
                  } else {
                    return [...prev, tagObj.id];
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
              {m.img && (
                <img src={m.img} alt={m.name} className="member-photo" />
              )}
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
                      {m.tagIds.map((id) => {
                        const t = tagIdMap.get(id);
                        return t ? (
                          <span key={t.id} className="tag-badge">
                            {tagLabel(t, lang)}
                          </span>
                        ) : null;
                      })}
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
                    {m.tagIds.map((id) => {
                      const t = tagIdMap.get(id);
                      return t ? (
                        <span key={t.id} className="tag-badge">
                          {tagLabel(t, lang)}
                        </span>
                      ) : null;
                    })}
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
