import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { ArrowsClockwise, ShieldCheck, WarningCircle } from '@phosphor-icons/react';
import { Fragment, useState, type ReactNode } from 'react';
import { MaskedToken } from '../../components/masked-token';
import { COLORS, SHADOWS } from '../../styles/colors';
import { FONTS } from '../../styles/fonts';
import { MEDIA } from '../../styles/layout';
import { StartActions } from './start-actions';

const Section = styled.section`
  position: relative;
  overflow: hidden;
  background: ${COLORS.primaryDeep};
`;

const Ring = styled.div<{ diameter: number; offset: number; alpha: string }>`
  position: absolute;
  top: -${({ offset }) => offset}px;
  right: -${({ offset }) => offset}px;
  width: ${({ diameter }) => diameter}px;
  height: ${({ diameter }) => diameter}px;
  border: 1px solid ${({ alpha }) => alpha};
  border-radius: 50%;
  pointer-events: none;
`;

const Inner = styled.div`
  position: relative;
  display: flex;
  gap: 64px;
  align-items: center;
  max-width: 1180px;
  margin: 0 auto;
  padding: 96px 24px 144px;

  ${MEDIA.mobile} {
    flex-direction: column;
    gap: 48px;
    align-items: stretch;
    padding: 56px 16px 112px;
  }
`;

const Copy = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`;

const Badge = styled.span`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: ${COLORS.whiteAlpha14};
  color: ${COLORS.white};
  font-size: 14px;
  font-weight: ${FONTS.weight.semibold};
  line-height: normal;
`;

const Title = styled.h1`
  margin-top: 27px;
  color: ${COLORS.white};
  font-size: 60px;
  font-weight: ${FONTS.weight.extrabold};
  line-height: 72px;
  letter-spacing: -2.1px;

  ${MEDIA.mobile} {
    font-size: 38px;
    line-height: 48px;
    letter-spacing: -1.3px;
  }
`;

const Lead = styled.p`
  max-width: 440px;
  margin: 27px 0 28px;
  color: ${COLORS.heroText};
  font-size: 18px;
  line-height: 30.6px;
`;

const Preview = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
`;

const ChatWindow = styled.div`
  overflow: hidden;
  border-radius: 18px;
  background: ${COLORS.white};
  box-shadow: ${SHADOWS.heroCard};
`;

const WindowBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid ${COLORS.divider};
`;

const WindowDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: ${COLORS.track};
`;

const WindowTitle = styled.span`
  padding-left: 10px;
  color: ${COLORS.muted};
  font-size: 14px;
  line-height: normal;
`;

const WindowBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 22px 18px;
  background: ${COLORS.surface};
`;

const InputLabel = styled.span`
  color: ${COLORS.muted};
  font-size: 12px;
  font-weight: ${FONTS.weight.semibold};
  line-height: normal;
`;

const InputBox = styled.p`
  min-height: 150px;
  padding: 17px 18px;
  border: 1px solid ${COLORS.track};
  border-radius: 12px;
  background: ${COLORS.white};
  color: ${COLORS.body};
  font-size: 16px;
  line-height: 30.4px;
`;

const WindowFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
`;

const Status = styled.span<{ isProtected: boolean }>`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: ${({ isProtected }) => (isProtected ? COLORS.primaryDeep : COLORS.danger)};
  transition: color 0.2s ease;
  font-size: 14px;
  font-weight: ${FONTS.weight.semibold};
  line-height: normal;
`;

const ToggleButton = styled.button`
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 4px;
  border: none;
  border-radius: 999px;
  background: none;
  color: ${COLORS.secondary};
  font-size: 14px;
  font-weight: ${FONTS.weight.semibold};
  line-height: normal;

  &:focus-visible {
    outline: 2px solid ${COLORS.primary};
    outline-offset: 2px;
  }
`;

const Toggle = styled.span<{ isOn: boolean }>`
  position: relative;
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: ${({ isOn }) => (isOn ? COLORS.primary : COLORS.toggleOff)};
  transition: background-color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 9px;
    background: ${COLORS.white};
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
    transform: translateX(${({ isOn }) => (isOn ? 18 : 0)}px);
    transition: transform 0.2s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      transition: none;
    }
  }
`;

