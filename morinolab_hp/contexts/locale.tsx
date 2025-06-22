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

  // 初期化時に localStorage からロケールを読み込む（CSRのみ実行）
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('locale');
      if (stored === 'ja' || stored === 'en') {
        setLocaleState(stored);
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
