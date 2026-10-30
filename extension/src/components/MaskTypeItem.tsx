import styled from '@emotion/styled';
import { colors } from '../styles/colors';
import { Icon, type IconName } from './Icon';

type MaskTypeItemProps = {
  label: string;
  icon: IconName;
  count: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
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
  color: ${colors.text};
  background: transparent;
  font-size: 14px;

  &:hover {
    background: ${colors.selected};
  }
`;

const Label = styled.span`
  flex: 1;
  text-align: left;
`;

const Count = styled.span`
  color: ${colors.subtle};
  font-size: 12px;
`;

const Switch = styled.span<{ checked: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  width: 30px;
  height: 18px;
  padding: 2px;
  border-radius: 999px;
  background: ${({ checked }) => checked ? colors.active : colors.border};
`;

const Thumb = styled.span<{ checked: boolean }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${colors.switchThumb};
  transform: ${({ checked }) => checked ? 'translateX(12px)' : 'none'};
`;

export function MaskTypeItem({ label, icon, count, checked, onChange }: MaskTypeItemProps) {
  return <Row
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={`${label} 가리기`}
    onClick={() => onChange(!checked)}
  >
    <Icon name={icon} />
    <Label>{label}</Label>
    <Count>{count}</Count>
    <Switch checked={checked}><Thumb checked={checked} /></Switch>
  </Row>;
}
