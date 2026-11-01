import styled from '@emotion/styled';
import type { Icon } from '@phosphor-icons/react';
import {
  ArrowRight,
  ArrowsClockwise,
  Check,
  CreditCard,
  DotsThreeVertical,
  EnvelopeSimple,
  IdentificationCard,
  MapPin,
  Phone,
  PushPin,
  PuzzlePiece,
  ShieldCheck,
  Star,
  User,
  WarningCircle,
} from '@phosphor-icons/react';
import { useMemo, useState, type ReactNode } from 'react';
import { button } from '../../components/button';
import { ChatgptMark } from '../../components/chatgpt-mark';
import { Logo } from '../../components/logo';
import { MaskedToken } from '../../components/masked-token';
import { FloatingPanel, SplitCard } from '../../components/split-card';
import { CHATGPT_URL } from '../../constants/links';
import { colors } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { media } from '../../styles/layout';
import { maskDemoText } from './demo-masking';

const Title = styled.h1<{ isCentered?: boolean }>`
  color: ${colors.heading};
  font-size: 36px;
  font-weight: ${fonts.weight.extrabold};
  line-height: 46.8px;
  letter-spacing: -1.08px;
  text-align: ${({ isCentered }) => (isCentered ? 'center' : 'left')};

  ${media.mobile} {
    font-size: 28px;
    line-height: 38px;
  }
`;

const StepTitle = styled.h1`
  color: ${colors.heading};
  font-size: 32px;
  font-weight: ${fonts.weight.extrabold};
  line-height: 43.2px;
  letter-spacing: -0.96px;

  ${media.mobile} {
    font-size: 26px;
    line-height: 36px;
  }
`;

const Lead = styled.p<{ isCentered?: boolean }>`
  color: ${colors.secondary};
  font-size: 16px;
  line-height: 27.2px;
  text-align: ${({ isCentered }) => (isCentered ? 'center' : 'left')};
`;

const Content = styled.div<{ gap: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap}px;
  padding: 47px 40px 48px;

  ${media.mobile} {
    padding: 32px 20px;
  }
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/* ---------- 1단계: 설치 완료 ---------- */

const CheckBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 19px;
  border-radius: 28px;
  background: ${colors.chip};
`;

const BrowserBar = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 14px;
  border-bottom: 1px solid ${colors.track};
  background: #f1f2f6;
`;

const PuzzleButton = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${colors.chip};
  box-shadow: 0 0 0 2px ${colors.primary};
`;

const ExtensionMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
`;

const MenuLabel = styled.span`
  padding: 6px 8px;
  color: ${colors.muted};
  font-size: 12px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;
`;

const MenuItem = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  border-radius: 8px;
  background: ${colors.background};
`;

type StepInstalledProps = {
  footer: ReactNode;
};

export function StepInstalled({ footer }: StepInstalledProps): ReactNode {
  return (
    <SplitCard
      height={341}
      footer={footer}
      copy={
        <>
          <CheckBadge>
            <Check size={28} color={colors.primary} />
          </CheckBadge>
          <Title>
            설치가 끝났어요!
            <br />
            이제 1분만 준비해요
          </Title>
          <Lead css={{ marginTop: 21, fontSize: 16, lineHeight: '28px' }}>
            먼저 브라우저 오른쪽 위 퍼즐 아이콘을 눌러 Eveil을{' '}
            <strong css={{ color: colors.heading, fontWeight: fonts.weight.bold }}>고정</strong>해 주세요. 보호 상태를
            언제든 확인할 수 있어요.
          </Lead>
        </>
      }
      visual={
        <FloatingPanel css={{ borderRadius: 14 }}>
          <BrowserBar>
            <Star size={18} color={colors.muted} />
            <PuzzleButton>
              <PuzzlePiece size={18} color={colors.primary} />
            </PuzzleButton>
            <DotsThreeVertical size={18} color={colors.muted} />
          </BrowserBar>
          <ExtensionMenu>
            <MenuLabel>확장 프로그램</MenuLabel>
            <MenuItem>
              <Logo width={50} />
              <PushPin size={18} color={colors.primary} />
            </MenuItem>
          </ExtensionMenu>
        </FloatingPanel>
      }
    />
  );
}

/* ---------- 2단계: 가리는 정보 ---------- */

type MaskExample = { icon: Icon; label: string; original: string; token: string };

const MASK_EXAMPLES: readonly MaskExample[] = [
  { icon: User, label: '이름', original: '김민지', token: '이름_1' },
  { icon: Phone, label: '전화번호', original: '010-2345-****', token: '전화번호_1' },
  { icon: IdentificationCard, label: '주민등록번호', original: '950412-*******', token: '주민번호_1' },
  { icon: EnvelopeSimple, label: '이메일', original: 'minji@mail.com', token: '이메일_1' },
  { icon: CreditCard, label: '계좌·카드번호', original: '1234-5678', token: '카드번호_1' },
  { icon: MapPin, label: '주소', original: '서울 마포구', token: '주소_1' },
];

const MaskGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const MaskCard = styled.li`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  background: ${colors.background};
`;

const MaskHeader = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  color: ${colors.heading};
  font-size: 16px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const MaskIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: ${colors.white};
`;

const MaskExampleRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  color: ${colors.secondary};
  font-size: 14px;
  line-height: 20px;
`;

const Original = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const InlineNote = styled.p`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${colors.secondary};
  font-size: 14px;
  line-height: normal;
