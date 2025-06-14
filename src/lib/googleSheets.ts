import { parse } from "csv-parse/sync";

/**
 * Small utility to pull data from a public Google Spreadsheet.
 *
 * Publish the sheet to the web OR set its sharing option to
 * "Anyone with the link (Viewer)" so that the CSV export endpoint can be fetched
 * without authentication.
 *
 * The spreadsheet id is expected to be supplied via the `NEXT_PUBLIC_GOOGLE_SHEET_ID` env var.
 * Each logical table must be placed on its own sheet (tab) and have the first row
 * as headers.  The helper converts every row into an object whose keys are the
 * header titles.
 */

const SHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;

if (!SHEET_ID) {
  throw new Error(
    "Environment variable NEXT_PUBLIC_GOOGLE_SHEET_ID is not defined. Please set it to the id portion of your spreadsheet URL.",
  );
}

/**
 * Fetches the raw CSV text from a given sheet (tab) name.
 * The sheet MUST be publicly readable.
 */
async function fetchCsv(sheetName: string): Promise<string> {
  const encodedName = encodeURIComponent(sheetName);
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodedName}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet: ${sheetName}. HTTP ${res.status}`);
  }
  return res.text();
}

/**
 * Fetch a sheet and return it as an array of objects (rows).
 * Each property is coerced to string; consumers are responsible for type casting.
 */
export async function fetchObjects<
  T = Record<string, string | number | boolean>,
>(sheetName: string): Promise<T[]> {
  const csvText = await fetchCsv(sheetName);
  // csv-parse/sync auto-detects line endings and quotes.
  const records: string[][] = parse(csvText, {
    columns: false,
    skip_empty_lines: true,
  });

  const [headerRow, ...dataRows] = records;
  const headers = headerRow.map((h) => h.trim());

  const extractImageUrl = (cell: string): string => {
    const match = cell.match(/=IMAGE\(\s*"([^"]+)"/i);
    if (match) {
      return match[1];
    }
    return cell;
  };

  return dataRows.map((row) => {
    const obj: Record<string, string | number | boolean> = {};
    headers.forEach((h, idx) => {
      const raw = row[idx] ?? "";
      obj[h] = extractImageUrl(raw);
    });
    return obj as T;
  });
}
