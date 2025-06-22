'use client';

import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  options: {
    forceVisible?: boolean;
    threshold?: number;
    rootMargin?: string;
  } = {}
) {
  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(options.forceVisible ?? true);

  useEffect(() => {
    // forceVisibleが有効な場合はアニメーションをスキップ
    if (options.forceVisible) {
      setIsVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    // 要素の初期位置をチェック
    const checkInitialVisibility = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 画面上部にある要素（画面の80%以内）は表示
      if (rect.top <= windowHeight * 0.8) {
        setIsVisible(true);
        return true;
      } else {
        // 画面外の要素は非表示にしてアニメーション待機
        setIsVisible(false);
        return false;
      }
    };

    // DOMが完全に読み込まれた後にチェック
    const timeoutId = setTimeout(() => {
      if (checkInitialVisibility()) {
        return; // 既に表示されている場合はIntersectionObserverを設定しない
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        {
          threshold: options.threshold ?? 0.1,
          rootMargin: options.rootMargin ?? '-50px 0px',
        }
      );

      observer.observe(element);

      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    }, 150);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [options.forceVisible, options.threshold, options.rootMargin]);

  return { elementRef, isVisible };
}

export function useParallaxScroll() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
}
