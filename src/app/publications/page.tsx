"use client";
import { useLang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { publications, tags, members } from "@/common_resource";
import { Tag } from "@/models/tag";
import { useMemo, useState } from "react";
import { Publication } from "@/models/publication";

const Publications = () => {
  const { lang } = useLang();
  const title = texts(lang).publications.title;

  // Local helper to get tag display label
  const tagLabel = (tag: Tag) => (lang === "ja" ? tag.name : tag.name_english);

  // Build helper maps
  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), []);

  // Infer tags from title / publication name
  const inferTags = (p: Publication): Tag[] => {
    const text = (
      (p.titleJa || "") +
      (p.titleEn || "") +
      (p.publicationNameJa || "") +
      (p.publicationNameEn || "")
    ).toLowerCase();

    const res: Tag[] = [];
    if (/lidar|点群/.test(text)) res.push(tags.find((t) => t === tags[0])!); // LiDAR
    if (/blockchain|ペイメント|channel/.test(text))
      res.push(tags.find((t) => t === tags[1])!);
    if (/crowd|人数/.test(text)) res.push(tags.find((t) => t === tags[2])!);
    if (/v2x|vehicle|車両|車々|vehicular/.test(text))
      res.push(tags.find((t) => t === tags[3])!);
    if (/wifi|wi-fi|csi/.test(text)) res.push(tags.find((t) => t === tags[4])!);
    if (res.length === 0) res.push(tags.find((t) => t === tags[5])!);
    return res;
  };

  type PubWithTags = Publication & { tags: Tag[] };

  const enriched: PubWithTags[] = useMemo(
    () => publications.map((p) => ({ ...p, tags: inferTags(p) })),
    [],
  );

  // State for tag and year filters (use tag.id for reliability)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<"all" | number>("all");
  const [showOlder, setShowOlder] = useState(false);

  const filterByTag = (p: PubWithTags) =>
    selectedTagIds.length === 0
      ? true
      : p.tags.some((t: Tag) => selectedTagIds.includes(t.id));

  // Group after filtering
  const grouped: Record<number, PubWithTags[]> = {};
  enriched.filter(filterByTag).forEach((p) => {
    if (!grouped[p.fiscalYear]) grouped[p.fiscalYear] = [];
    grouped[p.fiscalYear].push(p);
  });

  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  const recentYears = years.slice(0, 8);

  const yearFilterFn = (year: number) => {
    if (selectedYear === "all") return true;
    if (showOlder) return year <= (selectedYear as number);
    return year === selectedYear;
  };

  // Format authors list by mapping authorMemberIds to Member objects
  const formatAuthors = (ids: number[]) =>
    ids
      .map((id) => {
        const m = memberMap.get(id);
        if (!m) return `ID:${id}`;
        return lang === "ja" ? m.name : m.nameEnglish || m.name;
      })
      .join(", ");

  const getTitle = (p: Publication) =>
    lang === "ja" ? p.titleJa || p.titleEn : p.titleEn || p.titleJa;

  const getDate = (p: Publication) =>
    lang === "ja" ? p.dateJa || "" : p.dateEn || "";

  // Fallback when imagePath is not provided
  const getFallbackImage = () => "img/noimage_paper.png";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      {/* Tag filter */}
      <div className="filter-row">
        <span className="filter-label">
          {lang === "ja" ? "テーマ" : "Thema"}
        </span>
        <button
          className={`tag-chip ${selectedTagIds.length === 0 ? "selected" : ""}`}
          onClick={() => setSelectedTagIds([])}
        >
          All
        </button>
        {tags.map((t) => (
          <button
            key={t.id}
            className={`tag-chip ${selectedTagIds.includes(t.id) ? "selected" : ""}`}
            onClick={() =>
              setSelectedTagIds((prev) =>
                prev.includes(t.id)
                  ? prev.filter((x) => x !== t.id)
                  : [...prev, t.id],
              )
            }
          >
            {tagLabel(t)}
          </button>
        ))}
      </div>

      {/* Year filter */}
      <div className="filter-row mt-4">
        <span className="filter-label">{lang === "ja" ? "年度" : "Year"}</span>
        <button
          className={`tag-chip ${selectedYear === "all" ? "selected" : ""}`}
          onClick={() => {
            setSelectedYear("all");
            setShowOlder(false);
          }}
        >
          All
        </button>
        {recentYears.map((y, idx) => (
          <button
            key={y}
            className={`tag-chip ${selectedYear === y && (idx !== recentYears.length - 1 ? !showOlder : true) ? "selected" : ""}`}
            onClick={() => {
              setSelectedYear(y);
              setShowOlder(idx === recentYears.length - 1);
            }}
          >
            {idx === recentYears.length - 1 ? `${y}~以前` : y}
          </button>
        ))}
      </div>

      {years.filter(yearFilterFn).map((year) => (
        <div key={year} className="mb-10">
          <h2 className="section-title">{year}</h2>
          <div className="pub-grid">
            {grouped[year].map((p) => (
              <div key={p.id} className="pub-card">
                <img
                  src={p.imagePath ?? getFallbackImage()}
                  alt={getTitle(p)}
                />
                <div className="pub-meta">
                  <span className="pub-title">{getTitle(p)}</span>
                  <span className="pub-authors text-sm text-gray-700 dark:text-gray-300">
                    {formatAuthors(p.authorMemberIds)}
                  </span>
                  <span className="pub-date text-sm text-gray-500 dark:text-gray-400">
                    {getDate(p)}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.tags.map((t: Tag) => (
                      <span key={t.id} className="tag-badge">
                        {tagLabel(t)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Publications;
