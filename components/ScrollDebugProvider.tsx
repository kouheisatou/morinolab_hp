'use client';

import { useScrollDebug } from '@/hooks/use-scroll-debug';
import { useScrollPosition } from '@/contexts/scroll-position';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

/**
 * スクロール位置のデバッグ機能を有効にするコンポーネント
 * アプリケーション全体でスクロール位置の保存・復元・デバッグログを管理します
 */
export function ScrollDebugProvider({ children }: Props) {
  // スクロール位置の詳細デバッグ
  useScrollDebug();

  // スクロール位置管理機能
  const { saveScrollPosition, restoreScrollPosition, getScrollPosition } =
    useScrollPosition();

  // 開発モードでのデバッグ情報出力
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // グローバルなデバッグ関数を追加（開発時のみ）
      (window as any).scrollDebug = {
        save: saveScrollPosition,
        restore: restoreScrollPosition,
        get: getScrollPosition,
        clear: () => {
          localStorage.removeItem('scrollPositions');
        },
        show: () => {
          try {
            const positions = JSON.parse(
              localStorage.getItem('scrollPositions') || '{}'
            );
            console.table(positions);
          } catch (error) {
            console.error('❌ [ScrollDebug] Failed to show positions:', error);
          }
        },
      };
    }
  }, [saveScrollPosition, restoreScrollPosition, getScrollPosition]);

  return <>{children}</>;
}
