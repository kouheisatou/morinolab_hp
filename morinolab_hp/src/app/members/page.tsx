"use client";
import { useLang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { Member } from "@/models/member";
import { Tag } from "@/models/tag";
import { MemberType } from "@/models/memberType";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadMembers, loadTags, loadMemberTypes } from "../dataLoader";

// Helper to get tag display label
const tagLabel = (tag: Tag, lang: "ja" | "en") =>
  lang === "ja" ? tag.name : tag.name_english;

// Helper to retrieve localized type label (e.g., B4, M1, 卒業生, 教員)
const getTypeLabelById = (
  typeId: number,
  typeMap: Map<number, MemberType>,
  lang: "ja" | "en",
) => {
  const t = typeMap.get(typeId);
  if (!t) return "Unknown";
  return lang === "ja" ? t.nameJa : t.nameEn;
};

const Members = () => {
  const { lang } = useLang();
  const title = texts(lang).members.title;

  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const [members, setMembers] = useState<Member[]>([]);
  const [tagsData, setTagsData] = useState<Tag[]>([]);
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);

  useEffect(() => {
    loadMembers().then(setMembers);
    loadTags().then(setTagsData);
    loadMemberTypes().then(setMemberTypes);
  }, []);

  // Map for quick lookup
  const memberTypeMap = new Map<number, MemberType>(
    memberTypes.map((t) => [t.id, t]),
  );

  // Partition members by type label for display
  const categoryMap = new Map<string, Member[]>();
  members.forEach((m) => {
    const label = getTypeLabelById(m.memberTypeId, memberTypeMap, lang);
    const arr = categoryMap.get(label) ?? [];
    arr.push(m);
    categoryMap.set(label, arr);
  });

  // Tags state – start empty to make sure SSR/CSR HTML match
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagIdMap, setTagIdMap] = useState<Map<number, Tag>>(new Map());

  // Populate tags after mount – avoids hydration mismatch if server fails to fetch
  useEffect(() => {
    if (tagsData.length > 0) {
      setAllTags(tagsData);
      setTagIdMap(new Map(tagsData.map((t) => [Number(t.id), t])));
    }
  }, [tagsData]);

  const filterFn = (m: Member) => {
    if (selectedTagIds.length === 0) return true;
    return m.tagIds.some((id) => selectedTagIds.includes(id));
  };

  const filteredMembers = members.filter(filterFn);

  // Build category map of filtered members
  const filteredCategoryMap = new Map<string, Member[]>();
  filteredMembers.forEach((m) => {
    const label = getTypeLabelById(m.memberTypeId, memberTypeMap, lang);
    const arr = filteredCategoryMap.get(label) ?? [];
    arr.push(m);
    filteredCategoryMap.set(label, arr);
  });

  // Build ordering array from memberTypes (ascending ID -> configured order)
  const orderedCategories = memberTypes
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((t) => (lang === "ja" ? t.nameJa : t.nameEn));

  const categoriesToRender = Array.from(filteredCategoryMap.keys()).sort(
    (a, b) => {
      const ia = orderedCategories.indexOf(a);
      const ib = orderedCategories.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    },
  );

  const router = useRouter();

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

        {/* Faculty members will be displayed via the categorized sections below */}

        {/* Categorized sections based on member type */}
        {categoriesToRender.map((cat) => (
          <div key={cat}>
            <h2 className="section-title">{cat}</h2>
            <ul className="members-grid">
              {filteredCategoryMap.get(cat)?.map((m) => {
                const isClickable = m.memberTypeId === 1;
                return (
                  <li
                    key={m.id}
                    className={`neu-container p-4 flex items-start gap-4 ${
                      isClickable ? "clickable-card" : ""
                    }`}
                    onClick={
                      isClickable
                        ? () => router.push(`/articles/member/${m.id}`)
                        : undefined
                    }
                    role={isClickable ? "link" : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    style={isClickable ? {} : { cursor: "default" }}
                  >
                    {m.thumbnail && (
                      <img
                        src={m.thumbnail}
                        alt={
                          lang === "ja"
                            ? `${m.name}の写真`
                            : `${m.nameEnglish}'s photo`
                        }
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex flex-col gap-1">
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
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
