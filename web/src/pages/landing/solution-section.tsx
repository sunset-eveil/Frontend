import styled from '@emotion/styled';
import { ArrowDown, ArrowRight, Circle, CheckCircle, Monitor } from '@phosphor-icons/react';
import { useState, type ReactNode } from 'react';
import { ChatgptMark } from '../../components/chatgpt-mark';
import { MaskedToken } from '../../components/masked-token';
import { Reveal } from '../../components/reveal';
import { SectionTitle } from '../../components/section-title';
import { colors, shadows } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { media } from '../../styles/layout';

const MASK_TYPES: readonly string[] = ['이름', '전화번호', '주민등록번호', '이메일', '계좌·카드번호', '주소'];

const Section = styled.section`
  background: ${colors.white};
`;

const Intro = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: 112px 24px 41px;

  ${media.mobile} {
    padding: 80px 16px 24px;
  }
`;

const FeatureBand = styled.div<{ isTinted?: boolean }>`
  background: ${({ isTinted }) => (isTinted ? colors.background : 'transparent')};
  padding-top: ${({ isTinted }) => (isTinted ? 40 : 0)}px;
`;

const Feature = styled.div<{ padding: number }>`
  display: flex;
  gap: 56px;
  align-items: center;
  max-width: 1000px;
  margin: 0 auto;
  padding: ${({ padding }) => padding}px 24px;

  ${media.mobile} {
    flex-direction: column;
    gap: 32px;
    align-items: stretch;
    padding: 48px 16px;
  }
`;

const FeatureCopy = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-width: 0;

  ${media.mobile} {
    order: -1;
  }
`;

const FeatureLabel = styled.span`
  color: ${colors.primary};
  font-size: 14px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const FeatureTitle = styled.h3`
  color: ${colors.heading};
  font-size: 30px;
  font-weight: ${fonts.weight.extrabold};
  line-height: 42px;
  letter-spacing: -0.9px;

  ${media.mobile} {
    font-size: 24px;
    line-height: 34px;
  }
`;

const FeatureText = styled.p`
  color: ${colors.secondary};
  font-size: 16px;
  line-height: 28px;
`;

const Visual = styled.div<{ tone: 'light' | 'deep' }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  padding: 36px;
  border-radius: 20px;
  background: ${({ tone }) => (tone === 'deep' ? colors.surfaceBlueDeep : colors.surfaceBlue)};

  ${media.mobile} {
    padding: 20px;
  }
`;

const DetectCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  border-radius: 14px;
  background: ${colors.white};
  box-shadow: ${shadows.card};
`;

const DetectHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const DetectGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const DetectItem = styled.button<{ isOn: boolean }>`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  height: 38px;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: ${({ isOn }) => (isOn ? colors.background : colors.white)};
  box-shadow: ${({ isOn }) => (isOn ? 'none' : `inset 0 0 0 1px ${colors.divider}`)};
  color: ${({ isOn }) => (isOn ? colors.heading : colors.muted)};
  font-size: 14px;
  line-height: normal;
  text-align: left;
  text-decoration: ${({ isOn }) => (isOn ? 'none' : 'line-through')};
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${colors.tile};
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 1px;
  }
`;

const DetectHint = styled.span`
  color: ${colors.muted};
  font-size: 12px;
  line-height: normal;
`;

const BubbleRow = styled.div<{ align: 'flex-start' | 'center' | 'flex-end' }>`
  display: flex;
  justify-content: ${({ align }) => align};
`;

const Bubble = styled.div<{ isMine?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 96%;
  padding: 13px 16px 14px;
  border-radius: ${({ isMine }) => (isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px')};
  background: ${({ isMine }) => (isMine ? colors.primary : colors.white)};
  box-shadow: ${({ isMine }) => (isMine ? shadows.bubbleStrong : shadows.bubble)};
  font-size: 14px;
  line-height: 22.4px;
`;

const BubbleLabel = styled.span<{ isMine?: boolean }>`
  color: ${({ isMine }) => (isMine ? colors.answerLabel : colors.muted)};
  font-size: 12px;
  font-weight: ${fonts.weight.bold};
  line-height: 19.2px;
`;

const Flow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Node = styled.div<{ isDark?: boolean }>`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  padding: 18px;
  border-radius: 14px;
  background: ${({ isDark }) => (isDark ? colors.navy : colors.white)};
  box-shadow: ${({ isDark }) => (isDark ? 'none' : shadows.card)};
  text-align: center;
`;

const NodeTitle = styled.span<{ isDark?: boolean }>`
  color: ${({ isDark }) => (isDark ? colors.white : colors.heading)};
  font-size: 14px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const NodeCaption = styled.span<{ isDark?: boolean }>`
  color: ${({ isDark }) => (isDark ? colors.subtle : colors.secondary)};
  font-size: 12px;
  line-height: 18px;
