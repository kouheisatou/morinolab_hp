"use client";
import { useLang } from '@/components/LanguageContext'
import { texts } from '@/components/i18n'
import { publications, TAGS } from '@/common_resource'
import { Tag } from '@/models/tag'
import { useMemo, useState } from 'react'

const Publications = () => {
  const { lang } = useLang()
  const title = texts(lang).publications.title

  // Local helper to get tag display label
  const tagLabel = (tag: Tag) => (lang === 'ja' ? tag.name : tag.name_english)

  // Infer tags from title / publication name
  const inferTags = (p: any): Tag[] => {
    const text = (
      (p.titleJa || '') +
      (p.titleEn || '') +
      (p.publicationNameJa || '') +
      (p.publicationNameEn || '')
    ).toLowerCase()

    const res: Tag[] = []
    if (/lidar|点群/.test(text)) res.push(TAGS.find((t) => t === TAGS[0])!) // LiDAR
    if (/blockchain|ペイメント|channel/.test(text)) res.push(TAGS.find((t) => t === TAGS[1])!)
    if (/crowd|人数/.test(text)) res.push(TAGS.find((t) => t === TAGS[2])!)
    if (/v2x|vehicle|車両|車々|vehicular/.test(text)) res.push(TAGS.find((t) => t === TAGS[3])!)
    if (/wifi|wi-fi|csi/.test(text)) res.push(TAGS.find((t) => t === TAGS[4])!)
    if (res.length === 0) res.push(TAGS.find((t) => t === TAGS[5])!)
    return res
  }

  // Memoized enriched publication list
  const enriched = useMemo(() =>
    publications.map((p) => ({ ...p, tags: inferTags(p) })), [publications])

  // State for selected tags
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const filterByTag = (p: any) =>
    selectedTags.length === 0
      ? true
      : p.tags.some((t: Tag) => selectedTags.includes(t.name_english))

  // Group after filtering
  const grouped: Record<number, typeof enriched> = {}
  enriched.filter(filterByTag).forEach((p) => {
    if (!grouped[p.fiscalYear]) grouped[p.fiscalYear] = []
    grouped[p.fiscalYear].push(p)
  })

  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a)

  const formatAuthors = (authors: any[]) =>
    authors
      .filter(Boolean)
      .map((a) => (lang === 'ja' ? a.name : a.nameEnglish || a.name))
      .join(', ')

  const getTitle = (p: any) =>
    lang === 'ja' ? p.titleJa || p.titleEn : p.titleEn || p.titleJa

  const getDate = (p: any) => (lang === 'ja' ? p.dateJa || '' : p.dateEn || '')

  // Map tag to Unsplash keyword
  const tagImageMap: Record<string, string> = {
    LiDAR: 'lidar',
    Blockchain: 'blockchain',
    Crowd: 'crowd',
    V2X: 'vehicle',
    WiFi: 'wifi',
    Other: 'research',
  }

  const getImageForPub = (p: any) => {
    const firstTag = p.tags[0] as Tag
    const keyword = tagImageMap[firstTag.name_english] || 'research'
    return `https://source.unsplash.com/400x300?${keyword}`
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>

      {/* Tag filter */}
      <div className="filter-row">
        <span className="filter-label">{lang === 'ja' ? '絞り込み' : 'Filter'}</span>
        <button
          className={`tag-chip ${selectedTags.length === 0 ? 'selected' : ''}`}
          onClick={() => setSelectedTags([])}
        >
          All
        </button>
        {TAGS.map((t) => (
          <button
            key={t.name_english}
            className={`tag-chip ${selectedTags.includes(t.name_english) ? 'selected' : ''}`}
            onClick={() =>
              setSelectedTags((prev) =>
                prev.includes(t.name_english)
                  ? prev.filter((x) => x !== t.name_english)
                  : [...prev, t.name_english]
              )
            }
          >
            {tagLabel(t)}
          </button>
        ))}
      </div>

      {years.map((year) => (
        <div key={year} className="mb-10">
          <h2 className="section-title">{year}</h2>
          <div className="pub-grid">
            {grouped[year].map((p) => (
              <div key={p.id} className="pub-card">
                <img src={getImageForPub(p)} alt={getTitle(p)} />
                <div className="pub-meta">
                  <span className="pub-title">{getTitle(p)}</span>
                  <span className="pub-date">{getDate(p)}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.tags.map((t: Tag) => (
                      <span key={t.name_english} className="tag-badge">
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
  )
}

export default Publications 