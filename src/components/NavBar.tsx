"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import type { Lang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { useState, useEffect } from "react";

const NavBar = () => {
  const { lang, setLanguage } = useLang();
  const t = texts(lang).navbar;
  const pathname = usePathname();

  // controls language dropdown
  const [langOpen, setLangOpen] = useState(false);
  // controls hamburger opened/closed
  const [menuOpen, setMenuOpen] = useState(false);

  // close dropdown when route changes / menu toggled
  useEffect(() => {
    setLangOpen(false);
  }, [pathname]);

  const links = [
    { path: "/home", label: t.Home },
    { path: "/members", label: t.Members },
    { path: "/access", label: t.Access },
    { path: "/publications", label: t.Publications },
    { path: "/class", label: t.Class },
    { path: "/career", label: t.Career },
  ];

  return (
    <nav className={`neu-navbar ${menuOpen ? "menu-open" : ""}`}>
      {/* Hamburger button – visible only on small screens via CSS */}
      <button
        className="neu-icon-btn hamburger"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen((o) => !o)}
      >
        ☰
      </button>

      {/* Brand text – shown only when hamburger visible */}
      <span className="brand">森野研究室</span>

      {/* Links & language toggle wrapper */}
      <div className="nav-links">
        {links.map(({ path, label }) => (
          <Link
            key={path}
            href={path}
            className={pathname === path ? "neu-link active" : "neu-link"}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
        <div className="lang-dropdown lang-toggle">
          <button
            className="neu-button"
            onClick={() => setLangOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
          >
            {t.Language} ▾
          </button>
          {langOpen && (
            <ul className="lang-menu" role="listbox">
              <li
                role="option"
                aria-selected={lang === "en"}
                onClick={() => {
                  setLanguage("en" as Lang);
                  setLangOpen(false);
                }}
              >
                English
              </li>
              <li
                role="option"
                aria-selected={lang === "ja"}
                onClick={() => {
                  setLanguage("ja" as Lang);
                  setLangOpen(false);
                }}
              >
                日本語
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
