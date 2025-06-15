"use client";

import { useEffect, useState } from "react";

interface ArticleDetailClientProps {
  type: string;
  id: string;
}

/**
 * Client-side component that fetches the pre-generated HTML for an article and renders it.
 *
 * The HTML is generated ahead of time by `src/scripts/generate_contents.sh` and placed under:
 *   public/generated_contents/{type}/{id}/article.html
 */
export default function ArticleDetailClient({
  type,
  id,
}: ArticleDetailClientProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const basePrefix = process.env.NEXT_PUBLIC_BASE_PREFIX ?? "";
    const url = `${basePrefix}/generated_contents/${type}/${id}/article.html`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load: ${url}`);
        return res.text();
      })
      .then((text) => {
        if (!isMounted) return;

        const basePath = `${basePrefix}/generated_contents/${type}/${id}/`;
        // Prepend <base> tag so that relative URLs (images, links) resolve correctly.
        const wrapped = `<base href="${basePath}">` + text;
        setHtml(wrapped);
      })
      .catch((err) => {
        if (isMounted) setError(err as Error);
      });

    return () => {
      isMounted = false;
    };
  }, [type, id]);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center text-red-600 dark:text-red-400">
        {error.message}
      </div>
    );
  }

  if (!html) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-gray-500 dark:text-gray-300">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <article
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
