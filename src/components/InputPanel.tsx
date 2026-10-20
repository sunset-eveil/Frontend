import type { ReactNode } from 'react';
import styled from '@emotion/styled';
import { colors } from '../styles/colors';
import { Icon, Logo } from './Icon';
import { Button, IconButton } from './Button';
import { MaskStatus } from './PrivacyText';

type ContentView = 'original' | 'masked';
type ViewTabsProps = {
  value: ContentView;
  onChange: (value: ContentView) => void;
};
type InputPanelProps = {
  value: string;
  onChange: (value: string) => void;
  view: ContentView;
  onViewChange: (view: ContentView) => void;
  originalContent?: ReactNode;
  maskedContent?: ReactNode;
  count?: number;
  onClose: () => void;
  onExpand: () => void;
  onSettings: () => void;
  onSend?: () => void;
};

export const Panel = styled.section`
  width: 760px;
  max-width: 100%;
  overflow: hidden;
  border: 1px solid ${colors.border};
  border-radius: 20px;
  background: ${colors.surface};
  box-shadow:
    0 0 0 4px rgba(145, 132, 217, 0.08),
    0 0 0 1px ${colors.outline},
    0 16px 40px rgba(0, 0, 0, 0.65);
`;

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 54px;
  padding: 8px 8px 8px 14px;
  border-bottom: 1px solid ${colors.divider};
  background: ${colors.surfaceRaised};
`;

const LogoArea = styled.div`
  flex: 1;
  min-width: 50px;

  @media (max-width: 560px) {
    display: none;
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 18px;
  margin: 0 2px;
  background: ${colors.divider};

  @media (max-width: 560px) {
    display: none;
  }
`;

const Tabs = styled.div`
  display: flex;
  padding: 2px;
  border: 1px solid ${colors.border};
  border-radius: 9px;
  background: ${colors.surface};
`;

const Tab = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 31px;
  padding: 6px 10px;
  border: 1px solid ${({ active }) => active ? colors.accentBorder : 'transparent'};
  border-radius: 7px;
  color: ${({ active }) => active ? colors.accentText : colors.muted};
  background: ${({ active }) => active ? colors.selected : 'transparent'};
  font-size: 14px;
  font-weight: 500;
`;

const SendButton = styled(Button)`
  height: 32px;
  padding: 0 12px;
`;

const Content = styled.div`
  position: relative;
  height: 150px;
  margin: 10px 12px;
`;

const TextContent = styled.div`
  height: 100%;
  overflow: auto;
  padding: 5px 6px;
  font-size: 16px;
  line-height: 28.8px;
  white-space: pre-wrap;
`;

const OriginalContent = styled(TextContent)`
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  overflow-wrap: break-word;
`;

const Textarea = styled.textarea<{ masked: boolean }>`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 5px 6px;
  border: 0;
  resize: none;
  color: ${({ masked }) => masked ? 'transparent' : colors.text};
  background: transparent;
  caret-color: ${colors.text};
  font-size: 16px;
  line-height: 28.8px;
`;

const Footer = styled.footer`
  display: flex;
  align-items: center;
  padding: 8px 14px 10px;
  border-top: 1px solid ${colors.divider};
`;

export function ViewTabs({ value, onChange }: ViewTabsProps) {
  return <Tabs role="group" aria-label="내용 보기">
    <Tab
      type="button"
      active={value === 'original'}
      aria-pressed={value === 'original'}
      onClick={() => onChange('original')}
    >
      <Icon name="pencil" />원본
    </Tab>
    <Tab
      type="button"
      active={value === 'masked'}
      aria-pressed={value === 'masked'}
      onClick={() => onChange('masked')}
    >
      <Icon name="shield" />가림
    </Tab>
  </Tabs>;
}

export function InputPanel({
  value,
  onChange,
  view,
  onViewChange,
  originalContent,
  maskedContent,
  count = 0,
  onClose,
  onExpand,
  onSettings,
  onSend,
}: InputPanelProps) {
  return <Panel aria-label="Eveil 입력창">
    <Header>
      <LogoArea><Logo size="editor" /></LogoArea>
      <ViewTabs value={view} onChange={onViewChange} />
      <Divider />
      <IconButton icon="settings" label="가릴 정보 유형 설정" onClick={onSettings} />
      <IconButton icon="expand" label="비교 화면 열기" onClick={onExpand} />
      <SendButton type="button" variant="filled" disabled={!value.trim() || !onSend} onClick={onSend}>
        <Icon name="send" />가려서 보내기
      </SendButton>
      <IconButton icon="close" label="입력창 닫기" onClick={onClose} />
    </Header>
    <Content>
      {view === 'original' && originalContent && <OriginalContent aria-hidden="true">
        {originalContent}
      </OriginalContent>}
      {view === 'original'
        ? <Textarea
          aria-label="보낼 원본 내용"
          value={value}
          masked={Boolean(originalContent)}
          onChange={event => onChange(event.target.value)}
          placeholder="보낼 내용을 입력하세요"
        />
        : <TextContent aria-label="가려진 내용">{maskedContent ?? value}</TextContent>}
    </Content>
    <Footer><MaskStatus count={count} /></Footer>
  </Panel>;
}
