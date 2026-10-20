import type { ReactNode } from 'react';
import styled from '@emotion/styled';
import { colors } from '../styles/colors';
import { Icon, type IconName } from './Icon';

type MaskChipProps = { icon: IconName; children: ReactNode };
type MaskStatusProps = { count: number; large?: boolean };

export const PrivacyHighlight = styled.mark`
  border-radius: 3px;
  color: ${colors.highlightText};
  background: ${colors.highlight};
  box-shadow: 0 0 0 2px ${colors.highlight};
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid ${colors.accentBorder};
  border-radius: 7px;
  color: ${colors.accentText};
  background: ${colors.selected};
  font-size: 14px;
  font-weight: 600;
  line-height: 24.5px;
  vertical-align: middle;
`;

const Status = styled.span<{ large: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${colors.status};
  font-size: ${({ large }) => large ? 14 : 12}px;
  line-height: ${({ large }) => large ? '21.7px' : '18.6px'};
`;

export function MaskChip({ icon, children }: MaskChipProps) {
  return <Chip>
    <Icon name={icon} />
    {children}
  </Chip>;
}

export function MaskStatus({ count, large = false }: MaskStatusProps) {
  return <Status role="status" large={large}>
    <Icon name={large ? 'shieldCheckLarge' : 'shieldCheck'} />
    개인정보 {count}건을 가렸어요
  </Status>;
}
