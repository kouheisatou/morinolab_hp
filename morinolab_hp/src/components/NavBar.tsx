"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LanguageContext";
import type { Lang } from "@/components/LanguageContext";
import { texts } from "@/components/i18n";
import { useState, useEffect } from "react";

// Breakpoint (px) to switch to hamburger view; configurable via NEXT_PUBLIC_NAV_BREAKPOINT.
const NAV_BREAKPOINT: number = Number(
  process.env.NEXT_PUBLIC_NAV_BREAKPOINT ?? "1100",
);

const NavBar = () => {
  const { lang, setLanguage } = useLang();
  const t = texts(lang).navbar;
  const pathname = usePathname();

  // controls language dropdown
  const [langOpen, setLangOpen] = useState(false);
  // controls hamburger opened/closed
  const [menuOpen, setMenuOpen] = useState(false);

  // track if we are below breakpoint
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Update isMobile based on window width
  useEffect(() => {
    const check = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth <= NAV_BREAKPOINT);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    { path: "/awards", label: t.Awards },
  ];

  // When in `/articles/{type}/{id}` detail page, determine which nav tab to highlight.
  const normalizePath = (p: string): string => p.replace(/#.*$/, "");

  let activeAlias: string | null = null;
  if (pathname.startsWith("/articles/")) {
    const parts = pathname.split("/");
    const type = parts[2] ?? "";
    const map: Record<string, string> = {
      theme: "/home",
      news: "/home",
      member: "/members",
      publication: "/publications",
      lecture: "/class",
      award: "/awards",
    };
    activeAlias = map[type] ?? null;
  }

  return (
    <nav
      className={`neu-navbar ${menuOpen ? "menu-open" : ""} ${isMobile ? "mobile-view" : ""}`}
    >
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
        {links.map(({ path, label }) => {
          const isActive =
            pathname === path ||
            activeAlias === path ||
            normalizePath(pathname) === path;
          return (
            <Link
              key={path}
              href={path}
              className={isActive ? "neu-link active" : "neu-link"}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          );
        })}
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
