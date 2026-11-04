import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { COLORS } from '../../styles/colors';
import { FONTS } from '../../styles/fonts';
import { MEDIA } from '../../styles/layout';
import { HeroSection } from './hero-section';
import { ProblemSection } from './problem-section';
import { ProcessSection } from './process-section';
import { ProofSection } from './proof-section';
import { SolutionSection } from './solution-section';
import { StartActions } from './start-actions';

const ClosingSection = styled.section`
  background: ${COLORS.primaryDeep};
`;

const ClosingInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  align-items: center;
  max-width: 1180px;
  margin: 0 auto;
  padding: 88px 24px;
  text-align: center;

  ${MEDIA.mobile} {
    padding: 72px 16px;
  }
`;

const ClosingTitle = styled.h2`
  color: ${COLORS.white};
  font-size: 40px;
  font-weight: ${FONTS.weight.extrabold};
  line-height: 54px;
  letter-spacing: -1.2px;

  ${MEDIA.mobile} {
    font-size: 28px;
    line-height: 38px;
  }
`;

export function LandingPage(): ReactNode {
  return (
    <>
      <SiteHeader variant="landing" />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <ProofSection />
        <ProcessSection />
        <ClosingSection>
          <ClosingInner>
            <ClosingTitle>오늘부터, 걱정 없이 ChatGPT를 쓰세요</ClosingTitle>
            <StartActions justify="center" />
          </ClosingInner>
        </ClosingSection>
      </main>
      <SiteFooter />
    </>
  );
}
