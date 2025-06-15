// ArticleDetailPage – static placeholder (AppBar handled by RootLayout)

import fs from "fs";
import path from "path";
import { themes, newsItems, members, publications, lectures } from "@/app/data";
import ArticleDetailBody from "@/components/ArticleDetailBody";
import Breadcrumbs from "@/components/Breadcrumbs";

// Build-time: Generate all combinations of `type` and `id` found
// under contents/articles/{type}/*.docx so that `next export`
// can pre-render static HTML for every article detail page.
export const dynamicParams = false;

export const generateStaticParams = () => {
  const CONTENT_ROOT = path.join(process.cwd(), "contents", "articles");

  const params: { type: string; id: string }[] = [];

  // 1) IDs from data arrays --------------------------------------------------
  const push = (type: string, id: number | string) => {
    params.push({ type, id: String(id) });
  };

  themes.forEach((t) => push("theme", t.id));
  newsItems.forEach((n) => push("news", n.id));
  members.forEach((m) => push("member", m.id));
  publications.forEach((p) => push("publication", p.id));
  lectures.forEach((l) => push("lecture", l.id));

  // Manually include professor (id 0) used only in members/page.tsx
  push("member", 0);

  try {
    const types = fs
      .readdirSync(CONTENT_ROOT, { withFileTypes: true })
      .filter((d: fs.Dirent) => d.isDirectory())
      .map((d) => d.name);

    for (const type of types) {
      const dir = path.join(CONTENT_ROOT, type);
      const files = fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((f: fs.Dirent) => f.isFile() && f.name.endsWith(".docx"))
        .map((f: fs.Dirent) => f.name.replace(/\.docx$/, ""));
      for (const id of files) params.push({ type, id });
    }
  } catch {
    /* no content directory */
  }

  // Remove potential duplicates
  const unique = new Map(params.map((p) => [p.type + "/" + p.id, p]));
  return Array.from(unique.values());
};

interface PageProps {
  params: {
    type: string;
    id: string;
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { type, id } = await Promise.resolve(params);
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs type={type} id={id} />
      <ArticleDetailBody type={type} id={id} />
    </div>
  );
}
