"use client";

import { useEffect, useState } from "react";

interface Props {
  type: string;
  id: string;
}

export default function ArticleDetailBody({ type, id }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const basePrefix = process.env.NEXT_PUBLIC_BASE_PREFIX ?? "";
    const basePath = `${basePrefix}/contents/${type}/${id}/`;

    const fetchContent = async () => {
      // 1. Try to fetch markdown first
      try {
        const mdUrl = `${basePath}article.md`;
        const mdRes = await fetch(mdUrl);
        if (mdRes.ok) {
          const mdText = await mdRes.text();
          // Dynamically import marked only on the client to avoid increasing bundle size unnecessarily
          const { marked } = await import("marked");
          const htmlStr = marked.parse(mdText);
          setHtml(`<base href="${basePath}">` + htmlStr);
          return; // Success – exit early
        }
      } catch (err) {
        // continue to html fallback
      }

      // 2. Fallback to legacy HTML file
      try {
        const htmlUrl = `${basePath}article.html`;
        const htmlRes = await fetch(htmlUrl);
        if (!htmlRes.ok) throw new Error(`${htmlRes.status} ${htmlRes.statusText}`);
        const txt = await htmlRes.text();
        // Extract <body> inner HTML if any
        const match = txt.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyHtml = match ? match[1] : txt;
        setHtml(`<base href="${basePath}">` + bodyHtml);
      } catch (err: unknown) {
        setError((err as Error).message ?? "Failed to load content");
      }
    };

    fetchContent();
  }, [type, id]);

  if (error) {
    return (
      <p className="text-center text-red-600 dark:text-red-400">{error}</p>
    );
  }

  if (!html) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-300">Loading…</p>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <article
        className="article-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
