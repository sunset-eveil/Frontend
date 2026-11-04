import type { ReactNode } from "react";
import styled from "@emotion/styled";
import eyeOffIcon from "../assets/mask-eye-off-dark.svg";
import { COLORS } from "../styles/colors";
import { Icon, type IconName } from "./icon";

type MaskChipProps = {
  icon: IconName;
  children: ReactNode;
  onClick?: () => void;
};
type MaskStatusProps = { count: number; isLarge?: boolean };

export const PrivacyHighlight = styled.mark`
  border-radius: 3px;
  color: ${COLORS.highlightText};
  background: ${COLORS.highlight};
  box-shadow: 0 0 0 2px ${COLORS.highlight};
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
  color: ${COLORS.surface};
  background: ${COLORS.text};
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
    background: ${COLORS.text};
    content: "";
    transform: translateX(-50%) rotate(45deg);
  }
`;

const TooltipIcon = styled.img`
  display: block;
  flex-shrink: 0;
`;

const Chip = styled.span<{ $canClick: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px;
  border: 1px solid ${COLORS.accentBorder};
  border-radius: 7px;
  color: ${COLORS.accentText};
  background: ${COLORS.selected};
  font-size: 14px;
  font-weight: 600;
  line-height: 24.5px;
  vertical-align: middle;
  cursor: ${({ $canClick }) => ($canClick ? "pointer" : "default")};

  &:hover .mask-tooltip,
  &:focus-visible .mask-tooltip {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.indicator};
    outline-offset: 2px;
  }
`;

const Status = styled.span<{ isLarge: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${COLORS.status};
  font-size: ${({ isLarge }) => (isLarge ? 14 : 12)}px;
  line-height: ${({ isLarge }) => (isLarge ? "21.7px" : "18.6px")};
`;

export function MaskChip({ icon, children, onClick }: MaskChipProps): ReactNode {
  return (
    <Chip
      $canClick={Boolean(onClick)}
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

export function MaskStatus({ count, isLarge = false }: MaskStatusProps): ReactNode {
  return (
    <Status role="status" isLarge={isLarge}>
      <Icon name={isLarge ? "shieldCheckLarge" : "shieldCheck"} />
      개인정보 {count}건을 가렸어요
    </Status>
  );
}
