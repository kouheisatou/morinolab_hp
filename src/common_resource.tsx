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
  const rows = await fetchObjects("Tags");
  return rows.map((row) => {
    const r = row as Record<string, string>;
    return new Tag(Number(r.id), r.name, r.name_english);
  });
}
export const tags: Tag[] = await loadTags();

/* ---------------------------  MEMBERS  ---------------------------- */
async function loadMembers(): Promise<Member[]> {
  const rows = await fetchObjects("Members");
  const parseBool = (v: string | number | boolean | undefined) => {
    if (typeof v === "boolean") return v;
    if (v === undefined) return false;
    const str = String(v).toLowerCase();
    return str === "true" || str === "1" || str === "yes";
  };
  return rows.map((row) => {
    const r = row as Record<string, string>;
    const tag_ids: number[] = (r.tag_ids || "")
      .split(/[|,\s]+/)
      .filter(Boolean)
      .map((id) => Number(id));

    return new Member(
      Number(r.id),
      r.name,
      r.desc,
      r.nameEnglish,
      r.descEnglish,
      Number(r.admissionYear),
      r.img || undefined,
      tag_ids,
      Number(r.repeats ?? 0),
      parseBool(r.graduated),
      parseBool(r.master),
      parseBool(r.active),
      r.gradYear ? Number(r.gradYear) : undefined,
      r.url || undefined,
    );
  });
}
export const members: Member[] = await loadMembers();

/* -------------------------  PUBLICATIONS  ------------------------- */
async function loadPublications(): Promise<Publication[]> {
  const rows = await fetchObjects("Publications");
  return rows.map((row) => {
    const r = row as Record<string, string>;
    return new Publication(
      Number(r.id),
      Number(r.year),
      r.type ?? "",
      (r.author_member_ids || "")
        .split(/[|,\s]+/)
        .filter(Boolean)
        .map((id) => Number(id)),
      (r.tag_ids || "")
        .split(/[|,\s]+/)
        .filter(Boolean)
        .map((id) => Number(id)),
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
    );
  });
}
export const publications: Publication[] = await loadPublications();

/* ----------------------------  CAREER  ---------------------------- */
async function loadCompanies(): Promise<Company[]> {
  const rows = await fetchObjects("Companies");
  return rows.map((row) => {
    const r = row as Record<string, string>;
    return new Company(
      Number(r.id),
      r.logo || r.img || "",
      r.name_jp,
      r.name_en,
      Number(r.year),
    );
  });
}
export const companies: Company[] = await loadCompanies();

/* ----------------------------  CLASS  ----------------------------- */
async function loadLectures(): Promise<Lecture[]> {
  const rows = await fetchObjects("Lectures");
  return rows.map((row) => {
    const r = row as Record<string, string>;
    return new Lecture(
      Number(r.id),
      r.img || "",
      r.titleJa,
      r.titleEn,
      r.descJa,
      r.descEn,
      r.url || undefined,
    );
  });
}
export const lectures: Lecture[] = await loadLectures();

/* ----------------------------  THEMES ----------------------------- */
async function loadThemes(): Promise<Theme[]> {
  const rows = await fetchObjects("Themes");
  return rows.map((row) => {
    const r = row as Record<string, string>;
    return new Theme(
      Number(r.id),
      r.img || "",
      r.titleJa,
      r.titleEn,
      r.descJa,
      r.descEn,
      r.url || undefined,
    );
  });
}
export const themes: Theme[] = await loadThemes();

/* -----------------------------  NEWS  ----------------------------- */
async function loadNews(): Promise<NewsItem[]> {
  const rows = await fetchObjects("News");
  return rows.map((row) => {
    const r = row as Record<string, string>;
    return new NewsItem(
      Number(r.id),
      r.date,
      r.title_jp || r.textJa || "",
      r.title_en || r.textEn || "",
      r.img,
      r.url || undefined,
    );
  });
}
export const newsItems: NewsItem[] = await loadNews();
