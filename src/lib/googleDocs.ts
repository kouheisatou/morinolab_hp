import { JSDOM } from "jsdom";

export interface DocContent {
  paragraphs: string[];
  images: string[]; // image URLs
  html: string; // raw sanitized html string
}

function extractIdFromUrl(url: string): string | null {
  const m = url.match(/\/d\/(.+?)\//);
  return m ? m[1] : null;
}

/**
 * Fetch Google Docs content as HTML and extract basic text + images.
 * The doc must be shared as "Anyone with the link (Viewer)".
 */
export async function fetchGoogleDocContent(url: string): Promise<DocContent> {
  const id = extractIdFromUrl(url);
  if (!id) throw new Error("Invalid Google Docs URL");

  const exportUrl = `https://docs.google.com/document/d/${id}/export?format=html`;
  const res = await fetch(exportUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch document. HTTP ${res.status}`);
  }
  const html = await res.text();

  // parse with JSDOM (server) or DOMParser (browser)
  let root: Document;
  if (typeof window === "undefined") {
    root = new JSDOM(html).window.document;
  } else {
    root = new DOMParser().parseFromString(html, "text/html");
  }

  const paragraphs: string[] = [];
  root.querySelectorAll("p").forEach((p) => {
    const text = p.textContent?.trim();
    if (text) paragraphs.push(text);
  });

  const images: string[] = [];
  root.querySelectorAll("img").forEach((img) => {
    const src = (img as HTMLImageElement).src;
    if (src) images.push(src);
  });

  return { paragraphs, images, html };
}
