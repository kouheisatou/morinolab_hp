import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ScrollPosition {
  x: number;
  y: number;
}

const scrollPositions = new Map<string, ScrollPosition>();

export function useScrollPosition() {
  const router = useRouter();
  const currentPath = useRef<string>('');

  // スクロール位置を保存
  const saveScrollPosition = (path?: string) => {
    const pathToSave = path || currentPath.current;
    if (pathToSave && typeof window !== 'undefined') {
      scrollPositions.set(pathToSave, {
        x: window.scrollX,
        y: window.scrollY,
      });
    }
  };

  // スクロール位置を復元
  const restoreScrollPosition = (path: string) => {
    if (typeof window !== 'undefined') {
      const savedPosition = scrollPositions.get(path);
      if (savedPosition) {
        // 少し遅延してスクロール位置を復元（ページレンダリング後）
        setTimeout(() => {
          window.scrollTo({
            left: savedPosition.x,
            top: savedPosition.y,
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  };

  // 特定のセクションにスクロール
  const scrollToSection = (sectionId: string) => {
    if (typeof window !== 'undefined') {
      // 現在のページがホームページでない場合、ホームページに移動してからスクロール
      if (
        window.location.pathname !== '/' &&
        window.location.pathname !== '/morinolab_hp' &&
        window.location.pathname !== '/morinolab_hp/'
      ) {
        // 現在の位置を保存
        saveScrollPosition(window.location.pathname);

        // ホームページに移動してセクションIDをハッシュとして追加
        router.push(`/#${sectionId}`);

        // ページロード後にスクロール
        setTimeout(() => {
          const element = document.querySelector(`#${sectionId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      } else {
        // 既にホームページにいる場合は直接スクロール
        const element = document.querySelector(`#${sectionId}`) as HTMLElement;
        if (element) {
          // スクロールオフセットを考慮（ナビバーの高さ分）
          const elementPosition = element.offsetTop - 80; // ナビバーの高さ分を引く
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth',
          });
        }
      }
    }
  };

  // ナビゲーション用のヘルパー関数
  const navigateWithScroll = (
    path: string,
    options?: { restoreScroll?: boolean }
  ) => {
    if (typeof window !== 'undefined') {
      // 現在の位置を保存
      saveScrollPosition(window.location.pathname);

      // 新しいページに移動
      router.push(path);

      // 必要に応じてスクロール位置を復元
      if (options?.restoreScroll) {
        restoreScrollPosition(path);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      currentPath.current = window.location.pathname;

      // ページ離脱時にスクロール位置を保存
      const handleBeforeUnload = () => {
        saveScrollPosition();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, []);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    scrollToSection,
    navigateWithScroll,
  };
}
