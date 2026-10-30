import styled from "@emotion/styled";
import checkIcon from "../assets/mask-check.svg";
import eyeOffIcon from "../assets/mask-eye-off.svg";
import popoverArrow from "../assets/mask-popover-arrow.svg";
import type { MaskDefinition, MaskTypeId } from "../masking";
import { colors } from "../styles/colors";
import { Icon } from "./Icon";

type MaskSelectionPopoverProps = {
  text: string;
  type: MaskTypeId;
  remember: boolean;
  options: MaskDefinition[];
  position: {
    left: number;
    top: number;
  };
  onTypeChange: (type: MaskTypeId) => void;
  onRememberChange: (remember: boolean) => void;
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
  border: 1px solid ${colors.accentBorder};
  border-radius: 12px;
  background: ${colors.surface};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);

  @media (max-width: 560px) {
    left: 8px;
  }
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${colors.text};
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
  color: ${colors.secondary};
  background: ${colors.surfaceRaised};
  font-size: 13px;
  white-space: nowrap;
`;

const Arrow = styled.span`
  color: ${colors.subtle};
`;

const SelectedType = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border: 1px dashed ${colors.accent};
  border-radius: 6px;
  color: ${colors.accentText};
  background: ${colors.selected};
`;

const Label = styled.span`
  color: ${colors.subtle};
  font-size: 12px;
`;

const Options = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Option = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 26px;
  padding: 0 8px;
  border: 1px solid
    ${({ $selected }) => ($selected ? colors.accent : colors.border)};
  border-radius: 999px;
  color: ${({ $selected }) => ($selected ? colors.accentText : colors.muted)};
  background: ${({ $selected }) =>
    $selected ? colors.selected : "transparent"};
  font-size: 12px;
`;

const Remember = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 18px;
  padding: 0;
  border: 0;
  color: ${colors.muted};
  background: transparent;
  font-size: 12px;
  text-align: left;
`;

const Checkbox = styled.span<{ $checked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: 1px solid
    ${({ $checked }) => ($checked ? colors.accent : colors.border)};
  border-radius: 4px;
  background: ${({ $checked }) => ($checked ? colors.accent : "transparent")};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Action = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 14px;
  border: 1px solid
    ${({ $primary }) => ($primary ? colors.accent : colors.border)};
  border-radius: 8px;
  color: ${({ $primary }) => ($primary ? "#FFFFFF" : colors.muted)};
  background: ${({ $primary }) => ($primary ? colors.accent : "transparent")};
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
  remember,
  options,
  position,
  onTypeChange,
  onRememberChange,
  onCancel,
  onMask,
}: MaskSelectionPopoverProps) {
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
            $selected={option.id === type}
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
        aria-checked={remember}
        onClick={() => onRememberChange(!remember)}
      >
        <Checkbox $checked={remember}>
          {remember && <SmallIcon src={checkIcon} alt="" />}
        </Checkbox>
        다음에도 이 단어는 자동으로 가리기
      </Remember>
      <Actions>
        <Action type="button" onClick={onCancel}>
          취소
        </Action>
        <Action type="button" $primary onClick={onMask}>
          <SmallIcon src={eyeOffIcon} alt="" />
          가리기
        </Action>
      </Actions>
      <PopoverArrow src={popoverArrow} alt="" />
    </Popover>
  );
}
