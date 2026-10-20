import type { ReactNode } from "react";
import styled from "@emotion/styled";
import eyeOffIcon from "../assets/mask-eye-off-dark.svg";
import { colors } from "../styles/colors";
import { Icon, type IconName } from "./Icon";

type MaskChipProps = {
  icon: IconName;
  children: ReactNode;
  onClick?: () => void;
};
type MaskStatusProps = { count: number; large?: boolean };

export const PrivacyHighlight = styled.mark`
  border-radius: 3px;
  color: ${colors.highlightText};
  background: ${colors.highlight};
  box-shadow: 0 0 0 2px ${colors.highlight};
`;

const Tooltip = styled.span`
  position: absolute;
  z-index: 10;
  top: calc(100% + 9px);
  left: 50%;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: 6px;
  color: ${colors.surface};
  background: ${colors.text};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  white-space: nowrap;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%) translateY(-2px);
  transition:
    opacity 120ms ease,
    transform 120ms ease,
    visibility 120ms ease;

  &::before {
    position: absolute;
    top: -4px;
    left: 50%;
    width: 8px;
    height: 8px;
    background: ${colors.text};
    content: "";
    transform: translateX(-50%) rotate(45deg);
  }
`;

const TooltipIcon = styled.img`
  display: block;
  flex-shrink: 0;
`;

const Chip = styled.span<{ $clickable: boolean }>`
  position: relative;
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
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  &:hover .mask-tooltip,
  &:focus-visible .mask-tooltip {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${colors.indicator};
    outline-offset: 2px;
  }
`;

const Status = styled.span<{ large: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${colors.status};
  font-size: ${({ large }) => (large ? 14 : 12)}px;
  line-height: ${({ large }) => (large ? "21.7px" : "18.6px")};
`;

export function MaskChip({ icon, children, onClick }: MaskChipProps) {
  return (
    <Chip
      $clickable={Boolean(onClick)}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          onClick();
        }
      }}
    >
      <Icon name={icon} />
      {children}
      {onClick && (
        <Tooltip className="mask-tooltip" role="tooltip">
          <TooltipIcon src={eyeOffIcon} alt="" />
          클릭하면 가리기를 해제해요
        </Tooltip>
      )}
    </Chip>
  );
}

export function MaskStatus({ count, large = false }: MaskStatusProps) {
  return (
    <Status role="status" large={large}>
      <Icon name={large ? "shieldCheckLarge" : "shieldCheck"} />
      개인정보 {count}건을 가렸어요
    </Status>
  );
}
