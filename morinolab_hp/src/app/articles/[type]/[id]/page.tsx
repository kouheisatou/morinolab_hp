// ArticleDetailPage – static placeholder (AppBar handled by RootLayout)

import fs from "fs";
import path from "path";
import ArticleDetailBody from "@/components/ArticleDetailBody";
import Breadcrumbs from "@/components/Breadcrumbs";

// Build-time: Generate all combinations of `type` and `id` found
// under generated_contents/articles/{type}/*.docx so that `next export`
// can pre-render static HTML for every article detail page.
export const dynamicParams = false;

// Add route segment config to statically render in environments where output: "export" sometimes mis-detects generateStaticParams
export const dynamic = "force-static";

export async function generateStaticParams() {
  // The generated markdown/HTML files live under
  //   public/generated_contents/{type}/{id}/...
  // so we need to look inside that directory to enumerate all combinations
  // that actually exist.
  const CONTENT_ROOT = path.join(process.cwd(), "public", "generated_contents");

  const params: { type: string; id: string }[] = [];

  try {
    const types = fs
      .readdirSync(CONTENT_ROOT, { withFileTypes: true })
      .filter((d: fs.Dirent) => d.isDirectory())
      .map((d) => d.name);

    for (const type of types) {
      const dir = path.join(CONTENT_ROOT, type);
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      // Case 1: legacy .docx files (kept for backward compatibility)
      for (const f of entries) {
        if (f.isFile() && f.name.endsWith(".docx")) {
          const id = f.name.replace(/\.docx$/, "");
          params.push({ type, id });
        }
      }

      // Case 2: new pipeline – each article is placed under a numeric folder
      for (const f of entries) {
        if (f.isDirectory() && /^\d+$/.test(f.name)) {
          params.push({ type, id: f.name });
        }
      }
    }
  } catch {
    /* no content directory */
  }

  // Remove potential duplicates
  const unique = new Map(params.map((p) => [p.type + "/" + p.id, p]));
  return Array.from(unique.values());
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type, id } = await params;
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs type={type} id={id} />
      <ArticleDetailBody type={type} id={id} />
    </div>
  );
}
