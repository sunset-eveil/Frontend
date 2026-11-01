import styled from '@emotion/styled';
import { ArrowsClockwise, ShieldCheck } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { MaskedToken } from '../../components/masked-token';
import { colors, shadows } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { media } from '../../styles/layout';
import { StartActions } from './start-actions';

const Section = styled.section`
  position: relative;
  overflow: hidden;
  background: ${colors.primaryDeep};
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

  ${media.mobile} {
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
  background: ${colors.whiteAlpha14};
  color: ${colors.white};
  font-size: 14px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;
`;

const Title = styled.h1`
  margin-top: 27px;
  color: ${colors.white};
  font-size: 60px;
  font-weight: ${fonts.weight.extrabold};
  line-height: 72px;
  letter-spacing: -2.1px;

  ${media.mobile} {
    font-size: 38px;
    line-height: 48px;
    letter-spacing: -1.3px;
  }
`;

const Lead = styled.p`
  max-width: 440px;
  margin: 27px 0 28px;
  color: ${colors.heroText};
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
  background: ${colors.white};
  box-shadow: ${shadows.heroCard};
`;

const WindowBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid ${colors.divider};
`;

const WindowDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: ${colors.track};
`;

const WindowTitle = styled.span`
  padding-left: 10px;
  color: ${colors.muted};
  font-size: 14px;
  line-height: normal;
`;

const WindowBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 22px 18px;
  background: ${colors.surface};
`;

const InputLabel = styled.span`
  color: ${colors.muted};
  font-size: 12px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;
`;

const InputBox = styled.p`
  min-height: 150px;
  padding: 17px 18px;
  border: 1px solid ${colors.track};
  border-radius: 12px;
  background: ${colors.white};
  color: ${colors.body};
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

const Status = styled.span`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: ${colors.primaryDeep};
  font-size: 14px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;
`;

const ToggleLabel = styled.span`
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 4px;
  color: ${colors.secondary};
  font-size: 14px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;
`;

const Toggle = styled.span`
  display: flex;
  justify-content: flex-end;
  width: 42px;
  height: 24px;
  padding: 3px;
  border-radius: 999px;
  background: ${colors.primary};

  &::after {
    content: '';
    width: 18px;
    height: 18px;
    border-radius: 9px;
    background: ${colors.white};
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  }
`;

const Toast = styled.div`
  position: absolute;
  bottom: -72px;
  left: -28px;
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px 18px;
  border-radius: 12px;
  background: ${colors.navy};
  box-shadow: ${shadows.toast};

  ${media.mobile} {
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
  background: ${colors.mint};
`;

const ToastText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: normal;
`;

const ToastTitle = styled.span`
  color: ${colors.white};
  font-size: 14px;
  font-weight: ${fonts.weight.bold};
`;

const ToastCaption = styled.span`
  color: ${colors.subtle};
  font-size: 12px;
`;

export function HeroSection(): ReactNode {
  return (
    <Section>
      <Ring diameter={560} offset={160} alpha={colors.whiteAlpha12} />
      <Ring diameter={360} offset={60} alpha={colors.whiteAlpha10} />
      <Inner>
        <Copy>
          <Badge>
            <ShieldCheck size={16} color={colors.white} />
            ChatGPT 개인정보 유출 감지
          </Badge>
          <Title>
            ChatGPT에
            <br />내 정보를 넘기지 마세요
          </Title>
          <Lead>보내기 전에 개인정보를 자동으로 가려 드려요.</Lead>
          <StartActions />
        </Copy>

        <Preview aria-hidden>
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
                제 이력서 좀 다듬어 줘. 이름 <MaskedToken>이름_1</MaskedToken>, 연락처{' '}
                <MaskedToken>전화번호_1</MaskedToken>, 이메일 <MaskedToken>이메일_1</MaskedToken>, 주소는{' '}
                <MaskedToken>주소_1</MaskedToken> 이야.
              </InputBox>
            </WindowBody>
            <WindowFooter>
              <Status>
                <ShieldCheck size={18} color={colors.primaryDeep} />
                4건 가림 완료 · 안심하고 보내세요
              </Status>
              <ToggleLabel>
                Eveil 보호
                <Toggle />
              </ToggleLabel>
            </WindowFooter>
          </ChatWindow>

          <Toast>
            <ToastIcon>
              <ArrowsClockwise size={18} color={colors.navy} />
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
