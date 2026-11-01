import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { useInView } from '../hooks/use-in-view';

type RevealProps = {
  children: ReactNode;
  /** 같은 줄의 카드들을 차례로 등장시킬 때 쓰는 지연 시간(ms) */
  delay?: number;
  className?: string;
};

const Wrapper = styled.div<{ isShown: boolean; delay: number }>`
  min-width: 0;
  opacity: ${({ isShown }) => (isShown ? 1 : 0)};
  transform: translateY(${({ isShown }) => (isShown ? 0 : 24)}px);
  transition:
    opacity 0.6s ease ${({ delay }) => delay}ms,
    transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) ${({ delay }) => delay}ms;
`;

/** 스크롤해서 화면에 들어오면 아래에서 살짝 떠오르며 나타난다. */
export function Reveal({ children, delay = 0, className }: RevealProps): ReactNode {
  const [ref, isInView] = useInView<HTMLDivElement>(0.15);

  return (
    <Wrapper ref={ref} isShown={isInView} delay={delay} className={className}>
      {children}
    </Wrapper>
  );
}
