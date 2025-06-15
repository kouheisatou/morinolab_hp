import { Member } from "@/models/member";
import { NewsItem } from "@/models/news";
import { Publication } from "@/models/publication";
import { Tag } from "@/models/tag";
import { Theme } from "@/models/theme";
import { Lecture } from "@/models/lecture";
import { Company } from "@/models/company";

/**
 * Parse a single CSV line respecting quoted fields.
 */
function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "\"") {
      // Handle escaped quotes ("") inside a quoted field
      if (inQuotes && line[i + 1] === "\"") {
        current += "\"";
        i++; // Skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

/**
 * Convert raw CSV text into an array of objects keyed by the header row.
 */
function parseCSV(content: string): Array<Record<string, string>> {
  const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) return [];

  const headers = parseLine(lines[0]).map((h) => h.trim());
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] ?? "";
    });
    rows.push(obj);
  }

  return rows;
}

/**
 * Load and parse a CSV file, returning a list of model objects.
 *
 * Usage:
 *   interface Member { id: string; name: string; age: string; }
 *   const members = await loadCsv<Member>("public/data/members.csv");
 */
async function loadCsv(filePath: string): Promise<Record<string, string>[]> {
  let content: string;

  if (typeof window === "undefined") {
    // --- Server side: use Node fs to read local file system ---
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    content = await fs.readFile(absolutePath, "utf-8");
  } else {
    // --- Client side: fetch the file over HTTP(S). When a relative path is
    // provided, assume it is deployed under the public directory and therefore
    // reachable from the site root.
    const url = filePath.startsWith("/") ? filePath : `/${filePath}`;
    const res = await fetch(process.env.NEXT_PUBLIC_BASE_PREFIX + url);
    if (!res.ok) {
      throw new Error(`Failed to fetch CSV: ${url} – ${res.status}`);
    }
    content = await res.text();
  }

  const rows = parseCSV(content);
  return rows;
}

export async function loadTags(): Promise<Tag[]> {
  const rows = await loadCsv("/generated_contents/tags/tags.csv");
  return rows.map((r) => new Tag(Number(r.id), r.name, r.name_english));
}

// Utility helpers -----------------------------------------------------------
const parseBool = (v: string | undefined): boolean =>
  ["true", "1", "yes", "y", "True", "TRUE"].includes(
    (v ?? "").toString().trim(),
  );

const parseIdList = (v: string | undefined): number[] =>
  (v ?? "")
    .split(/\s*\|\s*|,|;|\s+/)
    .filter((s) => s)
    .map((s) => Number(s))
    .filter((n) => !Number.isNaN(n));

export async function loadMembers(): Promise<Member[]> {
  const rows = await loadCsv("/generated_contents/member/member.csv");
  return rows.map((r) =>
    new Member(
      Number(r.id),
      r.name,
      r.desc,
      r.nameEnglish,
      r.descEnglish,
      Number(r.admissionYear),
      r.thumbnail,
      parseIdList(r.tagIds),
      Number(r.repeats ?? 0),
      parseBool(r.graduated),
      parseBool(r.master),
      parseBool(r.bachelor),
      r.gradYear ? Number(r.gradYear) : undefined,
      r.url,
    ),
  );
}

export async function loadPublications(): Promise<Publication[]> {
  const rows = await loadCsv("/generated_contents/publication/publication.csv");
  return rows.map((r) =>
    new Publication(
      Number(r.id),
      Number(r.fiscalYear),
      r.type,
      parseIdList(r.authorMemberIds),
      parseIdList(r.tagIds),
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
      r.thumbnail || undefined,
      r.url || undefined,
    ),
  );
}

// Corrected loadThemes and loadNews constructor argument order ------------

export async function loadThemes(): Promise<Theme[]> {
  const rows = await loadCsv("/generated_contents/theme/theme.csv");
  return rows.map((r) =>
    new Theme(
      Number(r.id),
      r.thumbnail,
      r.titleJa,
      r.titleEn,
      r.descJa,
      r.descEn,
      r.url,
    ),
  );
}

export async function loadNews(): Promise<NewsItem[]> {
  const rows = await loadCsv("/generated_contents/news/news.csv");
  return rows.map((r) =>
    new NewsItem(
      Number(r.id),
      r.date,
      r.textJa,
      r.textEn,
      r.thumbnail,
      r.url,
    ),
  );
}

export async function loadLectures(): Promise<Lecture[]> {
  const rows = await loadCsv("/generated_contents/lecture/lecture.csv");
  return rows.map((r) =>
    new Lecture(
      Number(r.id),
      r.thumbnail,
      r.titleJa,
      r.titleEn,
      r.descJa,
      r.descEn,
      r.url,
    ),
  );
}

export async function loadCompanies(): Promise<Company[]> {
  const rows = await loadCsv("/generated_contents/company/company.csv");
  return rows.map((r) =>
    new Company(
      Number(r.id),
      r.thumbnail,
      r.nameJa,
      r.nameEn,
      Number(r.year),
    ),
  );
}

// Re-export utility types that might help callers.
export type CSVRow = Record<string, string>; 