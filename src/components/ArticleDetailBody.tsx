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
    const url = `${basePrefix}/generated_contents/${type}/${id}/article.html`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.text();
      })
      .then((txt) => {
        // Extract <body> inner HTML
        const match = txt.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const bodyHtml = match ? match[1] : txt;
        // Prepend <base> for relative paths
        const basePath = `${basePrefix}/generated_contents/${type}/${id}/`;
        setHtml(`<base href="${basePath}">` + bodyHtml);
      })
      .catch((err: Error) => setError(err.message));
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
