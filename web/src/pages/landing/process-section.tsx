import styled from '@emotion/styled';
import type { Icon } from '@phosphor-icons/react';
import { Keyboard, PuzzlePiece, ShieldCheck } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Reveal } from '../../components/reveal';
import { colors } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { media } from '../../styles/layout';

type Step = { icon: Icon; title: string; text: ReactNode };

const STEPS: readonly Step[] = [
  { icon: PuzzlePiece, title: '확장 프로그램 추가', text: '크롬에 Eveil을 추가해요.' },
  {
    icon: Keyboard,
    title: 'Eveil 버튼 누르고 입력',
    text: (
      <>
        입력창 옆 버튼을 눌러
        <br />
        보낼 내용을 적어요.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: '확인하고 보내기',
    text: (
      <>
        가려진 내용을 확인하고
        <br />
        ChatGPT에 보내요.
      </>
    ),
  },
];

const Section = styled.section`
  background: ${colors.white};
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 64px;
  max-width: 1080px;
  margin: 0 auto;
  padding: 112px 24px;

  ${media.mobile} {
    gap: 40px;
    padding: 80px 16px;
  }
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`;

const Eyebrow = styled.span`
  color: ${colors.primary};
  font-size: 16px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const Title = styled.h2`
  color: ${colors.heading};
  font-size: 40px;
  font-weight: ${fonts.weight.extrabold};
  line-height: 54px;
  letter-spacing: -1.2px;

  ${media.mobile} {
    font-size: 28px;
    line-height: 38px;
  }
`;

const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 40px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const StepItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
  padding-bottom: 27px;
  text-align: center;
`;

const IconTile = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 48px;
  background: ${colors.tile};
  box-shadow: 0 0 0 10px ${colors.tileRing};
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;

  li:hover & {
    transform: translateY(-4px) rotate(-6deg);
    box-shadow: 0 0 0 14px ${colors.tileRing};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    li:hover & {
      transform: none;
    }
  }
`;

const StepNumber = styled.span`
  color: ${colors.primary};
  font-size: 14px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const StepTitle = styled.h3`
  color: ${colors.heading};
  font-size: 22px;
  font-weight: ${fonts.weight.extrabold};
  line-height: normal;
  letter-spacing: -0.44px;
`;

const StepText = styled.p`
  color: ${colors.secondary};
  font-size: 16px;
  line-height: 27.2px;
`;

export function ProcessSection(): ReactNode {
  return (
    <Section id="process">
      <Inner>
        <Heading>
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <Title>3단계면 충분해요</Title>
        </Heading>
        <Steps>
          {STEPS.map(({ icon: StepIcon, title, text }, index) => (
            <StepItem key={title}>
              <Reveal
                delay={index * 150}
                css={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}
              >
                <IconTile>
                  <StepIcon size={40} color={colors.primary} />
                </IconTile>
                <StepNumber>STEP {index + 1}</StepNumber>
                <StepTitle>{title}</StepTitle>
                <StepText>{text}</StepText>
              </Reveal>
            </StepItem>
          ))}
        </Steps>
      </Inner>
    </Section>
  );
}
