import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import type { MaskDefinition } from '../masking';
import { COLORS } from '../styles/colors';
import { IconButton } from './button';
import { MaskTypeItem } from './mask-type-item';

type MaskTypeModalProps = {
  anchor: DOMRect;
  options: MaskDefinition[];
  enabled: boolean[];
  counts: number[];
  onChange: (index: number, isChecked: boolean) => void;
  onClose: () => void;
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 10;
`;

const Modal = styled.section<{ left: number; top: number }>`
  position: absolute;
  left: ${({ left }) => left}px;
  top: ${({ top }) => top}px;
  width: 240px;
  max-height: calc(100dvh - 16px);
  overflow: auto;
  padding: 10px 8px 12px 14px;
  border: 1px solid ${COLORS.accentBorder};
  border-radius: 14px;
  color: ${COLORS.text};
  background: ${COLORS.surfaceRaised};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  height: 32px;
  margin-bottom: 6px;
  padding-left: 6px;
`;

const Title = styled.span`
  flex: 1;
  color: ${COLORS.subtle};
  font-size: 12px;
  font-weight: 700;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export function MaskTypeModal({
  anchor,
  options,
  enabled,
  counts,
  onChange,
  onClose,
}: MaskTypeModalProps): ReactNode {
  const left = Math.max(8, Math.min(anchor.left + anchor.width / 2 - 120, window.innerWidth - 248));
  const top = Math.max(8, Math.min(anchor.bottom + 6, window.innerHeight - 348));

  return createPortal(
    <Overlay onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <Modal role="dialog" aria-label="가릴 정보 유형" left={left} top={top}>
        <Header>
          <Title>가릴 정보 유형</Title>
          <IconButton icon="close" label="유형 선택 닫기" onClick={onClose} />
        </Header>
        <List>
          {options.map((option, index) => option.id !== 'custom' && (
            <MaskTypeItem
              key={option.id}
              label={option.label}
              icon={option.id === 'amount' ? 'coins' : option.icon}
              count={counts[index]}
              isChecked={enabled[index]}
              onChange={(isChecked) => onChange(index, isChecked)}
            />
          ))}
        </List>
      </Modal>
    </Overlay>,
    document.body,
  );
}
