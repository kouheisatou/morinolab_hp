"use client";
import { useLang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { companies } from "@/common_resource";
import { Company } from "@/models/company";

// sort by year desc (numeric)
const sorted = [...companies].sort((a, b) => b.year - a.year);

// Group by year
const grouped: Record<number, Company[]> = {};
sorted.forEach((c) => {
  if (!grouped[c.year]) grouped[c.year] = [];
  grouped[c.year].push(c);
});
const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

export default function CareerPage() {
  const { lang } = useLang();
  const title = texts(lang).career.title;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
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
              {grouped[Number(y)].map((c) => (
                <div key={c.id} className="relative flex items-center gap-6">
                  <span className="absolute -left-3.5 w-7 h-7 rounded-full overflow-hidden shadow-md bg-white dark:bg-gray-800 flex items-center justify-center">
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt={c.nameEn}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </span>

                  <div className="neu-container flex-1 p-4">
                    <p className="font-semibold mb-1">
                      {
                        lang === "ja"
                          ? c.nameJa || c.nameEn // fallback to EN if JP missing
                          : c.nameEn || c.nameJa // fallback to JP if EN missing
                      }
                    </p>
                  </div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
