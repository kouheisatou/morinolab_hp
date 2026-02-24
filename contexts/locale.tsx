'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// 型定義
interface LocaleContextValue {
  locale: 'ja' | 'en';
  /** 手動で言語を切り替える */
  toggleLocale: () => void;
  /** 明示的にロケールを設定する */
  setLocale: (l: 'ja' | 'en') => void;
}

// デフォルト値は undefined にして、Provider 外で hook を呼んだ場合にエラーを投げる
const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

/**
 * アプリ全体で利用するロケールコンテキストの Provider
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<'ja' | 'en'>('ja');

  // 初期化時に localStorage → ブラウザ言語 の順でロケールを決定
  useEffect(() => {
    try {
      // 1) localStorage に保存された値があれば最優先
      const stored = window.localStorage.getItem('locale');
      if (stored === 'ja' || stored === 'en') {
        setLocaleState(stored);
        return;
      }

      // 2) ブラウザの優先言語設定を確認
      const navLang =
        navigator.language || (navigator.languages && navigator.languages[0]);
      if (navLang) {
        const primary = navLang.toLowerCase().slice(0, 2);
        const detected = primary === 'ja' ? 'ja' : 'en';
        setLocaleState(detected as 'ja' | 'en');
        // persist for future visits
        window.localStorage.setItem('locale', detected);
      }
    } catch (e) {
      // localStorage が使えない環境では何もしない
    }
  }, []);

  // ロケールをトグルする
  const toggleLocale = () => {
    setLocaleState((prev) => {
      const next = prev === 'ja' ? 'en' : 'ja';
      try {
        window.localStorage.setItem('locale', next);
      } catch (_) {
        // ignore
      }
      return next;
    });
  };

  // 明示的に設定するユーティリティ
  const setLocale = (l: 'ja' | 'en') => {
    setLocaleState(l);
    try {
      window.localStorage.setItem('locale', l);
    } catch (_) {
      // ignore
    }
  };

  const value: LocaleContextValue = {
    locale,
    toggleLocale,
    setLocale,
  };

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/**
 * ロケールコンテキストを利用するカスタムフック
 */
export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
