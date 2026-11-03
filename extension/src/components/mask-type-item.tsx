import type { ReactNode } from "react";
import styled from '@emotion/styled';
import { COLORS } from '../styles/colors';
import { Icon, type IconName } from './icon';

type MaskTypeItemProps = {
  label: string;
  icon: IconName;
  count: number;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

const Row = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 38px;
  padding: 10px 6px;
  border: 0;
  border-radius: 8px;
  color: ${COLORS.text};
  background: transparent;
  font-size: 14px;

  &:hover {
    background: ${COLORS.selected};
  }
`;

const Label = styled.span`
  flex: 1;
  text-align: left;
`;

const Count = styled.span`
  color: ${COLORS.subtle};
  font-size: 12px;
`;

const Switch = styled.span<{ isChecked: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  width: 30px;
  height: 18px;
  padding: 2px;
  border-radius: 999px;
  background: ${({ isChecked }) => isChecked ? COLORS.active : COLORS.border};
`;

const Thumb = styled.span<{ isChecked: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${COLORS.switchThumb};
  transform: ${({ isChecked }) => isChecked ? 'translateX(12px)' : 'none'};
`;

export function MaskTypeItem({ label, icon, count, isChecked, onChange }: MaskTypeItemProps): ReactNode {
  return <Row
    type="button"
    role="switch"
    aria-isChecked={isChecked}
    aria-label={`${label} 가리기`}
    onClick={() => onChange(!isChecked)}
  >
    <Icon name={icon} />
    <Label>{label}</Label>
    <Count>{count}</Count>
    <Switch isChecked={isChecked}><Thumb isChecked={isChecked} /></Switch>
  </Row>;
}
