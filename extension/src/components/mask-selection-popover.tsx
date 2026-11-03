import type { ReactNode } from "react";
import styled from "@emotion/styled";
import checkIcon from "../assets/mask-check.svg";
import eyeOffIcon from "../assets/mask-eye-off.svg";
import popoverArrow from "../assets/mask-popover-arrow.svg";
import type { MaskDefinition, MaskTypeId } from "../masking";
import { COLORS } from "../styles/colors";
import { Icon } from "./icon";

type MaskSelectionPopoverProps = {
  text: string;
  type: MaskTypeId;
  shouldRemember: boolean;
  options: MaskDefinition[];
  position: {
    left: number;
    top: number;
  };
  onTypeChange: (type: MaskTypeId) => void;
  onRememberChange: (shouldRemember: boolean) => void;
  onCancel: () => void;
  onMask: () => void;
};

const Popover = styled.div<{ $left: number; $top: number }>`
  position: absolute;
  z-index: 5;
  left: ${({ $left }) => $left}px;
  top: ${({ $top }) => $top}px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
  padding: 14px;
  border: 1px solid ${COLORS.accentBorder};
  border-radius: 12px;
  background: ${COLORS.surface};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);

  @media (max-width: 560px) {
    left: 8px;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${COLORS.text};
  font-size: 14px;
  font-weight: 600;
`;

const SmallIcon = styled.img`
  display: block;
  flex-shrink: 0;
`;

const Selection = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 10px;
  overflow: hidden;
  border-radius: 7px;
  color: ${COLORS.secondary};
  background: ${COLORS.surfaceRaised};
  font-size: 13px;
  white-space: nowrap;
`;

const Arrow = styled.span`
  color: ${COLORS.subtle};
`;

const SelectedType = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border: 1px dashed ${COLORS.accent};
  border-radius: 6px;
  color: ${COLORS.accentText};
  background: ${COLORS.selected};
`;

const Label = styled.span`
  color: ${COLORS.subtle};
  font-size: 12px;
`;

const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Option = styled.button<{ $isSelected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  border: 1px solid
    ${({ $isSelected }) => ($isSelected ? COLORS.accent : COLORS.border)};
  border-radius: 999px;
  color: ${({ $isSelected }) => ($isSelected ? COLORS.accentText : COLORS.muted)};
  background: ${({ $isSelected }) =>
    $isSelected ? COLORS.selected : "transparent"};
  font-size: 12px;
`;

const Remember = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 18px;
  padding: 0;
  border: 0;
  color: ${COLORS.muted};
  background: transparent;
  font-size: 12px;
  text-align: left;
`;

const Checkbox = styled.span<{ $isChecked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: 1px solid
    ${({ $isChecked }) => ($isChecked ? COLORS.accent : COLORS.border)};
  border-radius: 4px;
  background: ${({ $isChecked }) => ($isChecked ? COLORS.accent : "transparent")};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Action = styled.button<{ $isPrimary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid
    ${({ $isPrimary }) => ($isPrimary ? COLORS.accent : COLORS.border)};
  border-radius: 8px;
  color: ${({ $isPrimary }) => ($isPrimary ? "#FFFFFF" : COLORS.muted)};
  background: ${({ $isPrimary }) => ($isPrimary ? COLORS.accent : "transparent")};
  font-size: 13px;
  font-weight: 500;
`;

const PopoverArrow = styled.img`
  position: absolute;
  bottom: -8px;
  left: 90px;
`;

export function MaskSelectionPopover({
  text,
  type,
  shouldRemember,
  options,
  position,
  onTypeChange,
  onRememberChange,
  onCancel,
  onMask,
}: MaskSelectionPopoverProps): ReactNode {
  const selected =
    options.find((option) => option.id === type) ?? options.at(-1);

  return (
    <Popover
      role="dialog"
      aria-label="선택한 부분 가리기"
      $left={position.left}
      $top={position.top}
    >
      <Title>
        <SmallIcon src={eyeOffIcon} alt="" />
        선택한 부분 가리기
      </Title>
      <Selection>
        “{text}”<Arrow>→</Arrow>
        {selected && (
          <SelectedType>
            <Icon name={selected.icon} />
            {selected.label}_1
          </SelectedType>
        )}
      </Selection>
      <Label>마스킹 유형</Label>
      <Options>
        {options.map((option) => (
          <Option
            key={option.id}
            type="button"
            $isSelected={option.id === type}
            aria-pressed={option.id === type}
            onClick={() => onTypeChange(option.id)}
          >
            <Icon name={option.icon} />
            {option.label}
          </Option>
        ))}
      </Options>
      <Remember
        type="button"
        role="checkbox"
        aria-checked={shouldRemember}
        onClick={() => onRememberChange(!shouldRemember)}
      >
        <Checkbox $isChecked={shouldRemember}>
          {shouldRemember && <SmallIcon src={checkIcon} alt="" />}
        </Checkbox>
        다음에도 이 단어는 자동으로 가리기
      </Remember>
      <Actions>
        <Action type="button" onClick={onCancel}>
          취소
        </Action>
        <Action type="button" $isPrimary onClick={onMask}>
          <SmallIcon src={eyeOffIcon} alt="" />
          가리기
        </Action>
      </Actions>
      <PopoverArrow src={popoverArrow} alt="" />
    </Popover>
  );
}
