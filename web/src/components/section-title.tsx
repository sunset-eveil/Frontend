import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { colors } from '../styles/colors';
import { fonts } from '../styles/fonts';
import { media } from '../styles/layout';

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
  color: ${({ isDark }) => (isDark ? colors.mint : colors.primary)};
  font-size: 16px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const Title = styled.h2<{ isDark: boolean }>`
  color: ${({ isDark }) => (isDark ? colors.white : colors.heading)};
  font-size: 40px;
  font-weight: ${fonts.weight.extrabold};
  line-height: 54px;
  letter-spacing: -1.2px;

  ${media.mobile} {
    font-size: 28px;
    line-height: 38px;
    letter-spacing: -0.84px;
  }
`;

const Description = styled.p`
  color: ${colors.secondary};
  font-size: 18px;
  line-height: 30.6px;

  ${media.mobile} {
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
