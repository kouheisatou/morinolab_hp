import { Client } from "@notionhq/client";
import { Theme } from "@/models/theme";
import { NewsItem } from "@/models/news";
import { Lecture } from "@/models/lecture";
import { Member } from "@/models/member";
import { Company } from "@/models/company";
import { Publication } from "@/models/publication";
import { Tag } from "@/models/tag";

/*
  NOTE: ──────────────────────────────────────────────────────────────────────────
  This file encapsulates all access to Notion.
  It is designed to keep the public API surface identical to the previous
  sheetLoader so that existing pages can continue to import `themes`, `members`,
  etc. without modifications.

  • Provide one database per entity type.
  • IDs are supplied via environment variables – see below.
  • The mapping logic assumes property names that match the column headers used
    in the public Morino-Lab HP Notion workspace. Adjust the names if your
    schema differs.
*/

/* ========================================================================== */
/* 0️⃣  Notion client helper                                                   */
/* ========================================================================== */

const NOTION_TOKEN = process.env.NOTION_TOKEN;

if (!NOTION_TOKEN) {
  console.warn(
    "[notionLoader]  WARN: process.env.NOTION_TOKEN is not defined – returning empty datasets."
  );
}

const notion = new Client({ auth: NOTION_TOKEN });

/* ========================================================================== */
/* 1️⃣  Utility helpers                                                        */
/* ========================================================================== */

// Gracefully read a Notion property regardless of its exact type.
// Returns undefined when unavailable.
function getProp<T = unknown>(page: any, key: string): T | undefined {
  const prop = page.properties?.[key];
  if (!prop) return undefined as T;

  switch (prop.type) {
    case "title":
      return (prop.title[0]?.plain_text ?? "") as T;
    case "rich_text":
      return (prop.rich_text[0]?.plain_text ?? "") as T;
    case "files":
      return (prop.files[0]?.[prop.files[0].type]?.url ?? "") as T;
    case "url":
      return (prop.url ?? "") as T;
    case "number":
      return prop.number as T;
    case "multi_select":
      return prop.multi_select.map((o: any) => o.name) as T;
    case "checkbox":
      return prop.checkbox as T;
    default:
      return undefined as T;
  }
}

// Safe integer parsing with fallback
const asInt = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/* ========================================================================== */
/* 2️⃣  Themes                                                                 */
/* ========================================================================== */

const DB_THEME = process.env.NOTION_DB_THEME;

async function fetchThemes(): Promise<Theme[]> {
  if (!NOTION_TOKEN || !DB_THEME) return [];
  const pages = await notion.databases.query({ database_id: DB_THEME });
  return pages.results.map((page: any, idx: number) => {
    const id = asInt(getProp<number>(page, "ID"), idx + 1);
    return new Theme(
      id,
      String(getProp(page, "Thumbnail") ?? ""),
      String(getProp(page, "TitleJa") ?? ""),
      String(getProp(page, "TitleEn") ?? ""),
      String(getProp(page, "DescJa") ?? ""),
      String(getProp(page, "DescEn") ?? ""),
      String(getProp(page, "URL") ?? "") || undefined,
    );
  });
}

/* ========================================================================== */
/* 3️⃣  News                                                                   */
/* ========================================================================== */

const DB_NEWS = process.env.NOTION_DB_NEWS;

async function fetchNews(): Promise<NewsItem[]> {
  if (!NOTION_TOKEN || !DB_NEWS) return [];
  const pages = await notion.databases.query({
    database_id: DB_NEWS,
    sorts: [{ property: "Date", direction: "descending" }],
  });
  return pages.results.map((page: any, idx: number) => {
    const id = asInt(getProp<number>(page, "ID"), idx + 1);
    return new NewsItem(
      id,
      String(getProp(page, "Date") ?? ""),
      String(getProp(page, "TextJa") ?? ""),
      String(getProp(page, "TextEn") ?? ""),
      String(getProp(page, "Thumbnail") ?? "") || undefined,
      String(getProp(page, "URL") ?? "") || undefined,
    );
  });
}

/* ========================================================================== */
/* 4️⃣  Lectures                                                               */
/* ========================================================================== */

const DB_LECTURE = process.env.NOTION_DB_LECTURE;

async function fetchLectures(): Promise<Lecture[]> {
  if (!NOTION_TOKEN || !DB_LECTURE) return [];
  const pages = await notion.databases.query({ database_id: DB_LECTURE });
  return pages.results.map((page: any, idx: number) => {
    const id = asInt(getProp<number>(page, "ID"), idx + 1);
    return new Lecture(
      id,
      String(getProp(page, "Thumbnail") ?? ""),
      String(getProp(page, "TitleJa") ?? ""),
      String(getProp(page, "TitleEn") ?? ""),
      String(getProp(page, "DescJa") ?? ""),
      String(getProp(page, "DescEn") ?? ""),
      String(getProp(page, "URL") ?? "") || undefined,
    );
  });
}

/* ========================================================================== */
/* 5️⃣  Members                                                                */
/* ========================================================================== */

const DB_MEMBER = process.env.NOTION_DB_MEMBER;

