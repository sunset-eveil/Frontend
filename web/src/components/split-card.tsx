import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { colors, shadows } from '../styles/colors';
import { media } from '../styles/layout';

type SplitCardProps = {
  copy: ReactNode;
  visual: ReactNode;
  footer?: ReactNode;
  height: number;
};

const Card = styled.div`
  overflow: hidden;
  border-radius: 20px;
  background: ${colors.white};
  box-shadow: ${shadows.panel};
`;

const Body = styled.div<{ bodyHeight: number }>`
  display: flex;
  min-height: ${({ bodyHeight }) => bodyHeight}px;

  ${media.mobile} {
    flex-direction: column;
    min-height: 0;
  }
`;

const Copy = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: 40px;

  ${media.mobile} {
    padding: 32px 24px;
  }
`;

const Visual = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 40px;
  overflow: hidden;
  background: ${colors.primaryDeep};

  &::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 320px;
    height: 320px;
    border: 1px solid ${colors.whiteAlpha14};
    border-radius: 50%;
  }

  ${media.mobile} {
    padding: 48px 24px;
  }
`;

/** 설치·온보딩 1단계에서 쓰는 '왼쪽 글 + 오른쪽 파란 일러스트' 카드 */
export function SplitCard({ copy, visual, footer, height }: SplitCardProps): ReactNode {
  return (
    <Card>
      <Body bodyHeight={height}>
        <Copy>{copy}</Copy>
        <Visual aria-hidden>{visual}</Visual>
      </Body>
      {footer}
    </Card>
  );
}

/** 파란 영역 위에 떠 있는 흰색 미니 카드 */
export const FloatingPanel = styled.div`
  position: relative;
  width: 100%;
  max-width: 300px;
  overflow: hidden;
  background: ${colors.white};
  box-shadow: ${shadows.floating};
`;
