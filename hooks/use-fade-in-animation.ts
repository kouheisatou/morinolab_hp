'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface FadeInOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
  duration?: number;
  translateY?: number;
  scale?: number;
  forceVisible?: boolean;
}

export function useFadeInAnimation<T extends HTMLElement = HTMLElement>(
  options: FadeInOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    delay = 0,
    duration = 800,
    translateY = 30,
    scale = 0.95,
  } = options;

  const elementRef = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(options.forceVisible ?? false);
  const [hasAnimated, setHasAnimated] = useState(options.forceVisible ?? false);

  // Callback ref to ensure observer is attached even if the element appears later (e.g., after async data fetch)
  const setRef = useCallback(
    (node: T | null) => {
      if (!node) return;
      elementRef.current = node;

      // If already animated or forced visible, skip observer
      if (options.forceVisible || hasAnimated) {
        setIsVisible(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
            observer.disconnect();
          }
        },
        {
          threshold,
          rootMargin,
        }
      );

      observer.observe(node);
    },
    [threshold, rootMargin, delay, options.forceVisible, hasAnimated]
  );

  const animationStyles = {
    transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? 'translateY(0px) scale(1)'
      : `translateY(${translateY}px) scale(${scale})`,
  };

  return {
    ref: setRef,
    elementRef: setRef,
    isVisible,
    style: animationStyles,
  };
}

export function useStaggeredFadeIn<T extends HTMLElement = HTMLElement>(
  count: number,
  baseDelay: number = 0,
  staggerDelay: number = 100,
  options: Omit<FadeInOptions, 'delay'> = {}
) {
  const elements = Array.from({ length: count }, (_, index) =>
    useFadeInAnimation<T>({
      ...options,
      delay: baseDelay + index * staggerDelay,
    })
  );

  return elements;
}

export function useSlideInAnimation<T extends HTMLElement = HTMLElement>(
  direction: 'left' | 'right' | 'up' | 'down' = 'up',
  options: Omit<FadeInOptions, 'translateY'> = {}
) {
  const getTransform = (direction: string, distance: number = 50) => {
    switch (direction) {
      case 'left':
        return `translateX(-${distance}px)`;
      case 'right':
        return `translateX(${distance}px)`;
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      default:
        return `translateY(${distance}px)`;
    }
  };

  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    delay = 0,
    duration = 800,
    scale = 1,
  } = options;

  const elementRef = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, delay);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, delay, hasAnimated]);

  const animationStyles = {
    transition: `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? 'translateX(0px) translateY(0px) scale(1)'
      : `${getTransform(direction)} scale(${scale})`,
  };

  return {
    ref: elementRef,
    isVisible,
    style: animationStyles,
  };
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
