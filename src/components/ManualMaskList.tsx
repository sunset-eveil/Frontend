import styled from "@emotion/styled";
import eyeOffIcon from "../assets/mask-eye-off.svg";
import type { ManualMask } from "../masking";
import { colors } from "../styles/colors";

type ManualMaskListProps = {
  masks: ManualMask[];
  onRemove: (id: string) => void;
};

const Section = styled.div`
  width: 100%;
  margin-top: 14px;
  padding: 14px 6px 0;
  border-top: 1px solid ${colors.divider};
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  color: ${colors.subtle};
  font-size: 12px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px dashed ${colors.accent};
  border-radius: 8px;
  color: ${colors.secondary};
  background: ${colors.selected};
  font-size: 12px;
`;

const ItemText = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  padding: 0;
  border: 0;
  color: ${colors.muted};
  background: transparent;
  font-size: 16px;
`;

const Icon = styled.img`
  display: block;
  flex-shrink: 0;
`;

export function ManualMaskList({ masks, onRemove }: ManualMaskListProps) {
  if (!masks.length) {
    return null;
  }

  return (
    <Section aria-label="직접 가린 항목">
      <Title>
        <span>직접 가린 항목</span>
        <span>{masks.length}</span>
      </Title>
      {masks.map((mask) => (
        <Item key={mask.id}>
          <Icon src={eyeOffIcon} alt="" />
          <ItemText title={mask.text}>
            {mask.text} → {mask.label}
          </ItemText>
          <RemoveButton
            type="button"
            aria-label={`${mask.text} 직접 가림 해제`}
            onClick={() => onRemove(mask.id)}
          >
            ×
          </RemoveButton>
        </Item>
      ))}
    </Section>
  );
}