const SWAP_IN = keyframes`
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const Swap = styled.span`
  animation: ${SWAP_IN} 0.25s ease;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Toast = styled.div<{ isVisible: boolean }>`
  position: absolute;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: translateY(${({ isVisible }) => (isVisible ? 0 : 8)}px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  bottom: -72px;
  left: -28px;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 18px;
  border-radius: 12px;
  background: ${COLORS.navy};
  box-shadow: ${SHADOWS.toast};

  ${MEDIA.mobile} {
    left: 12px;
  }
`;

const ToastIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background: ${COLORS.mint};
`;

const ToastText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: normal;
`;

const ToastTitle = styled.span`
  color: ${COLORS.white};
  font-size: 14px;
  font-weight: ${FONTS.weight.bold};
`;

const ToastCaption = styled.span`
  color: ${COLORS.subtle};
  font-size: 12px;
`;

type MessagePart = string | { token: string; original: string };

const MESSAGE: readonly MessagePart[] = [
  '제 이력서 좀 다듬어 줘. 이름 ',
  { token: '이름_1', original: '김민지' },
  ', 연락처 ',
  { token: '전화번호_1', original: '010-2345-6789' },
  ', 이메일 ',
  { token: '이메일_1', original: 'minji.kim@mail.com' },
  ', 주소는 ',
  { token: '주소_1', original: '서울 마포구 월드컵로 12' },
  '이야.',
];

const MASKED_COUNT = MESSAGE.filter((part) => typeof part !== 'string').length;

export function HeroSection(): ReactNode {
  const [isProtected, setIsProtected] = useState(true);

  return (
    <Section>
      <Ring diameter={560} offset={160} alpha={COLORS.whiteAlpha12} />
      <Ring diameter={360} offset={60} alpha={COLORS.whiteAlpha10} />
      <Inner>
        <Copy>
          <Badge>
            <ShieldCheck size={16} color={COLORS.white} />
            ChatGPT 개인정보 유출 감지
          </Badge>
          <Title>
            ChatGPT에
            <br />내 정보를 넘기지 마세요
          </Title>
          <Lead>보내기 전에 개인정보를 자동으로 가려 드려요.</Lead>
          <StartActions />
        </Copy>

        <Preview>
          <ChatWindow>
            <WindowBar>
              <WindowDot />
              <WindowDot />
              <WindowDot />
              <WindowTitle>ChatGPT · 새 채팅</WindowTitle>
            </WindowBar>
            <WindowBody>
              <InputLabel>내가 입력한 메시지</InputLabel>
              <InputBox>
                {MESSAGE.map((part, index) => {
                  if (typeof part === 'string') {
                    return <Fragment key={index}>{part}</Fragment>;
                  }
                  return isProtected ? (
                    <Swap key={`${index}-on`}>
                      <MaskedToken>{part.token}</MaskedToken>
                    </Swap>
                  ) : (
                    <Swap key={`${index}-off`}>{part.original}</Swap>
                  );
                })}
              </InputBox>
            </WindowBody>
            <WindowFooter>
              <Status isProtected={isProtected} aria-live="polite">
                {isProtected ? (
                  <>
                    <ShieldCheck size={18} color={COLORS.primaryDeep} />
                    {MASKED_COUNT}건 가림 완료 · 안심하고 보내세요
                  </>
                ) : (
                  <>
                    <WarningCircle size={18} color={COLORS.danger} />
                    보호 꺼짐 · 개인정보 {MASKED_COUNT}건이 그대로 보내져요
                  </>
                )}
              </Status>
              <ToggleButton
                type="button"
                role="switch"
                aria-checked={isProtected}
                onClick={() => setIsProtected((current) => !current)}
              >
                Eveil 보호
                <Toggle isOn={isProtected} />
              </ToggleButton>
            </WindowFooter>
          </ChatWindow>

          <Toast isVisible={isProtected} aria-hidden>
            <ToastIcon>
              <ArrowsClockwise size={18} color={COLORS.navy} />
            </ToastIcon>
            <ToastText>
              <ToastTitle>답변은 원래 정보로 자동 복원</ToastTitle>
              <ToastCaption>이름_1 → 김민지</ToastCaption>
            </ToastText>
          </Toast>
        </Preview>
      </Inner>
    </Section>
  );
}
