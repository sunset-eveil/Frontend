import type { ButtonHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { colors } from '../styles/colors';
import { Icon, type IconName } from './Icon';

type ButtonVariant = 'outline' | 'filled' | 'ghost';
type ButtonStyleProps = { variant?: ButtonVariant; compact?: boolean };
type ControlProps = { size: number; bordered: boolean };
type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  label: string;
  size?: 32 | 36 | 40;
  bordered?: boolean;
};

export const Button = styled.button<ButtonStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${({ compact }) => compact ? '6px 12px' : '10px 18px'};
  border: 1px solid ${({ variant }) => (
    variant === 'ghost' ? 'transparent' : colors.accent
  )};
  border-radius: 8px;
  color: ${colors.accentText};
  background: ${({ variant }) => (
    variant === 'filled' ? colors.accentFill : 'transparent'
  )};
  font-size: ${({ compact }) => compact ? 12 : 14}px;
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${colors.selected};
  }

  &:disabled {
    opacity: 0.45;
  }
`;

const Control = styled.button<ControlProps>`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  padding: 0;
  border: 1px solid ${({ bordered }) => (
    bordered ? colors.border : 'transparent'
  )};
  border-radius: 8px;
  color: ${colors.muted};
  background: transparent;

  &:hover:not(:disabled) {
    background: ${colors.selected};
  }

  &:disabled {
    opacity: 0.45;
  }
`;

export function IconButton({ icon, label, size = 32, bordered = false, ...props }: IconButtonProps) {
  return (
    <Control
      type="button"
      aria-label={label}
      title={label}
      size={size}
      bordered={bordered}
      {...props}
    >
      <Icon name={icon} />
    </Control>
  );
}
