'use client';

import React, { createContext, useContext, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface ScrollPositionContextType {
  saveScrollPosition: () => void;
  restoreScrollPosition: () => void;
  getScrollPosition: (path: string) => number;
}

const ScrollPositionContext = createContext<ScrollPositionContextType | null>(
  null
);

interface Props {
  children: React.ReactNode;
}

/**
 * スクロール位置を管理するコンテキストプロバイダー
 * ページ遷移時にスクロール位置をlocalStorageに保存し、復元する
 */
export function ScrollPositionProvider({ children }: Props) {
  const pathname = usePathname();
  const previousPathname = useRef<string>('');
  const scrollPositions = useRef<Map<string, number>>(new Map());

  // localStorageからスクロール位置を読み込む
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('scrollPositions');
      if (saved) {
        const parsed = JSON.parse(saved);
        scrollPositions.current = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error(
        '❌ [ScrollPosition] Failed to load scroll positions:',
        error
      );
    }
  }, []);

  // スクロール位置を保存する関数（その場のwindow.scrollYを保存）
  const saveScrollPosition = () => {
    const scrollY = window.scrollY;
    const path = previousPathname.current || pathname;
    scrollPositions.current.set(path, scrollY);
    try {
      const positionsObject = Object.fromEntries(scrollPositions.current);
      localStorage.setItem('scrollPositions', JSON.stringify(positionsObject));
    } catch (error) {
      console.error(
        '❌ [ScrollPosition] Failed to save scroll position:',
        error
      );
    }
  };

  // スクロール位置を復元する関数
  const restoreScrollPosition = () => {
    const savedPosition = scrollPositions.current.get(pathname) || 0;
    setTimeout(() => {
      window.scrollTo(0, savedPosition);
    }, 100);
  };

  // 指定されたパスのスクロール位置を取得する関数
  const getScrollPosition = (path: string): number => {
    return scrollPositions.current.get(path) || 0;
  };

  React.useEffect(() => {
    if (previousPathname.current && previousPathname.current !== pathname) {
      if (!window.location.hash) {
        restoreScrollPosition();
      }
    }
    previousPathname.current = pathname;
  }, [pathname]);

  // ページ離脱時にスクロール位置を保存
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      const scrollY = window.scrollY;
      scrollPositions.current.set(pathname, scrollY);
      try {
        const positionsObject = Object.fromEntries(scrollPositions.current);
        localStorage.setItem(
          'scrollPositions',
          JSON.stringify(positionsObject)
        );
      } catch (error) {
        console.error('❌ [ScrollPosition] Failed to save on unload:', error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const scrollY = window.scrollY;
        scrollPositions.current.set(pathname, scrollY);
        try {
          const positionsObject = Object.fromEntries(scrollPositions.current);
          localStorage.setItem(
            'scrollPositions',
            JSON.stringify(positionsObject)
          );
        } catch (error) {
          console.error(
            '❌ [ScrollPosition] Failed to save on visibility change:',
            error
          );
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  const value: ScrollPositionContextType = {
    saveScrollPosition,
    restoreScrollPosition,
    getScrollPosition,
  };

  return (
    <ScrollPositionContext.Provider value={value}>
      {children}
    </ScrollPositionContext.Provider>
  );
}

/**
 * スクロール位置コンテキストを使用するフック
 */
export function useScrollPosition() {
  const context = useContext(ScrollPositionContext);
  if (!context) {
    throw new Error(
      'useScrollPosition must be used within a ScrollPositionProvider'
    );
  }
  return context;
}
