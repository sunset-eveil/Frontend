import { useEffect, useRef, useState, type RefObject } from 'react';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 요소가 화면에 한 번이라도 들어왔는지 알려 준다. 모션 줄이기 설정이면 처음부터 true. */
export function useInView<Element extends HTMLElement>(threshold = 0.2): [RefObject<Element | null>, boolean] {
  const ref = useRef<Element>(null);
  const [isInView, setIsInView] = useState(() => typeof IntersectionObserver === 'undefined' || prefersReducedMotion());

  useEffect(() => {
    const element = ref.current;
    if (isInView || !element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);

    return (): void => observer.disconnect();
  }, [isInView, threshold]);

  return [ref, isInView];
}
