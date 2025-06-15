// Simple CSV parser (handles commas inside quotes minimally)
type RowObject = Record<string, string>;

const simpleCsvParse = (csv: string): RowObject[] => {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  const headers = lines[0]
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/) // split commas outside quotes
    .map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    const cells = line
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map((c) => c.replace(/^"|"$/g, "").trim());
    const obj: RowObject = {};
    headers.forEach((h, idx) => {
      obj[h] = cells[idx] ?? "";
    });
    return obj;
  });
};

import { Tag } from "@/models/tag";
import { Member } from "@/models/member";
import { Company } from "@/models/company";
import { Theme } from "@/models/theme";
import { Lecture } from "@/models/lecture";
import { NewsItem } from "@/models/news";
import { Publication } from "@/models/publication";

// NOTE: value is injected at build time for both server and client.
const BASE_PREFIX = process.env.NEXT_PUBLIC_BASE_PREFIX ?? "";

/* --------------------------------------------------
   CSV utility helpers
-------------------------------------------------- */
// Dynamically require fs only on the server / build-time to avoid bundler issues on client.
const readFileSync = (filePath: string): string => {
  try {
    // Using eval to conditionally require - keep type safety with typeof import("fs")
    const fs = (eval("require") as (m: string) => typeof import("fs"))("fs");
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    // In the browser we simply return an empty string (arrays fall back to [])
    return "";
  }
};

