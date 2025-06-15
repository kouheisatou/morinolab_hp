import { Member } from "../models/member";
import { Tag } from "../models/tag";
import { Publication } from "../models/publication";
import { Company } from "../models/company";
import { Lecture } from "../models/lecture";
import { Theme } from "../models/theme";
import { NewsItem } from "../models/news";
import { fetchObjects } from "./googleSheets";
import { toNum, toNumOpt, toStr, toBool, splitNumList } from "./safeParse";

export const currentYear = new Date().getFullYear();

/* -----------------------------  TAGS  ----------------------------- */
async function loadTags(): Promise<Tag[]> {
  const rows = await fetchObjects("Tags");
  return rows.map((row, idx) => {
    const r = row as Record<string, unknown>;
    return new Tag(
      toNum(r.id, idx),
      toStr(r.name, ""),
      toStr(r.nameEnglish, toStr(r.name, "")),
    );
  });
}
export const tags: Tag[] = await loadTags();

/* ---------------------------  MEMBERS  ---------------------------- */
async function loadMembers(): Promise<Member[]> {
  const rows = await fetchObjects("Members");
  return rows.map((row, idx) => {
    const r = row as Record<string, unknown>;

    const tagIds = splitNumList(r.tagIds ?? "");

    return new Member(
      toNum(r.id, idx),
      toStr(r.name, ""),
      toStr(r.desc, ""),
      toStr(r.nameEnglish, toStr(r.name, "")),
      toStr(r.descEnglish, toStr(r.desc, "")),
      toNum(r.admissionYear, currentYear),
      toStr(r.img),
      tagIds,
      toNum(r.repeats, 0),
      toBool(r.graduated),
      toBool(r.master),
      toBool(r.active),
      toNumOpt(r.gradYear),
      toStr(r.url),
    );
  });
}
export const members: Member[] = await loadMembers();

/* -------------------------  PUBLICATIONS  ------------------------- */
async function loadPublications(): Promise<Publication[]> {
  const rows = await fetchObjects("Publications");
  return rows.map((row, idx) => {
    const r = row as Record<string, unknown>;
    return new Publication(
      toNum(r.id, idx),
      toNum(r.year, currentYear),
      toStr(r.type, ""),
      splitNumList(r.authorMemberIds),
      splitNumList(r.tagIds),
      toStr(r.titleJa),
      toStr(r.titleEn),
      toStr(r.publicationNameJa),
      toStr(r.publicationNameEn),
      toStr(r.volume),
      toStr(r.number),
      toStr(r.pages),
      toStr(r.dateJa),
      toStr(r.dateEn),
      toStr(r.locationJa),
      toStr(r.locationEn),
      toStr(r.notesJa),
      toStr(r.notesEn),
      toStr(r.imagePath),
      toStr(r.url),
    );
  });
}
export const publications: Publication[] = await loadPublications();

/* ----------------------------  CAREER  ---------------------------- */
async function loadCompanies(): Promise<Company[]> {
  const rows = await fetchObjects("Companies");
  return rows.map((row, idx) => {
    const r = row as Record<string, unknown>;
    return new Company(
      toNum(r.id, idx),
      toStr(r.logo, ""),
      toStr(r.nameJa, ""),
      toStr(r.nameEn, ""),
      toNum(r.year, currentYear),
    );
  });
}
export const companies: Company[] = await loadCompanies();

/* ----------------------------  CLASS  ----------------------------- */
async function loadLectures(): Promise<Lecture[]> {
  const rows = await fetchObjects("Lectures");
  return rows.map((row, idx) => {
    const r = row as Record<string, unknown>;
    return new Lecture(
      toNum(r.id, idx),
      toStr(r.img, ""),
      toStr(r.titleJa, ""),
      toStr(r.titleEn, ""),
      toStr(r.descJa, ""),
      toStr(r.descEn, ""),
      toStr(r.url),
    );
  });
}
export const lectures: Lecture[] = await loadLectures();

/* ----------------------------  THEMES ----------------------------- */
async function loadThemes(): Promise<Theme[]> {
  const rows = await fetchObjects("Themes");
  return rows.map((row, idx) => {
    const r = row as Record<string, unknown>;
    return new Theme(
      toNum(r.id, idx),
      toStr(r.img, ""),
      toStr(r.titleJa, ""),
      toStr(r.titleEn, ""),
      toStr(r.descJa, ""),
      toStr(r.descEn, ""),
      toStr(r.url),
    );
  });
}
export const themes: Theme[] = await loadThemes();

/* -----------------------------  NEWS  ----------------------------- */
async function loadNews(): Promise<NewsItem[]> {
  const rows = await fetchObjects("News");
  return rows.map((row, idx) => {
    const r = row as Record<string, unknown>;
    return new NewsItem(
      toNum(r.id, idx),
      toStr(r.date, ""),
      toStr(r.textJa, ""),
      toStr(r.textEn, ""),
      toStr(r.img),
      toStr(r.url),
    );
  });
}
export const newsItems: NewsItem[] = await loadNews();
