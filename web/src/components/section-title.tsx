import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { COLORS } from '../styles/colors';
import { FONTS } from '../styles/fonts';
import { MEDIA } from '../styles/layout';

type SectionTitleProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  tone?: 'light' | 'dark';
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
  text-align: center;
`;

const Eyebrow = styled.span<{ isDark: boolean }>`
  color: ${({ isDark }) => (isDark ? COLORS.mint : COLORS.primary)};
  font-size: 16px;
  font-weight: ${FONTS.weight.bold};
  line-height: normal;
`;

const Title = styled.h2<{ isDark: boolean }>`
  color: ${({ isDark }) => (isDark ? COLORS.white : COLORS.heading)};
  font-size: 40px;
  font-weight: ${FONTS.weight.extrabold};
  line-height: 54px;
  letter-spacing: -1.2px;

  ${MEDIA.mobile} {
    font-size: 28px;
    line-height: 38px;
    letter-spacing: -0.84px;
  }
`;

const Description = styled.p`
  color: ${COLORS.secondary};
  font-size: 18px;
  line-height: 30.6px;

  ${MEDIA.mobile} {
    font-size: 16px;
    line-height: 27px;
  }
`;

export function SectionTitle({ eyebrow, title, description, tone = 'light' }: SectionTitleProps): ReactNode {
  const isDark = tone === 'dark';

  return (
    <Wrapper>
      <Eyebrow isDark={isDark}>{eyebrow}</Eyebrow>
      <Title isDark={isDark}>{title}</Title>
      {description && <Description>{description}</Description>}
    </Wrapper>
  );
}
