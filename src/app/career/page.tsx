"use client";
import { useLang } from '@/components/LanguageContext';
import { texts } from '@/components/i18n';

const companies = [
  {
    logo: 'img/sample/trophy.png',
    nameJa: '株式会社NTTドコモ',
    nameEn: 'NTT DOCOMO',
    year: '2024',
  },
  {
    logo: 'img/sample/blockchain.png',
    nameJa: 'ソフトバンク株式会社',
    nameEn: 'SoftBank Corp.',
    year: '2023',
  },
  {
    logo: 'img/sample/network.png',
    nameJa: '楽天モバイル株式会社',
    nameEn: 'Rakuten Mobile, Inc.',
    year: '2023',
  },
  {
    logo: 'img/sample/lidar.png',
    nameJa: '富士通株式会社',
    nameEn: 'Fujitsu Limited',
    year: '2022',
  },
  {
    logo: 'img/sample/hero.png',
    nameJa: 'キーエンス株式会社',
    nameEn: 'Keyence Corporation',
    year: '2025',
  },
  {
    logo: 'img/sample/opencampus.png',
    nameJa: 'KDDI株式会社',
    nameEn: 'KDDI Corporation',
    year: '2024',
  },
  {
    logo: 'img/sample/orientation.png',
    nameJa: 'パナソニックホールディングス株式会社',
    nameEn: 'Panasonic Holdings Corporation',
    year: '2023',
  },
];

// sort by year desc
const sorted = [...companies].sort((a,b)=>b.year.localeCompare(a.year));

// Group by year
const grouped: Record<string, typeof companies> = {} as any;
sorted.forEach(c=>{
  if(!grouped[c.year]) grouped[c.year]=[];
  grouped[c.year].push(c);
});
const years = Object.keys(grouped).sort((a,b)=>b.localeCompare(a));

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
          {years.map((y)=>(
            <li key={y} className="space-y-6">
              <h3 className="font-bold text-lg text-accent mb-2">{y}</h3>
              {grouped[y].map((c)=>(
                <div key={c.nameEn} className="relative flex items-center gap-6">
                  <span className="absolute -left-3.5 w-7 h-7 rounded-full overflow-hidden shadow-md bg-white dark:bg-gray-800 flex items-center justify-center">
                    <img src={c.logo} alt={c.nameEn} className="w-full h-full object-cover" />
                  </span>

                  <div className="neu-container flex-1 p-4">
                    <p className="font-semibold mb-1">
                      {lang==='ja'?c.nameJa:c.nameEn}
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