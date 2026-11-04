import { useEffect, useState, type ReactNode } from 'react';
import { useInView } from '../hooks/use-in-view';

type CountUpProps = {
  /** 최종 숫자 */
  to: number;
  /** 소수점 자리 수 */
  decimals?: number;
  /** 숫자 앞뒤에 붙는 글자 (예: '만+') */
  suffix?: string;
  duration?: number;
};

function format(value: number, decimals: number): string {
  return value.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** 화면에 들어오면 0부터 목표 숫자까지 올라간다. */
export function CountUp({ to, decimals = 0, suffix = '', duration = 1200 }: CountUpProps): ReactNode {
  const [ref, isInView] = useInView<HTMLSpanElement>(0.5);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number): void => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(to * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);

    return (): void => cancelAnimationFrame(frame);
  }, [isInView, to, duration]);

  return (
    <span ref={ref} css={{ fontVariantNumeric: 'tabular-nums' }}>
      {format(value, decimals)}
      {suffix}
    </span>
  );
}