const parseCsv = <T extends Record<string, string>>(
  relativePath: string,
): T[] => {
  if (typeof window !== "undefined") {
    // Client-side: Fetch CSV synchronously (blocking) to keep API stable.
    // NOTE: Synchronous XHR is deprecated but acceptable here because the
    //       dataset is tiny and this runs only once at startup.
    try {
      const xhr = new XMLHttpRequest();
      // Determine basePath (if configured) from __NEXT_DATA__.
      // Next.js exposes basePath and assetPrefix in this global.
      // Fallback to empty string when undefined.
      const nextData: NextData =
        (globalThis as { __NEXT_DATA__?: NextData }).__NEXT_DATA__ ?? {};
      const candidate = (nextData.assetPrefix ??
        nextData.basePath ??
        BASE_PREFIX) as string;
      const basePath = candidate.replace(/\/$/, ""); // trim trailing slash
      // Remove leading "public/" so that the URL points to the static asset.
      const cleaned = relativePath.replace(/^public\//, "");
      // Ensure single slash separation.
      const url = `${basePath}/${cleaned}`.replace(/\/+/g, "/");
      xhr.open("GET", url, false); // synchronous
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        const raw = xhr.responseText;
        const parsed = simpleCsvParse(raw) as T[];
        return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  // Server-side / build-time – safe to use Node APIs.
  // Dynamically require path only on server
  const path = (eval("require") as (m: string) => typeof import("path"))(
    "path",
  );
  const absolute = path.join(process.cwd(), relativePath);
  const raw = readFileSync(absolute);
  if (!raw) return [];
  return simpleCsvParse(raw) as T[];
};

const toBool = (v: unknown): boolean => String(v).toLowerCase() === "true";
const toNum = (v: unknown): number => Number(v ?? 0);
const parseNumList = (v: unknown): number[] =>
  String(v ?? "")
    .split(/[,\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));

const imgPath = (folder: string, filename?: string): string => {
  if (!filename) return "";
  if (typeof window === "undefined") {
    // Server – prepend configured basePath from next.config.ts (hard-coded)
    const base = BASE_PREFIX;
    return `${base}/generated_contents/${folder}/${filename}`;
  }
  const nextData: NextData =
    (globalThis as { __NEXT_DATA__?: NextData }).__NEXT_DATA__ ?? {};
  const candidate2 = nextData.assetPrefix ?? nextData.basePath ?? BASE_PREFIX;
  const basePath2 = candidate2.replace(/\/$/, "");
  return `${basePath2}/generated_contents/${folder}/${filename}`;
};

/* --------------------------------------------------
   Tags
-------------------------------------------------- */
const tagsRaw = parseCsv<{
  id: string;
  name: string;
  name_english: string;
}>("public/generated_contents/tags/tags.csv");

export const tagsData: Tag[] = tagsRaw.map(
  (r) => new Tag(toNum(r.id), r.name, r.name_english),
);

/* --------------------------------------------------
   Members
-------------------------------------------------- */
const membersRaw = parseCsv<{
  id: string;
  name: string;
  desc: string;
  nameEnglish: string;
  descEnglish: string;
  thumbnail?: string;
  tagIds?: string;
  admissionYear: string;
  repeats?: string;
  graduated?: string;
  master?: string;
  bachelor?: string;
  gradYear?: string;
  url?: string;
}>("public/generated_contents/member/member.csv");

export const members: Member[] = membersRaw.map(
  (r) =>
    new Member(
      toNum(r.id),
      r.name,
      r.desc,
      r.nameEnglish,
      r.descEnglish,
      toNum(r.admissionYear),
      imgPath("member", r.thumbnail),
      parseNumList(r.tagIds),
      toNum(r.repeats),
      toBool(r.graduated),
      toBool(r.master),
      toBool(r.bachelor),
      r.gradYear ? toNum(r.gradYear) : undefined,
      r.url,
    ),
);

/* --------------------------------------------------
   Companies
-------------------------------------------------- */
const companiesRaw = parseCsv<{
  id: string;
  thumbnail?: string;
  nameJa: string;
  nameEn: string;
  year: string;
}>("public/generated_contents/company/company.csv");

export const companies: Company[] = companiesRaw.map(
  (r) =>
    new Company(
      toNum(r.id),
      imgPath("company", r.thumbnail),
      r.nameJa,
      r.nameEn,
      toNum(r.year),
    ),
);

/* --------------------------------------------------
   Themes
-------------------------------------------------- */
const themesRaw = parseCsv<{
  id: string;
  thumbnail?: string;
  titleJa: string;
  titleEn: string;
  descJa: string;
  descEn: string;
  url?: string;
}>("public/generated_contents/theme/theme.csv");

export const themes: Theme[] = themesRaw.map(
  (r) =>
    new Theme(
      toNum(r.id),
      imgPath("theme", r.thumbnail),
      r.titleJa,
      r.titleEn,
      r.descJa,
      r.descEn,
      r.url,
    ),
);

/* --------------------------------------------------
   Lectures
-------------------------------------------------- */
const lecturesRaw = parseCsv<{
  id: string;
  thumbnail?: string;
  titleJa: string;
  titleEn: string;
  descJa: string;
  descEn: string;
  url?: string;
}>("public/generated_contents/lecture/lecture.csv");

export const lectures: Lecture[] = lecturesRaw.map(
  (r) =>
    new Lecture(
      toNum(r.id),
      imgPath("lecture", r.thumbnail),
      r.titleJa,
      r.titleEn,
      r.descJa,
      r.descEn,
      r.url,
    ),
);

/* --------------------------------------------------
   News
-------------------------------------------------- */
const newsRaw = parseCsv<{
  id: string;
  date: string;
  textJa: string;
  textEn: string;
  thumbnail?: string;
  url?: string;
}>("public/generated_contents/news/news.csv");

export const newsItems: NewsItem[] = newsRaw.map(
  (r) =>
    new NewsItem(
      toNum(r.id),
      r.date.split(" ")[0] ?? r.date, // trim time part
      r.textJa,
      r.textEn,
      imgPath("news", r.thumbnail),
      r.url,
    ),
);

/* --------------------------------------------------
   Publications
-------------------------------------------------- */
const publicationsRaw = parseCsv<{
  id: string;
  fiscalYear: string;
  type: string;
  authorMemberIds: string;
  tagIds?: string;
  titleJa?: string;
  titleEn?: string;
  publicationNameJa?: string;
  publicationNameEn?: string;
  volume?: string;
  number?: string;
  pages?: string;
  dateJa?: string;
  dateEn?: string;
  locationJa?: string;
  locationEn?: string;
  notesJa?: string;
  notesEn?: string;
  thumbnail?: string;
  url?: string;
}>("public/generated_contents/publication/publication.csv");

export const publications: Publication[] = publicationsRaw.map(
  (r) =>
    new Publication(
      toNum(r.id),
      toNum(r.fiscalYear),
      r.type,
      parseNumList(r.authorMemberIds),
      parseNumList(r.tagIds),
      r.titleJa,
      r.titleEn,
      r.publicationNameJa,
      r.publicationNameEn,
      r.volume,
      r.number,
      r.pages,
      r.dateJa,
      r.dateEn,
      r.locationJa,
      r.locationEn,
      r.notesJa,
      r.notesEn,
      imgPath("publication", r.thumbnail),
      r.url,
    ),
);

/* --------------------------------------------------
   Misc
-------------------------------------------------- */
export const currentYear = new Date().getFullYear();

/* --------------------------------------------------
   Attach to globalThis so that modules that reference these variables 
   without explicit import still work (e.g., pages using `members`, `tagsData`, etc.)
-------------------------------------------------- */
interface GlobalWithData {
  tagsData: Tag[];
  members: Member[];
  companies: Company[];
  themes: Theme[];
  lectures: Lecture[];
  newsItems: NewsItem[];
  publications: Publication[];
  currentYear: number;
}

const g = globalThis as typeof globalThis & Partial<GlobalWithData>;

g.tagsData = tagsData;
g.members = members;
g.companies = companies;
g.themes = themes;
g.lectures = lectures;
g.newsItems = newsItems;
g.publications = publications;
g.currentYear = currentYear;

/* --------------------------------------------------
   Global type declarations so that TypeScript recognizes the globals
-------------------------------------------------- */
declare global {
  // eslint-disable-next-line no-var
  var tagsData: Tag[];
  // eslint-disable-next-line no-var
  var members: Member[];
  // eslint-disable-next-line no-var
  var companies: Company[];
  // eslint-disable-next-line no-var
  var themes: Theme[];
  // eslint-disable-next-line no-var
  var lectures: Lecture[];
  // eslint-disable-next-line no-var
  var newsItems: NewsItem[];
  // eslint-disable-next-line no-var
  var publications: Publication[];
  // eslint-disable-next-line no-var
  var currentYear: number;
}

// Mark file as a module so the above `declare global` takes effect
export {};

// Shape of Next.js global data injected into the page
interface NextData {
  assetPrefix?: string;
  basePath?: string;
}
