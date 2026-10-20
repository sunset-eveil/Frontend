import styled from '@emotion/styled';
import { colors } from '../styles/colors';
import { Button } from './Button';
import { Logo } from './Icon';

type EveilButtonProps = {
  onClick: () => void;
  showHint?: boolean;
  onDismissHint?: () => void;
};

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 36px;
  border: 1px solid ${colors.accentBorder};
  border-radius: 999px;
  background: ${colors.surface};

  &:hover {
    background: ${colors.selected};
  }
`;

const Tooltip = styled.div`
  position: absolute;
  right: -8px;
  bottom: 48px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 262px;
  padding: 13px 14px 14px;
  border: 1px solid ${colors.accentBorder};
  border-radius: 12px;
  background: ${colors.surfaceRaised};
  box-shadow: 0 0 0 1px #595d6c, 0 6px 18px rgba(0, 0, 0, 0.55);
  font-size: 14px;
  line-height: 21.7px;

  p {
    margin: 0;
    color: ${colors.secondary};
  }

  strong {
    font-weight: 600;
  }

  &::after {
    position: absolute;
    right: 28px;
    bottom: -7px;
    width: 12px;
    height: 12px;
    border-right: 1px solid ${colors.accentBorder};
    border-bottom: 1px solid ${colors.accentBorder};
    background: ${colors.surfaceRaised};
    content: '';
    transform: rotate(45deg);
  }
`;

const TriggerArea = styled.div`
  position: relative;
  width: 74px;
`;

const TooltipAction = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 1px;
`;

export function EveilButton({ onClick, showHint = false, onDismissHint }: EveilButtonProps) {
  return <TriggerArea>
    <Trigger type="button" onClick={onClick} aria-label="Eveil 입력창 열기">
      <Logo />
    </Trigger>
    {showHint && <Tooltip role="region" aria-label="Eveil 사용 안내">
      <strong>Eveil이 여기 있어요</strong>
      <p>
        눌러서 보낼 내용을 입력하면 개인정보를<br />가려서 보내 드려요.
      </p>
      <TooltipAction>
        <Button type="button" compact onClick={onDismissHint}>
          알겠어요
        </Button>
      </TooltipAction>
    </Tooltip>}
  </TriggerArea>;
}

