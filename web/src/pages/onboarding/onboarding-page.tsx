import styled from '@emotion/styled';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { useState, type ReactNode } from 'react';
import { AppLink } from '../../components/app-link';
import { BUTTON } from '../../components/button';
import { SiteHeader } from '../../components/site-header';
import { COLORS, SHADOWS } from '../../styles/colors';
import { FONTS } from '../../styles/fonts';
import { MEDIA } from '../../styles/layout';
import { StepInstalled, StepMaskTypes, StepReady, StepTry } from './onboarding-steps';

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS: Record<Step, string> = {
  1: '설치 완료',
  2: '가리는 정보',
  3: '직접 체험',
  4: '준비 완료',
};

const LAST_STEP: Step = 4;

const Page = styled.div`
  min-height: 100dvh;
  background: ${COLORS.background};
`;

const Main = styled.main`
  max-width: 880px;
  margin: 0 auto;
  padding: 40px 24px 120px;

  ${MEDIA.mobile} {
    padding: 28px 16px 80px;
  }
`;

const Progress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${COLORS.muted};
  font-size: 14px;
  font-weight: ${FONTS.weight.semibold};
  line-height: normal;
`;

const Track = styled.div`
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: ${COLORS.track};
`;

const Fill = styled.div<{ ratio: number }>`
  width: ${({ ratio }) => ratio * 100}%;
  height: 100%;
  border-radius: 999px;
  background: ${COLORS.primary};
  transition: width 0.3s ease;
`;

const Panel = styled.div`
  overflow: hidden;
  border-radius: 20px;
  background: ${COLORS.white};
  box-shadow: ${SHADOWS.panel};
`;

const Footer = styled.div<{ hasPrev: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ hasPrev }) => (hasPrev ? 'space-between' : 'flex-end')};
  padding: 20px 40px;
  border-top: 1px solid ${COLORS.divider};
  background: ${COLORS.footerBar};

  ${MEDIA.mobile} {
    padding: 16px 20px;
  }
`;

export function OnboardingPage(): ReactNode {
  const [step, setStep] = useState<Step>(1);

  const goTo = (next: Step): void => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const goPrev = (): void => {
    if (step > 1) {
      goTo((step - 1) as Step);
    }
  };

  const goNext = (): void => {
    if (step < LAST_STEP) {
      goTo((step + 1) as Step);
    }
  };

  const footer = (
    <Footer hasPrev={step > 1}>
      {step > 1 && (
        <button type="button" css={BUTTON.secondary} onClick={goPrev}>
          <ArrowLeft size={16} color={COLORS.label} />
          이전
        </button>
      )}
      {step < LAST_STEP ? (
        <button type="button" css={BUTTON.next} onClick={goNext}>
          {step === 3 ? '완료' : '다음'}
          <ArrowRight size={16} color={COLORS.white} />
        </button>
      ) : (
        <AppLink href="/" css={BUTTON.secondary}>
          랜딩 페이지로 가기
        </AppLink>
      )}
    </Footer>
  );

  return (
    <Page>
      <SiteHeader variant="onboarding" onSkip={() => goTo(LAST_STEP)} />
      <Main>
        <Progress>
          <ProgressText>
            <span>{STEP_LABELS[step]}</span>
            <span>
              {step} / {LAST_STEP}
            </span>
          </ProgressText>
          <Track
            role="progressbar"
            aria-label="온보딩 진행률"
            aria-valuemin={1}
            aria-valuemax={LAST_STEP}
            aria-valuenow={step}
          >
            <Fill ratio={step / LAST_STEP} />
          </Track>
        </Progress>

        {step === 1 ? (
          <StepInstalled footer={footer} />
        ) : (
          <Panel>
            {step === 2 && <StepMaskTypes />}
            {step === 3 && <StepTry />}
            {step === 4 && <StepReady />}
            {footer}
          </Panel>
        )}
      </Main>
    </Page>
  );
}
