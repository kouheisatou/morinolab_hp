"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import type { Lang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { useState } from "react";

const NavBar = () => {
  const { lang, setLanguage } = useLang();
  const t = texts(lang).navbar;
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const links = [
    { path: "/home", label: t.Home },
    { path: "/members", label: t.Members },
    { path: "/access", label: t.Access },
    { path: "/publications", label: t.Publications },
    { path: "/class", label: t.Class },
    { path: "/career", label: t.Career },
  ];

  return (
    <nav className="neu-navbar">
      {links.map(({ path, label }) => (
        <Link
          key={path}
          href={path}
          className={pathname === path ? "neu-link active" : "neu-link"}
        >
          {label}
        </Link>
      ))}
      <div className="lang-dropdown lang-toggle">
        <button
          className="neu-button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {t.Language} ▾
        </button>
        {open && (
          <ul className="lang-menu" role="listbox">
            <li
              role="option"
              aria-selected={lang === "en"}
              onClick={() => {
                setLanguage("en" as Lang);
                setOpen(false);
              }}
            >
              English
            </li>
            <li
              role="option"
              aria-selected={lang === "ja"}
              onClick={() => {
                setLanguage("ja" as Lang);
                setOpen(false);
              }}
            >
              日本語
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
