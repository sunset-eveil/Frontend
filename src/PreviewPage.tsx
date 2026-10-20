import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { ComparisonPanel } from './components/ComparisonPanel';
import { EveilButton } from './components/EveilButton';
import { Icon, type IconName, Logo } from './components/Icon';
import { InputPanel } from './components/InputPanel';
import { MaskTypeItem } from './components/MaskTypeItem';
import { MaskChip, PrivacyHighlight } from './components/PrivacyText';
import { colors } from './styles/colors';

type Screen = 'button' | 'chat' | 'comparison';
type MaskType = {
  label: string;
  icon: IconName;
  chip: IconName;
  value: string;
};
type NavigationItem = {
  icon: IconName;
  label: string;
};
type Suggestion = {
  icon: IconName;
  label: string;
};

const Page = styled.main`
  display: flex;
  min-width: 1024px;
  min-height: 100dvh;
  overflow: hidden;
  color: ${colors.chatText};
  background: ${colors.background};
`;

const Sidebar = styled.aside`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
  width: 260px;
  min-height: 100dvh;
  padding: 14px 10px;
  border-right: 1px solid ${colors.sidebarBorder};
  background: ${colors.sidebar};
`;

const SidebarHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px 14px;
`;

const SidebarTitle = styled.strong`
  color: ${colors.heading};
  font-size: 20px;
  font-weight: 700;
  line-height: 31px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 14px;
`;

const NavigationButton = styled.button<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 45px;
  padding: 10px;
  border: 0;
  border-radius: 10px;
  color: ${colors.chatText};
  background: ${({ selected }) => selected ? colors.chatSelected : 'transparent'};
  font-size: 16px;
`;

const SectionLabel = styled.span`
  padding: 22px 10px 8px;
  color: ${colors.chatMuted};
  font-size: 14px;
  line-height: 21.7px;
`;

const RecentItem = styled.button`
  width: 100%;
  padding: 10px;
  overflow: hidden;
  border: 0;
  border-radius: 8px;
  color: ${colors.chatText};
  background: transparent;
  font-size: 14px;
  line-height: 21.7px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: ${colors.chatSelected};
  }
`;

const Account = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding: 12px 10px 4px;
  border-top: 1px solid ${colors.sidebarBorder};
`;

const Avatar = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: ${colors.heading};
  background: ${colors.avatar};
  font-size: 12px;
  font-weight: 700;
`;

const AccountName = styled.div`
  color: ${colors.heading};
  font-size: 14px;
`;

const AccountPlan = styled.div`
  margin-top: 2px;
  color: ${colors.chatMuted};
  font-size: 12px;
`;

const Content = styled.section`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 100dvh;
`;

const Topbar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 20px;
`;

const Model = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${colors.heading};
  font-size: 18px;
  font-weight: 600;
`;

const TopbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RoundButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid ${colors.sidebarBorder};
  border-radius: 50%;
  background: transparent;
`;

const Protection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px 0 8px;
  border: 1px solid ${colors.border};
  border-radius: 999px;
  color: ${colors.secondary};
  background: ${colors.surface};
  font-size: 14px;
`;

const Indicator = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${colors.indicator};
  box-shadow: 0 0 8px ${colors.active};
`;

const Workspace = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px 8vh;
`;

const Heading = styled.h1<{ $chatOpen: boolean }>`
  margin: 0 0 ${({ $chatOpen }) => $chatOpen ? '10px' : '28px'};
  color: ${colors.heading};
  font-size: 30px;
  font-weight: 500;
  line-height: 33.6px;
  letter-spacing: -0.3px;
`;

const PromptArea = styled.div`
  width: min(760px, calc(100vw - 340px));
`;

const Prompt = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 58px;
  padding: 0 10px 0 16px;
  border: 1px solid ${colors.chatInputBorder};
  border-radius: 28px;
  background: ${colors.chatInput};
`;

const PromptText = styled.span`
  flex: 1;
  margin-left: 10px;
  color: ${colors.chatMuted};
  font-size: 16px;
`;

const PromptMode = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0 10px;
  color: ${colors.chatText};
  font-size: 16px;
`;

const EveilSlot = styled.div`
  position: absolute;
  right: 94px;
  z-index: 2;
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: ${colors.chatButton};
`;

const Suggestions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 24px 8px 0;
`;

const SuggestionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 12px;
  color: ${colors.chatText};
  background: transparent;
  font-size: 16px;
  text-align: left;

  &:hover {
    background: ${colors.chatSelected};
  }
`;

