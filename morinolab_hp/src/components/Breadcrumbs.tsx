"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageContext";

interface Props {
  type: string;
  id: string;
}

export default function Breadcrumbs({ type, id }: Props) {
  const { lang } = useLang();

  const labelMap: Record<string, { ja: string; en: string; href: string }> = {
    theme: { ja: "テーマ", en: "Theme", href: "/home#research" },
    news: { ja: "ニュース", en: "News", href: "/home#news" },
    publication: { ja: "研究業績", en: "Publications", href: "/publications" },
    lecture: { ja: "講義", en: "Class", href: "/class" },
    member: { ja: "メンバー", en: "Members", href: "/members" },
  };

  const rootLabel = lang === "ja" ? "ホーム" : "Home";
  const tInfo = labelMap[type] ?? { ja: type, en: type, href: "/" };
  const typeLabel = lang === "ja" ? tInfo.ja : tInfo.en;

  return (
    <nav className="text-sm mb-4" aria-label="Breadcrumb">
      <ol className="flex flex-wrap gap-1 text-gray-600 dark:text-gray-300">
        <li>
          <Link href="/" className="hover:underline">
            {rootLabel}
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href={tInfo.href} className="hover:underline">
            {typeLabel}
          </Link>
        </li>
        <li>/</li>
        <li className="text-gray-500 dark:text-gray-400">{id}</li>
      </ol>
    </nav>
  );
}