`;

const FlowArrow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;

const FlowPill = styled.span`
  padding: 4px 8px;
  border-radius: 999px;
  background: ${colors.white};
  color: ${colors.primary};
  font-size: 12px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
  white-space: nowrap;
`;

function DetectPanel(): ReactNode {
  const [enabled, setEnabled] = useState<ReadonlySet<string>>(() => new Set(MASK_TYPES));

  const toggle = (type: string): void => {
    setEnabled((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  return (
    <DetectCard>
      <DetectHeader>
        <span>감지 항목</span>
        <span aria-live="polite" css={{ color: enabled.size > 0 ? colors.primary : colors.muted }}>
          {enabled.size > 0 ? `${enabled.size}종 보호 중` : '보호 꺼짐'}
        </span>
      </DetectHeader>
      <DetectGrid>
        {MASK_TYPES.map((type) => {
          const isOn = enabled.has(type);
          return (
            <li key={type}>
              <DetectItem type="button" isOn={isOn} aria-pressed={isOn} onClick={() => toggle(type)}>
                {isOn ? <CheckCircle size={18} color={colors.primary} /> : <Circle size={18} color={colors.muted} />}
                {type}
              </DetectItem>
            </li>
          );
        })}
      </DetectGrid>
      <DetectHint>항목을 눌러 켜고 끌 수 있어요</DetectHint>
    </DetectCard>
  );
}

export function SolutionSection(): ReactNode {
  return (
    <Section id="solution">
      <Intro>
        <Reveal>
          <SectionTitle
            eyebrow="SOLUTION"
            title={
              <>
                쓰던 방식 그대로,
                <br />
                개인정보만 쏙 빼고 보내요
              </>
            }
            description="ChatGPT 입력창 옆 버튼 하나로 켜고 끌 수 있어요."
          />
        </Reveal>
      </Intro>

      <Feature padding={40}>
        <FeatureCopy>
          <FeatureLabel>01 자동 감지</FeatureLabel>
          <FeatureTitle>
            입력하는 순간
            <br />
            개인정보를 찾아내요
          </FeatureTitle>
          <FeatureText>이름, 연락처, 주민번호, 계좌·카드번호, 주소를 바로 표시해요.</FeatureText>
        </FeatureCopy>
        <Visual tone="light">
          <DetectPanel />
        </Visual>
      </Feature>

      <FeatureBand isTinted>
        <Feature padding={96}>
          <Visual tone="deep" aria-hidden>
            <BubbleRow align="flex-start">
              <Bubble>
                <BubbleLabel>ChatGPT가 받은 답변</BubbleLabel>
                <span css={{ color: colors.body }}>
                  <MaskedToken size="small" css={{ marginLeft: 0 }}>
                    이름_1
                  </MaskedToken>
                  님의 이력서를 이렇게 다듬어 봤어요.
                </span>
              </Bubble>
            </BubbleRow>
            <BubbleRow align="center">
              <ArrowDown size={22} color={colors.primary} />
            </BubbleRow>
            <BubbleRow align="flex-end">
              <Bubble isMine>
                <BubbleLabel isMine>내 화면에 보이는 답변</BubbleLabel>
                <span css={{ color: colors.white }}>
                  <strong>김민지</strong>님의 이력서를 이렇게 다듬어 봤어요.
                </span>
              </Bubble>
            </BubbleRow>
          </Visual>
          <FeatureCopy>
            <FeatureLabel>02 가명 전송 · 자동 복원</FeatureLabel>
            <FeatureTitle>
              ChatGPT는 가명만 보고,
              <br />
              나는 원래 이름을 봐요
            </FeatureTitle>
            <FeatureText>가명으로 바꿔 보내고, 답변은 원래 정보로 되돌려 보여 드려요.</FeatureText>
          </FeatureCopy>
        </Feature>
      </FeatureBand>

      <Feature padding={96}>
        <FeatureCopy>
          <FeatureLabel>03 내 기기에서만 처리</FeatureLabel>
          <FeatureTitle>
            원래 정보는
            <br />내 브라우저를 떠나지 않아요
          </FeatureTitle>
          <FeatureText>원본은 어디에도 전송되지 않고, 대화가 끝나면 자동으로 지워져요.</FeatureText>
        </FeatureCopy>
        <Visual tone="light" aria-hidden>
          <Flow>
            <Node>
              <Monitor size={30} color={colors.primary} />
              <NodeTitle>내 브라우저</NodeTitle>
              <NodeCaption>원본 보관</NodeCaption>
            </Node>
            <FlowArrow>
              <FlowPill>가명만</FlowPill>
              <ArrowRight size={20} color={colors.primary} />
            </FlowArrow>
            <Node isDark>
              <ChatgptMark size={30} color={colors.mint} />
              <NodeTitle isDark>ChatGPT</NodeTitle>
              <NodeCaption isDark>
                개인정보 없는
                <br />
                메시지만 수신
              </NodeCaption>
            </Node>
          </Flow>
        </Visual>
      </Feature>
    </Section>
  );
}