const example = '이력서 자기소개 부분 좀 다듬어 줘.\n저는 김민지이고 010-2345-6789, minji.kim@mail.com 으로 연락받고 있어요.\n주소는 서울 마포구 월드컵로 12 이고, 희망 연봉은 4,200만원이야.';
const navigation: NavigationItem[] = [
  { icon: 'clock', label: '예약' },
  { icon: 'books', label: '라이브러리' },
  { icon: 'more', label: '탐색' },
];
const recent = [
  '이력서 자기소개 다듬기',
  '이사 체크리스트',
  '보험 청구 서류 문의',
  '제주 여행 일정 짜기',
  '영어 이메일 번역',
];
const suggestions: Suggestion[] = [
  { icon: 'file', label: '이력서 자기소개 부분 다듬어 줘' },
  { icon: 'package', label: '010-5821-3304로 온 택배 문자가 진짜인지 봐줘' },
  { icon: 'firstAid', label: '주민번호 950412-2123456으로 보험 청구하는 방법 알려줘' },
];
const types: MaskType[] = [
  { label: '이름', icon: 'user', chip: 'userChip', value: '김민지' },
  { label: '전화번호', icon: 'phone', chip: 'phoneChip', value: '010-2345-6789' },
  { label: '이메일', icon: 'email', chip: 'emailChip', value: 'minji.kim@mail.com' },
  { label: '주민등록번호', icon: 'id', chip: 'id', value: '' },
  { label: '계좌·카드번호', icon: 'card', chip: 'card', value: '' },
  { label: '주소', icon: 'pin', chip: 'pinChip', value: '서울 마포구 월드컵로 12' },
  { label: '금액', icon: 'coins', chip: 'coinsChip', value: '4,200만원' },
];

export function PreviewPage() {
  const [screen, setScreen] = useState<Screen>('button');
  const [showHint, setShowHint] = useState(
    () => localStorage.getItem('eveil-hint-shown') !== 'true',
  );
  const [value, setValue] = useState(example);
  const [view, setView] = useState<'original' | 'masked'>('original');
  const [enabled, setEnabled] = useState(types.map(() => true));

  useEffect(() => {
    if (showHint) {
      localStorage.setItem('eveil-hint-shown', 'true');
    }
  }, [showHint]);

  const isExample = value === example;
  const count = isExample
    ? types.filter((type, index) => type.value && enabled[index]).length
    : 0;
  const content = (masked: boolean) => isExample
    ? example.split(/(김민지|010-2345-6789|minji\.kim@mail\.com|서울 마포구 월드컵로 12|4,200만원)/)
      .map((part, index) => {
        const typeIndex = types.findIndex(type => type.value === part);

        if (typeIndex < 0 || !enabled[typeIndex]) {
          return part;
        }

        return masked
          ? <MaskChip key={index} icon={types[typeIndex].chip}>{types[typeIndex].label}_1</MaskChip>
          : <PrivacyHighlight key={index}>{part}</PrivacyHighlight>;
      })
    : value;

  return <Page>
    <Sidebar>
      <SidebarHeader>
        <SidebarTitle>ChatGPT</SidebarTitle>
        <HeaderActions>
          <Icon name="search" />
          <Icon name="sidebar" />
        </HeaderActions>
      </SidebarHeader>
      <NavigationButton selected><Icon name="newChat" />새 채팅</NavigationButton>
      {navigation.map(item => <NavigationButton key={item.label}>
        <Icon name={item.icon} />{item.label}
      </NavigationButton>)}
      <SectionLabel>최근</SectionLabel>
      {recent.map(item => <RecentItem key={item}>{item}</RecentItem>)}
      <Account>
        <Avatar>MJ</Avatar>
        <div>
          <AccountName>김민지</AccountName>
          <AccountPlan>Plus</AccountPlan>
        </div>
      </Account>
    </Sidebar>
    <Content>
      <Topbar>
        <Model>ChatGPT <Icon name="caret" /></Model>
        <TopbarActions>
          <RoundButton type="button" aria-label="테마"><Icon name="sun" /></RoundButton>
          <Protection>
            <Logo size="status" />
            보호 중
            <Indicator />
          </Protection>
        </TopbarActions>
      </Topbar>
      <Workspace>
        <Heading $chatOpen={screen === 'chat'}>준비되면 시작하세요.</Heading>
        {screen === 'button' && <PromptArea>
          <Prompt>
            <Icon name="plus" />
            <PromptText>ChatGPT에게 물어보세요</PromptText>
            <EveilSlot>
              <EveilButton
                onClick={() => {
                  setScreen('chat');
                  setShowHint(false);
                }}
                showHint={showHint}
                onDismissHint={() => setShowHint(false)}
              />
            </EveilSlot>
            <PromptMode>Instant <Icon name="inputCaret" /></PromptMode>
            <Icon name="microphone" />
            <SendButton type="button" aria-label="전송"><Icon name="arrowUp" /></SendButton>
          </Prompt>
          <Suggestions>
            {suggestions.map(item => <SuggestionButton key={item.label}>
              <Icon name={item.icon} />{item.label}
            </SuggestionButton>)}
          </Suggestions>
        </PromptArea>}
        {screen === 'chat' && <InputPanel
          value={value}
          onChange={setValue}
          view={view}
          onViewChange={setView}
          originalContent={isExample ? content(false) : undefined}
          maskedContent={content(true)}
          count={count}
          onClose={() => setScreen('button')}
          onExpand={() => setScreen('comparison')}
          onSettings={() => setScreen('comparison')}
        />}
      </Workspace>
    </Content>
    {screen === 'comparison' && <ComparisonPanel
      original={content(false)}
      masked={content(true)}
      count={count}
      onClose={() => setScreen('chat')}
      onCollapse={() => setScreen('chat')}
      types={types.map((type, index) => <MaskTypeItem
        key={type.label}
        label={type.label}
        icon={type.icon}
        count={isExample && type.value ? 1 : 0}
        checked={enabled[index]}
        onChange={checked => setEnabled(previous => previous.map((item, itemIndex) => (
          itemIndex === index ? checked : item
        )))}
      />)}
    />}
  </Page>;
}
