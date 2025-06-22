// basePathを取得する関数
function getBasePath(): string {
  // ブラウザ環境でbasePathを検出
  if (typeof window !== 'undefined') {
    // URLから現在のbasePathを検出
    const pathname = window.location.pathname;
    if (pathname.startsWith('/morinolab_hp/') || pathname === '/morinolab_hp') {
      return '/morinolab_hp';
    }
    // dev:basepathコマンドで起動した場合のクエリパラメータからも検出
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('basepath') === 'true') {
      return '/morinolab_hp';
    }
  }

  // サーバー環境では環境変数を使用
  return process.env.BASEPATH_ENABLED === 'true' ? '/morinolab_hp' : '';
}

// 静的ファイルのパスにbasePathを付与する関数
function getStaticPath(path: string): string {
  const basePath = getBasePath();
  // 既にbasePathが含まれている場合は追加しない
  if (basePath && path.startsWith(basePath)) {
    return path;
  }
  return `${basePath}${path}`;
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
  keyAchievements: string;
  content?: string;
}

export interface Lecture {
  id: string;
  nameJa: string;
  nameEn: string;
  thumbnail: string;
  descJa: string;
  descEn: string;
  type: string;
  content?: string;
}

// ブラウザ側でファイルを非同期取得する関数
export async function fetchTextContent(url: string): Promise<string> {
  try {
    console.log(`Fetching: ${url}`);

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
        console.log(
          `Read from filesystem: ${fullPath}: ${content.length} characters`
        );
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
    console.log(`Fetched ${url}: ${text.length} characters`);
    return text;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return '';
  }
}

// 改良されたCSVパーサー
export function parseCSVContent(content: string): any[] {
  console.log('Parsing CSV content:', content.substring(0, 200) + '...');

  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    console.log('CSV has less than 2 lines');
    return [];
  }

  const headers = parseCSVLine(lines[0]);
  console.log('CSV headers:', headers);

  const rows = lines.slice(1);
  const result = rows.map((row, index) => {
    const values = parseCSVLine(row);
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });

  console.log(`Parsed ${result.length} rows from CSV`);
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

    const content = await fetchTextContent(
      getStaticPath(`/generated_contents/news/${id}/article.md`)
    );
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

    const content = await fetchTextContent(
      getStaticPath(`/generated_contents/member/${id}/article.md`)
    );
    return { ...member, content };
  } catch (error) {
    console.error(`Error loading team member detail ${id}:`, error);
    return null;
  }
}

// 出版物一覧を取得
export async function loadPublications(): Promise<Publication[]> {
  const content = await fetchTextContent(
    getStaticPath('/generated_contents/publication/publication.csv')
  );
  return parseCSVContent(content) as Publication[];
}

// 出版物詳細を取得
export async function loadPublicationDetail(
  id: string
): Promise<Publication | null> {
  try {
    const publications = await loadPublications();
    const publication = publications.find((pub) => pub.id === id);
    if (!publication) return null;

    const content = await fetchTextContent(
      getStaticPath(`/generated_contents/publication/${id}/article.md`)
    );
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

    const content = await fetchTextContent(
      getStaticPath(`/generated_contents/award/${id}/article.md`)
    );
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

    const content = await fetchTextContent(
      getStaticPath(`/generated_contents/theme/${id}/article.md`)
    );
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

    const content = await fetchTextContent(
      getStaticPath(`/generated_contents/lecture/${id}/article.md`)
    );
    return { ...lecture, content };
  } catch (error) {
    console.error(`Error loading lecture detail ${id}:`, error);
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
