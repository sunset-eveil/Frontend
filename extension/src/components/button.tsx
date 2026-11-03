import type { ReactNode } from "react";
import type { ButtonHTMLAttributes } from 'react';
import styled from '@emotion/styled';
import { COLORS } from '../styles/colors';
import { Icon, type IconName } from './icon';

type ButtonVariant = 'outline' | 'filled' | 'ghost';
type ButtonStyleProps = { variant?: ButtonVariant; isCompact?: boolean };
type ControlProps = { size: number; hasBorder: boolean };
type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconName;
  label: string;
  size?: 32 | 36 | 40;
  hasBorder?: boolean;
};

export const Button = styled.button<ButtonStyleProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: ${({ isCompact }) => isCompact ? '6px 12px' : '10px 18px'};
  border: 1px solid ${({ variant }) => (
    variant === 'ghost' ? 'transparent' : COLORS.accent
  )};
  border-radius: 8px;
  color: ${COLORS.accentText};
  background: ${({ variant }) => (
    variant === 'filled' ? COLORS.accentFill : 'transparent'
  )};
  font-size: ${({ isCompact }) => isCompact ? 12 : 14}px;
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: ${COLORS.selected};
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
  border: 1px solid ${({ hasBorder }) => (
    hasBorder ? COLORS.border : 'transparent'
  )};
  border-radius: 8px;
  color: ${COLORS.muted};
  background: transparent;

  &:hover:not(:disabled) {
    background: ${COLORS.selected};
  }

  &:disabled {
    opacity: 0.45;
  }
`;

export function IconButton({ icon, label, size = 32, hasBorder = false, ...props }: IconButtonProps): ReactNode {
  return (
    <Control
      type="button"
      aria-label={label}
      title={label}
      size={size}
      hasBorder={hasBorder}
      {...props}
    >
      <Icon name={icon} />
    </Control>
  );
}