async function fetchMembers(): Promise<Member[]> {
  if (!NOTION_TOKEN || !DB_MEMBER) return [];
  const pages = await notion.databases.query({ database_id: DB_MEMBER });

  return pages.results.map((page: any, idx: number) => {
    // Many optional fields – adjust names as needed
    const id = asInt(getProp<number>(page, "ID"), idx + 1);
    const admissionYear = asInt(getProp<number>(page, "AdmissionYear"), 0);
    return new Member(
      id,
      String(getProp(page, "NameJa") ?? ""),
      String(getProp(page, "DescJa") ?? ""),
      String(getProp(page, "NameEn") ?? ""),
      String(getProp(page, "DescEn") ?? ""),
      admissionYear,
      String(getProp(page, "Thumbnail") ?? "") || undefined,
      [], // tagIds will be populated later
      asInt(getProp<number>(page, "Repeats"), 0),
      Boolean(getProp(page, "Graduated")),
      Boolean(getProp(page, "Master")),
      Boolean(getProp(page, "Bachelor")),
      asInt(getProp<number>(page, "GradYear"), undefined as unknown as number),
      String(getProp(page, "URL") ?? "") || undefined,
    );
  });
}

/* ========================================================================== */
/* 6️⃣  Companies (Career)                                                     */
/* ========================================================================== */

const DB_COMPANY = process.env.NOTION_DB_COMPANY;

async function fetchCompanies(): Promise<Company[]> {
  if (!NOTION_TOKEN || !DB_COMPANY) return [];
  const pages = await notion.databases.query({ database_id: DB_COMPANY });
  return pages.results.map((page: any, idx: number) => {
    const id = asInt(getProp<number>(page, "ID"), idx + 1);
    return new Company(
      id,
      String(getProp(page, "Thumbnail") ?? "") || "",
      String(getProp(page, "NameJa") ?? ""),
      String(getProp(page, "NameEn") ?? ""),
      asInt(getProp<number>(page, "Year"), 0),
    );
  });
}

/* ========================================================================== */
/* 7️⃣  Publications                                                           */
/* ========================================================================== */

const DB_PUBLICATION = process.env.NOTION_DB_PUBLICATION;

async function fetchPublications(): Promise<Publication[]> {
  if (!NOTION_TOKEN || !DB_PUBLICATION) return [];
  const pages = await notion.databases.query({ database_id: DB_PUBLICATION });

  return pages.results.map((page: any, idx: number) => {
    const id = asInt(getProp<number>(page, "ID"), idx + 1);
    const tagIds: number[] = []; // to be resolved via Tag fetch later

    return new Publication(
      id,
      asInt(getProp<number>(page, "FiscalYear"), 0),
      String(getProp(page, "Type") ?? ""),
      [], // authorMemberIds – map later as they may reference Members
      tagIds,
      String(getProp(page, "TitleJa") ?? ""),
      String(getProp(page, "TitleEn") ?? ""),
      String(getProp(page, "PublicationNameJa") ?? ""),
      String(getProp(page, "PublicationNameEn") ?? ""),
      String(getProp(page, "Volume") ?? ""),
      String(getProp(page, "Number") ?? ""),
      String(getProp(page, "Pages") ?? ""),
      String(getProp(page, "DateJa") ?? ""),
      String(getProp(page, "DateEn") ?? ""),
      String(getProp(page, "LocationJa") ?? ""),
      String(getProp(page, "LocationEn") ?? ""),
      String(getProp(page, "NotesJa") ?? ""),
      String(getProp(page, "NotesEn") ?? ""),
      String(getProp(page, "Thumbnail") ?? "") || undefined,
      String(getProp(page, "URL") ?? "") || undefined,
    );
  });
}

/* ========================================================================== */
/* 8️⃣  Tags                                                                   */
/* ========================================================================== */

const DB_TAG = process.env.NOTION_DB_TAG;

async function fetchTags(): Promise<Tag[]> {
  if (!NOTION_TOKEN || !DB_TAG) return [];
  const pages = await notion.databases.query({ database_id: DB_TAG });
  return pages.results.map((page: any, idx: number) => {
    const id = asInt(getProp<number>(page, "ID"), idx + 1);
    return new Tag(
      id,
      String(getProp(page, "NameJa") ?? ""),
      String(getProp(page, "NameEn") ?? ""),
    );
  });
}

/* ========================================================================== */
/* 9️⃣  Legacy-style exports (top-level await)                                  */
/* ========================================================================== */

export const [themes, newsItems, lectures, members, companies, publications, tags] = await (async () => {
  if (!NOTION_TOKEN) {
    return [[], [], [], [], [], [], []] as const;
  }
  const [th, ne, le, me, co, pu, ta] = await Promise.all([
    fetchThemes(),
    fetchNews(),
    fetchLectures(),
    fetchMembers(),
    fetchCompanies(),
    fetchPublications(),
    fetchTags(),
  ]);

  return [th, ne, le, me, co, pu, ta] as const;
})();

/*
  By exporting the resolved arrays we keep the consumer side synchronous –
  any component can just `import { themes } from "@/lib/notionLoader"`.
  Next.js will resolve the top-level await during build/SSR.
*/

export const currentYear = new Date().getFullYear(); 