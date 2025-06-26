'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ページ遷移時のスクロール位置デバッグログを出力するフック
 */
export function useScrollDebug() {
  const pathname = usePathname();

  // ページ遷移時のログ出力のみ
  useEffect(() => {
    // ローカルストレージの現在の状態を出力
    try {
      const positions = JSON.parse(
        localStorage.getItem('scrollPositions') || '{}'
      );
    } catch (error) {
      console.error('❌ [ScrollDebug] Failed to read stored positions:', error);
    }
  }, [pathname]);
}