`;

export function StepMaskTypes(): ReactNode {
  return (
    <Content gap={28}>
      <Heading>
        <StepTitle>Eveil이 이런 정보를 가려 드려요</StepTitle>
        <Lead>입력한 내용에서 아래 정보를 찾아, ChatGPT에는 가명으로 바꿔 보냅니다.</Lead>
      </Heading>
      <MaskGrid>
        {MASK_EXAMPLES.map(({ icon: MaskTypeIcon, label, original, token }) => (
          <MaskCard key={label}>
            <MaskHeader>
              <MaskIcon>
                <MaskTypeIcon size={20} color={colors.primary} />
              </MaskIcon>
              {label}
            </MaskHeader>
            <MaskExampleRow>
              <Original>{original}</Original>
              <ArrowRight size={14} color={colors.muted} css={{ flexShrink: 0 }} />
              <MaskedToken size="small" css={{ margin: 0, padding: '0 8px', lineHeight: '20px' }}>
                {token}
              </MaskedToken>
            </MaskExampleRow>
          </MaskCard>
        ))}
      </MaskGrid>
      <InlineNote>
        <ShieldCheck size={18} color={colors.primary} />
        원본은 내 기기에만 남고, 답변은 원래 정보로 되돌려 보여 드려요.
      </InlineNote>
    </Content>
  );
}

/* ---------- 3단계: 직접 체험 ---------- */

const DEMO_DEFAULT_TEXT = '안녕, 내 이름은 김민지야. 010-2345-6789로 연락 주고, 이메일은 minji.kim@mail.com이야.';

const DemoColumns = styled.div`
  display: flex;
  gap: 16px;

  ${media.mobile} {
    flex-direction: column;
  }
`;

const DemoColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const DemoLabel = styled.label`
  color: ${colors.muted};
  font-size: 14px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;
`;

const DemoInput = styled.textarea`
  height: 238px;
  padding: 15px 16px;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  color: ${colors.heading};
  font-size: 16px;
  line-height: 28.8px;
  outline: none;
  resize: none;

  &:focus {
    border-color: ${colors.primary};
  }
`;

const DemoOutput = styled.p`
  height: 238px;
  overflow-y: auto;
  padding: 15px 16px;
  border-radius: 12px;
  background: ${colors.surfaceBlue};
  color: ${colors.body};
  font-size: 16px;
  line-height: 30.4px;
  white-space: pre-wrap;
  word-break: break-all;
`;

const DemoStatus = styled.p<{ tone: 'danger' | 'muted' }>`
  display: flex;
  gap: ${({ tone }) => (tone === 'danger' ? 8 : 6)}px;
  align-items: center;
  color: ${({ tone }) => (tone === 'danger' ? colors.danger : colors.secondary)};
  font-size: 14px;
  font-weight: ${({ tone }) => (tone === 'danger' ? fonts.weight.semibold : fonts.weight.regular)};
  line-height: normal;
`;

export function StepTry(): ReactNode {
  const [text, setText] = useState(DEMO_DEFAULT_TEXT);
  const { segments, count } = useMemo(() => maskDemoText(text), [text]);

  return (
    <Content gap={24}>
      <Heading>
        <StepTitle>직접 한번 입력해 보세요</StepTitle>
        <Lead>연습용이라 실제로 전송되지 않아요. 전화번호나 이메일을 적어 보세요.</Lead>
      </Heading>
      <DemoColumns>
        <DemoColumn>
          <DemoLabel htmlFor="onboarding-demo-input">ChatGPT에 입력할 메시지</DemoLabel>
          <DemoInput id="onboarding-demo-input" value={text} onChange={(event) => setText(event.target.value)} />
          <DemoStatus tone={count > 0 ? 'danger' : 'muted'} aria-live="polite">
            {count > 0 ? (
              <>
                <WarningCircle size={18} color={colors.danger} />
                개인정보 {count}건이 감지됐어요
              </>
            ) : (
              <>
                <ShieldCheck size={18} color={colors.primary} />
                감지된 개인정보가 없어요
              </>
            )}
          </DemoStatus>
        </DemoColumn>
        <DemoColumn>
          <DemoLabel as="span">ChatGPT가 받는 메시지</DemoLabel>
          <DemoOutput>
            {segments.map((segment, index) =>
              segment.kind === 'token' ? (
                <MaskedToken key={index} tone="white">
                  {segment.value}
                </MaskedToken>
              ) : (
                <span key={index}>{segment.value}</span>
              ),
            )}
          </DemoOutput>
          <DemoStatus tone="muted">
            <ArrowsClockwise size={14} color={colors.secondary} />
            답변이 오면 원래 정보로 되돌려 보여 드려요
          </DemoStatus>
        </DemoColumn>
      </DemoColumns>
    </Content>
  );
}

/* ---------- 4단계: 준비 완료 ---------- */

const ReadyContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 21px;
  align-items: center;
  padding: 64px 40px;

  ${media.mobile} {
    padding: 48px 20px;
  }
`;

const ReadyBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 44px;
  background: ${colors.primary};
  box-shadow: 0 0 0 12px ${colors.tile};
`;

export function StepReady(): ReactNode {
  return (
    <ReadyContent>
      <ReadyBadge>
        <ShieldCheck size={42} color={colors.white} />
      </ReadyBadge>
      <Title isCentered>
        준비 완료!
        <br />
        이제 안심하고 ChatGPT를 쓰세요
      </Title>
      <Lead isCentered>개인정보를 자동으로 가려 드릴게요. 입력창 옆 Eveil 표시로 상태를 확인할 수 있어요.</Lead>
      <a href={CHATGPT_URL} target="_blank" rel="noreferrer" css={[button.primaryLarge, { marginTop: 8, padding: '16px 28px' }]}>
        <ChatgptMark size={18} color={colors.white} />
        ChatGPT 열기
      </a>
    </ReadyContent>
  );
}
