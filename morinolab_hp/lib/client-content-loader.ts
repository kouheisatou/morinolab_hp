import { marked } from 'marked';

// basePath is controlled by the NEXT_PUBLIC_BASE_PATH environment variable.
// On the server, it uses process.env.NEXT_PUBLIC_BASE_PATH.
// On the client, it uses window.NEXT_PUBLIC_BASE_PATH (injected at build time by Next.js).
// If unset, it defaults to ''.

// マークダウンをHTMLに変換する関数
export async function parseMarkdown(markdown: string): Promise<string> {
  try {
    // markedの設定
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    const result = await marked(markdown);
    return result;
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return markdown; // エラーの場合は元のテキストを返す
  }
}

// basePathを取得する関数
function getBasePath(): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!basePath) return '';
  return basePath.startsWith('/') ? basePath : `/${basePath}`;
}

// 静的ファイルのパスにbasePathを付与する関数
function getStaticPath(path: string): string {
  const basePath = getBasePath();
  if (!basePath) return path;
  // 既にbasePathが含まれている場合は追加しない
  if (basePath && path.startsWith(basePath)) {
    return path;
  }
  // Avoid double slashes
  if (basePath.endsWith('/') && path.startsWith('/')) {
    return `${basePath}${path.slice(1)}`;
  }
  return `${basePath}${path}`;
}

// 画像パス用のエクスポート関数
export function getImagePath(path: string): string {
  return getStaticPath(path);
}

export interface NewsItem {
  id: string;
  nameJa: string;
  nameEn: string;
  thumbnail: string;
  date: string;
  content?: string;
}

export interface TeamMember {
  id: string;
  nameJa: string;
  nameEn: string;
  thumbnail: string;
  descJa: string;
  descEn: string;
  tagIds: string;
  memberTypeId: string;
  gradYear: string;
  content?: string;
}

export interface MemberType {
  id: string;
  nameJa: string;
  nameEn: string;
}

export interface Tag {
  id: string;
  nameJa: string;
  nameEn: string;
}

export interface Publication {
  id: string;
  authorMemberIds: string;
  tagIds: string;
  titleJa: string;
  titleEn: string;
  publicationNameJa: string;
  publicationNameEn: string;
  thumbnail: string;
  publishedDate: string;
  content?: string;
}

export interface Award {
  id: string;
  nameJa: string;
  nameEn: string;
  thumbnail: string;
  memberIds: string;
  date: string;
  content?: string;
}

export interface Theme {
  id: string;
  nameJa: string;
  nameEn: string;
  thumbnail: string;
  descJa: string;
  descEn: string;
  keyAchievementsJa: string;
  keyAchievementsEn: string;
  content?: string;
}

export interface Lecture {
  id: string;
  nameJa: string;
  nameEn: string;
  thumbnail: string;
  descJa: string;
  descEn: string;
  typeJa: string;
  typeEn: string;
  type?: string;
  content?: string;
}

export interface CareerItem {
  id: string;
  nameJa: string;
  nameEn: string;
  thumbnail: string;
  content?: string;
}

// ブラウザ側でファイルを非同期取得する関数
export async function fetchTextContent(url: string): Promise<string> {
  try {
    // サーバー環境での処理
    if (typeof window === 'undefined') {
      const fs = await import('fs');
      const path = await import('path');

      // URLからファイルパスを構築
      let filePath = url;
      if (filePath.startsWith('/morinolab_hp/')) {
        filePath = filePath.replace('/morinolab_hp/', '');
      }
      if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
      }

      const fullPath = path.join(process.cwd(), 'public', filePath);

      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return content;
      } catch (fsError) {
        console.error(`Error reading file ${fullPath}:`, fsError);
        return '';
      }
    }

    // ブラウザ環境での処理
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    return text;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return '';
  }
}

// 改良されたCSVパーサー
export function parseCSVContent(content: string): any[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    return [];
  }

  const headers = parseCSVLine(lines[0]);

  const rows = lines.slice(1);
  const result = rows.map((row, index) => {
    const values = parseCSVLine(row);
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });

  return result;
}

// CSVの1行をパースする関数（引用符とカンマを適切に処理）
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // エスケープされた引用符
        current += '"';
        i += 2;
      } else {
        // 引用符の開始/終了
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // フィールドの区切り
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // 最後のフィールドを追加
  result.push(current.trim());

  return result;
}

// ニュース一覧を取得
export async function loadNews(): Promise<NewsItem[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/news/news.csv')
  );
  return parseCSVContent(content) as NewsItem[];
}

// ニュース詳細を取得
export async function loadNewsDetail(id: string): Promise<NewsItem | null> {
  try {
    const items = await loadNews();
    const item = items.find((item) => item.id === id);
    if (!item) return null;

    const markdownContent = await fetchTextContent(
      getStaticPath(`/generated_contents/news/${id}/article.md`)
    );
    const content = await parseMarkdown(markdownContent);
    return { ...item, content };
  } catch (error) {
    console.error(`Error loading news detail ${id}:`, error);
    return null;
  }
}

// チームメンバー一覧を取得
export async function loadTeamMembers(): Promise<TeamMember[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/member/member.csv')
  );
  return parseCSVContent(content) as TeamMember[];
}

