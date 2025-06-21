"use client";
import { useLang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { loadAwards, loadMembers } from "@/app/dataLoader";
import { useState, useEffect } from "react";
import { Award } from "@/models/award";
import { Member } from "@/models/member";
import Link from "next/link";

export default function AwardsPage() {
  const { lang } = useLang();
  const title = texts(lang).awards.title;

  const [awards, setAwards] = useState<Award[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    Promise.all([loadAwards(), loadMembers()]).then(
      ([awardsData, membersData]) => {
        setAwards(awardsData);
        setMembers(membersData);
      },
    );
  }, []);

  // sort by date desc
  const sorted = [...awards].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  // Group by year
  const grouped: Record<number, Award[]> = {};
  sorted.forEach((c) => {
    if (!grouped[c.date.getFullYear()]) grouped[c.date.getFullYear()] = [];
    grouped[c.date.getFullYear()].push(c);
  });
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  // Helper function to get member names
  const getMemberNames = (memberIds: number[]): string => {
    const memberNames = memberIds
      .map((id) => {
        const member = members.find((m) => m.id === id);
        return member
          ? lang === "ja"
            ? member.name
            : member.nameEnglish
          : null;
      })
      .filter(Boolean);
    return memberNames.join(", ");
  };

  // Helper function to format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-10 text-center">{title}</h1>

      <div className="relative pl-10">
        {/* vertical line */}
        <span className="absolute left-4 top-0 h-full w-0.5 bg-gray-300 dark:bg-gray-700" />

        <ul className="space-y-10">
          {years.map((y) => (
            <li key={y} className="space-y-6">
              <h3
                key={`year-${y}`}
                className="font-bold text-lg text-accent mb-2"
              >
                {y}
              </h3>
              {grouped[Number(y)].map((award) => (
                <Link
                  key={award.id}
                  href={`/articles/award/${award.id}`}
                  className="neu-container clickable-card flex items-stretch overflow-hidden h-32"
                  style={{ padding: 0 }}
                >
                  <img
                    src={award.thumbnail || "img/noimage_theme.png"}
                    alt={lang === "ja" ? award.nameJa : award.nameEn}
                    className="object-cover w-[20%] h-full rounded-l-[var(--radius)] flex-none"
                    style={{ flexBasis: "20%" }}
                  />
                  <div className="flex flex-col gap-2 p-4 flex-1">
                    <span className="font-semibold text-lg">
                      {lang === "ja" ? award.nameJa : award.nameEn}
                    </span>

                    {award.memberIds.length > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">
                          {lang === "ja" ? "受賞者: " : "Recipients: "}
                        </span>
                        {getMemberNames(award.memberIds)}
                      </p>
                    )}

                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      <span className="font-medium">
                        {lang === "ja" ? "受賞日: " : "Date: "}
                      </span>
                      {formatDate(award.date)}
                    </p>
                  </div>
                </Link>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
