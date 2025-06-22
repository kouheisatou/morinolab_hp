export const texts = {
  viewDetails: { ja: '詳細を見る', en: 'View Details' },
  readMore: { ja: '続きを読む', en: 'Read More' },
  loading: { ja: '読み込み中...', en: 'Loading...' },
  clear: { ja: 'クリア', en: 'Clear' },
  filterPublications: { ja: '出版物をフィルタ', en: 'Filter Publications' },
  clearAll: { ja: 'すべてクリア', en: 'Clear All' },
  filterByTag: { ja: 'タグで絞り込む', en: 'Filter by Tag' },
  filterByYear: { ja: '年度で絞り込む', en: 'Filter by Year' },
  filterByTags: { ja: '研究タグで絞り込む', en: 'Filter by Research Tags' },
};

export type TextKey = keyof typeof texts;

export function t(key: TextKey, locale: 'ja' | 'en'): string {
  return texts[key][locale];
}
