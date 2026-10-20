import { useEffect, useRef, type ReactNode } from 'react';
import styled from '@emotion/styled';
import { colors } from '../styles/colors';
import { Panel } from './InputPanel';
import { Icon, Logo } from './Icon';
import { IconButton, Button } from './Button';
import { MaskStatus } from './PrivacyText';

type ComparisonPanelProps = {
  original: ReactNode;
  masked: ReactNode;
  types: ReactNode;
  count: number;
  onClose: () => void;
  onCollapse: () => void;
  onSend?: () => void;
};
type ContentColumnProps = {
  masked: boolean;
};

const Dialog = styled.dialog`
  position: fixed;
  inset: 0;
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 24px;
  border: 0;
  color: ${colors.text};
  background: transparent;

  &[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &::backdrop {
    background: ${colors.overlay};
    backdrop-filter: blur(1.5px);
  }
`;

const Comparison = styled(Panel)`
  display: flex;
  flex-direction: column;
  width: 1180px;
  height: min(760px, calc(100dvh - 48px));
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px 12px 20px;
  border-bottom: 1px solid ${colors.divider};
  background: ${colors.surfaceRaised};
`;

const Divider = styled.span`
  width: 1px;
  height: 18px;
  background: ${colors.divider};
`;

const Description = styled.span`
  flex: 1;
  color: ${colors.muted};
  font-size: 14px;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const Sidebar = styled.aside`
  flex-shrink: 0;
  width: 210px;
  overflow: auto;
  padding: 18px 12px;
  border-right: 1px solid ${colors.divider};
`;

const SidebarTitle = styled.h2`
  margin: 0 6px 12px;
  color: ${colors.subtle};
  font-size: 12px;
  font-weight: 600;
  line-height: 18.6px;
`;

const Columns = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 36px;
  min-width: 520px;
  padding: 18px 20px 16px;
`;

const Column = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ColumnTitle = styled.h2<ContentColumnProps>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  height: 32px;
  margin: 0 0 10px;
  color: ${({ masked }) => masked ? colors.status : colors.muted};
  font-size: 12px;
  font-weight: 600;
`;

const ColumnContent = styled.div<ContentColumnProps>`
  flex: 1;
  overflow: auto;
  padding: 16px 18px;
  border: 1px solid ${({ masked }) => masked ? colors.accentBorder : colors.border};
  border-radius: 16px;
  background: ${({ masked }) => masked ? colors.surface : colors.surfaceRaised};
  font-size: 16px;
  line-height: ${({ masked }) => masked ? '32px' : '29.6px'};
  white-space: pre-wrap;
`;

const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid ${colors.divider};
  background: ${colors.surfaceRaised};
`;

export function ComparisonPanel({
  original,
  masked,
  types,
  count,
  onClose,
  onCollapse,
  onSend,
}: ComparisonPanelProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;

    element?.showModal();
    return () => element?.close();
  }, []);

  const columns = [
    { label: '원본', icon: 'pencil' as const, content: original, masked: false },
    { label: '가려짐 (ChatGPT에 전송)', icon: 'shieldCheck' as const, content: masked, masked: true },
  ];

  return <Dialog
    ref={dialog}
    aria-label="개인정보 가림 비교"
    onCancel={event => {
      event.preventDefault();
      onClose();
    }}
  >
    <Comparison>
      <Header>
        <Logo size="comparison" />
        <Divider />
        <Description>ChatGPT에 보내기 전, 가려지는 정보를 확인하세요</Description>
        <IconButton icon="collapse" label="입력창으로 돌아가기" size={36} bordered onClick={onCollapse} />
        <IconButton icon="closeLarge" label="비교 화면 닫기" size={36} onClick={onClose} />
      </Header>
      <Body>
        <Sidebar>
          <SidebarTitle>가릴 정보 유형</SidebarTitle>
          {types}
        </Sidebar>
        <Columns>
          {columns.map(column => <Column key={column.label}>
            <ColumnTitle masked={column.masked}>
              <Icon name={column.icon} />
              {column.label}
            </ColumnTitle>
            <ColumnContent masked={column.masked}>{column.content}</ColumnContent>
          </Column>)}
        </Columns>
      </Body>
      <Footer>
        <MaskStatus count={count} large />
        <Button type="button" variant="filled" disabled={!onSend} onClick={onSend}>
          <Icon name="send" />가려서 ChatGPT에 보내기
        </Button>
      </Footer>
    </Comparison>
  </Dialog>;
}
