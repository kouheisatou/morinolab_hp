import { Member } from "./models/member";
import { Tag } from "./models/tag";
import { Publication } from "./models/publication";
import { Company } from "./models/company";
import { Lecture } from "./models/lecture";
import { Theme } from "./models/theme";
import { NewsItem } from "./models/news";
import { fetchObjects } from "./lib/googleSheets";

export const currentYear = new Date().getFullYear();

/* -----------------------------  TAGS  ----------------------------- */
async function loadTags(): Promise<Tag[]> {
  const rows = await fetchObjects<any>("Tags");
  return rows.map((r) => ({
    id: Number(r.id),
    name: r.name,
    name_english: r.name_english,
  }));
}
export const TAGS: Tag[] = await loadTags();
export const TAG_OTHER: Tag = TAGS.find((t) => t.name_english === "Other")!;

/* ---------------------------  MEMBERS  ---------------------------- */
async function loadMembers(): Promise<Member[]> {
  const rows = await fetchObjects<any>("Members");
  const tagMap = new Map(TAGS.map((t) => [t.name_english, t]));
  const parseBool = (v: any) => v === "TRUE" || v === "true" || v === "1";
  return rows.map((r) => {
    const tags: Tag[] = (r.tags || "")
      .split(/[,\s]+/)
      .map((name: string) => tagMap.get(name))
      .filter(Boolean) as Tag[];

    return new Member(
      Number(r.id),
      r.name,
      r.desc,
      r.nameEnglish,
      r.descEnglish,
      Number(r.admissionYear),
      r.img || undefined,
      tags,
      Number(r.repeats ?? 0),
      parseBool(r.master),
      parseBool(r.active),
      parseBool(r.graduated),
      r.gradYear ? Number(r.gradYear) : undefined,
      r.url || undefined,
    );
  });
}
export const members: Member[] = await loadMembers();

/* -------------------------  PUBLICATIONS  ------------------------- */
async function loadPublications(): Promise<Publication[]> {
  const rows = await fetchObjects<any>("Publications");
  return rows.map((r) =>
  new Publication(
      Number(r.id),
      Number(r.year),
      r.type,
      (r.authors ?? "").split(/[,、]+/),
      r.titleJa || undefined,
      r.titleEn || undefined,
      r.publicationNameJa || undefined,
      r.publicationNameEn || undefined,
      r.volume || undefined,
      r.number || undefined,
      r.pages || undefined,
      r.dateJa || undefined,
      r.dateEn || undefined,
      r.locationJa || undefined,
      r.locationEn || undefined,
      r.notesJa || undefined,
      r.notesEn || undefined,
      r.imagePath || undefined,
      r.url || undefined,
    ),
  );
}
export const publications: Publication[] = await loadPublications();

/* ----------------------------  CAREER  ---------------------------- */
async function loadCompanies(): Promise<Company[]> {
  const rows = await fetchObjects<any>("Companies");
  return rows.map(
    (r) =>
  new Company(
        Number(r.id),
        r.logo || r.img,
        r.name_jp,
        r.name_en,
        Number(r.year),
      ),
  );
}
export const companies: Company[] = await loadCompanies();

/* ----------------------------  CLASS  ----------------------------- */
async function loadLectures(): Promise<Lecture[]> {
  const rows = await fetchObjects<any>("Lectures");
  return rows.map(
    (r) =>
  new Lecture(
        Number(r.id),
        r.img,
        r.titleJa,
        r.titleEn,
        r.descJa,
        r.descEn,
        r.url || undefined,
      ),
  );
}
export const lectures: Lecture[] = await loadLectures();

/* ----------------------------  THEMES ----------------------------- */
async function loadThemes(): Promise<Theme[]> {
  const rows = await fetchObjects<any>("Themes");
  return rows.map(
    (r) =>
  new Theme(
        Number(r.id),
        r.img,
        r.titleJa,
        r.titleEn,
        r.descJa,
        r.descEn,
        r.url || undefined,
      ),
  );
}
export const themes: Theme[] = await loadThemes();

/* -----------------------------  NEWS  ----------------------------- */
async function loadNews(): Promise<NewsItem[]> {
  const rows = await fetchObjects<any>("News");
  return rows.map(
    (r) =>
  new NewsItem(
        Number(r.id),
        r.date,
        r.title_jp,
        r.title_en,
        r.img,
        r.url || undefined,
      ),
  );
}
export const newsItems: NewsItem[] = await loadNews(); 