// チームメンバー詳細を取得
export async function loadTeamMemberDetail(
  id: string
): Promise<TeamMember | null> {
  try {
    const members = await loadTeamMembers();
    const member = members.find((member) => member.id === id);
    if (!member) return null;

    const markdownContent = await fetchTextContent(
      getStaticPath(`/generated_contents/member/${id}/article.md`)
    );
    const content = await parseMarkdown(markdownContent);
    return { ...member, content };
  } catch (error) {
    console.error(`Error loading team member detail ${id}:`, error);
    return null;
  }
}

// 論文一覧を取得
export async function loadPublications(): Promise<Publication[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/publication/publication.csv')
  );
  return parseCSVContent(content) as Publication[];
}

// 論文詳細を取得
export async function loadPublicationDetail(
  id: string
): Promise<Publication | null> {
  try {
    const publications = await loadPublications();
    const publication = publications.find((pub) => pub.id === id);
    if (!publication) return null;

    const markdownContent = await fetchTextContent(
      getStaticPath(`/generated_contents/publication/${id}/article.md`)
    );
    const content = await parseMarkdown(markdownContent);
    return { ...publication, content };
  } catch (error) {
    console.error(`Error loading publication detail ${id}:`, error);
    return null;
  }
}

// 受賞一覧を取得
export async function loadAwards(): Promise<Award[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/award/award.csv')
  );
  return parseCSVContent(content) as Award[];
}

// 受賞詳細を取得
export async function loadAwardDetail(id: string): Promise<Award | null> {
  try {
    const awards = await loadAwards();
    const award = awards.find((award) => award.id === id);
    if (!award) return null;

    const markdownContent = await fetchTextContent(
      getStaticPath(`/generated_contents/award/${id}/article.md`)
    );
    const content = await parseMarkdown(markdownContent);
    return { ...award, content };
  } catch (error) {
    console.error(`Error loading award detail ${id}:`, error);
    return null;
  }
}

// 研究テーマ一覧を取得
export async function loadThemes(): Promise<Theme[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/theme/theme.csv')
  );
  return parseCSVContent(content) as Theme[];
}

// 研究テーマ詳細を取得
export async function loadThemeDetail(id: string): Promise<Theme | null> {
  try {
    const themes = await loadThemes();
    const theme = themes.find((theme) => theme.id === id);
    if (!theme) return null;

    const markdownContent = await fetchTextContent(
      getStaticPath(`/generated_contents/theme/${id}/article.md`)
    );
    const content = await parseMarkdown(markdownContent);
    return { ...theme, content };
  } catch (error) {
    console.error(`Error loading theme detail ${id}:`, error);
    return null;
  }
}

// メンバータイプ一覧を取得
export async function loadMemberTypes(): Promise<MemberType[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/membertype/membertype.csv')
  );
  return parseCSVContent(content) as MemberType[];
}

// タグ一覧を取得
export async function loadTags(): Promise<Tag[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/tags/tags.csv')
  );
  return parseCSVContent(content) as Tag[];
}

// 講義一覧を取得
export async function loadLectures(): Promise<Lecture[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/lecture/lecture.csv')
  );
  return parseCSVContent(content) as Lecture[];
}

// 講義詳細を取得
export async function loadLectureDetail(id: string): Promise<Lecture | null> {
  try {
    const lectures = await loadLectures();
    const lecture = lectures.find((lecture) => lecture.id === id);
    if (!lecture) return null;

    const markdownContent = await fetchTextContent(
      getStaticPath(`/generated_contents/lecture/${id}/article.md`)
    );
    const content = await parseMarkdown(markdownContent);
    return { ...lecture, content };
  } catch (error) {
    console.error(`Error loading lecture detail ${id}:`, error);
    return null;
  }
}

// キャリア一覧を取得
export async function loadCareers(): Promise<CareerItem[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/career/career.csv')
  );
  return parseCSVContent(content) as CareerItem[];
}

// キャリア詳細（将来的な拡張用）
export async function loadCareerDetail(id: string): Promise<CareerItem | null> {
  try {
    const items = await loadCareers();
    const item = items.find((item) => item.id === id);
    if (!item) return null;

    // 詳細 Markdown があれば読み込む（存在しなければそのまま）
    const markdownContent = await fetchTextContent(
      getStaticPath(`/generated_contents/career/${id}/article.md`)
    );
    const content = markdownContent ? await parseMarkdown(markdownContent) : '';
    return { ...item, content };
  } catch (error) {
    console.error(`Error loading career detail ${id}:`, error);
    return null;
  }
}

// 画像パスにbasePathを付与するヘルパー関数をエクスポート
export { getStaticPath };

// ID取得用のヘルパー関数（generateStaticParamsで使用）
export async function getNewsIds(): Promise<string[]> {
  const news = await loadNews();
  return news.map((item) => item.id);
}

export async function getTeamMemberIds(): Promise<string[]> {
  const members = await loadTeamMembers();
  return members.map((member) => member.id);
}

export async function getPublicationIds(): Promise<string[]> {
  const publications = await loadPublications();
  return publications.map((pub) => pub.id);
}

export async function getAwardIds(): Promise<string[]> {
  const awards = await loadAwards();
  return awards.map((award) => award.id);
}

export async function getThemeIds(): Promise<string[]> {
  const themes = await loadThemes();
  return themes.map((theme) => theme.id);
}

export async function getLectureIds(): Promise<string[]> {
  const lectures = await loadLectures();
  return lectures.map((lecture) => lecture.id);
}
