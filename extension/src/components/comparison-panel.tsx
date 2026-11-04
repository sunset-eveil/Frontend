import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import styled from "@emotion/styled";
import eyeOffIcon from "../assets/mask-eye-off.svg";
import pointerIcon from "../assets/mask-pointer.svg";
import type { ManualMask, MaskDefinition, MaskTypeId } from "../masking";
import { COLORS } from "../styles/colors";
import { Panel } from "./input-panel";
import { Icon, Logo } from "./icon";
import { IconButton, Button } from "./button";
import { MaskSelectionPopover } from "./mask-selection-popover";
import { ManualMaskList } from "./manual-mask-list";
import { MaskStatus } from "./privacy-text";

type ComparisonPanelProps = {
  original: ReactNode;
  masked: ReactNode;
  types: ReactNode;
  count: number;
  maskOptions: MaskDefinition[];
  manualMasks: ManualMask[];
  isSending?: boolean;
  requestStatus?: { message: string; isError: boolean } | null;
  onClose: () => void;
  onCollapse: () => void;
  onAddManualMask: (
    mask: Omit<ManualMask, "id" | "label" | "maskCode">,
  ) => void;
  onRemoveManualMask: (id: string) => void;
  onSend?: () => void;
};
type ContentColumnProps = {
  isMasked: boolean;
};
type SelectionDraft = {
  text: string;
  start: number;
  end: number;
  position: {
    left: number;
    top: number;
  };
};

const Dialog = styled.dialog`
  position: fixed;
  inset: 0;
  width: 100%;
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  padding: 24px;
  border: 0;
  color: ${COLORS.text};
  background: transparent;

  &[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &::backdrop {
    background: ${COLORS.overlay};
    backdrop-filter: blur(1.5px);
  }

  @media (max-width: 760px) {
    padding: 8px;
  }
`;

const Comparison = styled(Panel)`
  display: flex;
  flex-direction: column;
  width: 980px;
  height: min(630px, calc(100dvh - 48px));
  flex-shrink: 0;

  @media (max-width: 760px) {
    height: calc(100dvh - 16px);
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px 12px 20px;
  border-bottom: 1px solid ${COLORS.divider};
  background: ${COLORS.surfaceRaised};

  @media (max-width: 560px) {
    gap: 6px;
    padding: 10px;
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 18px;
  background: ${COLORS.divider};
`;

const Description = styled.span`
  flex: 1;
  color: ${COLORS.muted};
  font-size: 14px;

  @media (max-width: 560px) {
    display: none;
  }
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: auto;

  @media (max-width: 760px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside`
  flex-shrink: 0;
  width: 210px;
  overflow: auto;
  padding: 18px 12px;
  border-right: 1px solid ${COLORS.divider};

  @media (max-width: 760px) {
    width: 100%;
    max-height: 190px;
    border-right: 0;
    border-bottom: 1px solid ${COLORS.divider};
  }
`;

const SidebarTitle = styled.h2`
  margin: 0 6px 12px;
  color: ${COLORS.subtle};
  font-size: 12px;
  font-weight: 600;
  line-height: 18.6px;
`;

const Columns = styled.div`
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 36px;
  min-width: 520px;
  padding: 18px 20px 16px;

  @media (max-width: 760px) {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: 18px;
    padding: 14px;
  }
`;

const Column = styled.section`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ColumnTitle = styled.h2<ContentColumnProps>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  height: 32px;
  margin: 0 0 10px;
  color: ${({ isMasked }) => (isMasked ? COLORS.status : COLORS.muted)};
  font-size: 12px;
  font-weight: 600;
`;

const ColumnTitleText = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DragHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  padding: 3px 8px;
  border-radius: 6px;
  color: ${COLORS.accentText};
  background: ${COLORS.selected};
  font-size: 11px;
  font-weight: 500;
`;

const SmallIcon = styled.img`
  display: block;
  flex-shrink: 0;
`;

const ColumnContent = styled.div<ContentColumnProps>`
  position: relative;
  flex: 1;
  overflow: auto;
  padding: 16px 18px;
  border: 1px solid
    ${({ isMasked }) => (isMasked ? COLORS.accentBorder : COLORS.border)};
  border-radius: 16px;
  background: ${({ isMasked }) =>
    isMasked ? COLORS.surface : COLORS.surfaceRaised};
  font-size: 16px;
  line-height: ${({ isMasked }) => (isMasked ? "32px" : "29.6px")};
  white-space: pre-wrap;
`;

const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid ${COLORS.divider};
  background: ${COLORS.surfaceRaised};

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column;
    padding: 10px 14px;
  }
`;

const FooterStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ManualCount = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border: 1px dashed ${COLORS.accent};
  border-radius: 999px;
  color: ${COLORS.accentText};
  font-size: 12px;
`;

const RequestMessage = styled.span<{ isError: boolean }>`
  color: ${({ isError }) => (isError ? "#EF625D" : COLORS.muted)};
  font-size: 12px;
`;

function getTextOffset(container: HTMLElement, node: Node, offset: number): number {
  const range = document.createRange();

  range.selectNodeContents(container);
  range.setEnd(node, offset);

  return range.toString().length;
}

export function ComparisonPanel({
  original,
  masked,
  types,
  count,
  maskOptions,
  manualMasks,
  isSending = false,
  requestStatus,
  onClose,
  onCollapse,
  onAddManualMask,
  onRemoveManualMask,
  onSend,
}: ComparisonPanelProps): ReactNode {
  const dialog = useRef<HTMLDialogElement>(null);
  const originalContent = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<SelectionDraft>();
  const [selectedType, setSelectedType] = useState<MaskTypeId>("custom");
  const [shouldRemember, setRemember] = useState(true);

  useEffect(() => {
    const element = dialog.current;

    element?.showModal();
    return () => element?.close();
  }, []);

  const columns = [
    {
      label: "원본",
      icon: "pencil" as const,
      content: original,
      isMasked: false,
    },
    {
      label: "가려짐 (ChatGPT에 전송)",
      icon: "shieldCheck" as const,
      content: masked,
      isMasked: true,
    },
  ];

  const handleSelection = (): void => {
    const container = originalContent.current;
    const selected = window.getSelection();

    if (
      !container ||
      !selected ||
      selected.rangeCount === 0 ||
      selected.isCollapsed
    ) {
      return;
    }

    const range = selected.getRangeAt(0);

    if (!container.contains(range.commonAncestorContainer)) {
      return;
    }

    const rawText = range.toString();
    const text = rawText.trim();

    if (!text) {
      return;
    }

    const leadingSpace = rawText.length - rawText.trimStart().length;
    const start =
      getTextOffset(container, range.startContainer, range.startOffset) +
      leadingSpace;
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.left - containerRect.left, 12),
      container.clientWidth - 312,
    );
    const top = Math.min(
      Math.max(rect.bottom - containerRect.top + 12, 12),
      container.clientHeight - 300,
    );

    setSelection({
      text,
      start,
      end: start + text.length,
      position: { left, top },
    });
    setSelectedType("custom");
    setRemember(true);
  };

  const closeSelection = (): void => {
    setSelection(undefined);
    window.getSelection()?.removeAllRanges();
  };

  const handlePointerDown = (event: PointerEvent): void => {
    const target = event.target as Element;

    if (selection && !target.closest('[aria-label="선택한 부분 가리기"]')) {
      closeSelection();
    }
  };

  const addManualMask = (): void => {
    if (!selection) {
      return;
    }

    onAddManualMask({
      start: selection.start,
      end: selection.end,
      text: selection.text,
      type: selectedType,
      shouldRemember,
    });
    closeSelection();
  };

  return (
    <Dialog
      ref={dialog}
      aria-label="개인정보 가림 비교"
      onPointerDown={handlePointerDown}
      onCancel={(event) => {
        event.preventDefault();

        if (selection) {
          closeSelection();
        } else {
          onClose();
        }
      }}
    >
      <Comparison>
        <Header>
          <Logo size="comparison" />
          <Divider />
          <Description>
            ChatGPT에 보내기 전, 가려지는 정보를 확인하세요
          </Description>
          <IconButton
            icon="collapse"
            label="입력창으로 돌아가기"
            size={36}
            hasBorder
            onClick={onCollapse}
          />
          <IconButton
            icon="closeLarge"
            label="비교 화면 닫기"
            size={36}
            onClick={onClose}
          />
        </Header>
        <Body>
          <Sidebar>
            <SidebarTitle>가릴 정보 유형</SidebarTitle>
            {types}
            <ManualMaskList masks={manualMasks} onRemove={onRemoveManualMask} />
          </Sidebar>
          <Columns>
            {columns.map((column) => (
              <Column key={column.label}>
                <ColumnTitle isMasked={column.isMasked}>
                  <ColumnTitleText>
                    <Icon name={column.icon} />
                    {column.label}
                  </ColumnTitleText>
                  {!column.isMasked && (
                    <DragHint>
                      <SmallIcon src={pointerIcon} alt="" />
                      드래그해서 직접 가리기
                    </DragHint>
                  )}
                </ColumnTitle>
                <ColumnContent
                  ref={column.isMasked ? undefined : originalContent}
                  isMasked={column.isMasked}
                  onMouseUp={column.isMasked ? undefined : handleSelection}
                >
                  {column.content}
                  {!column.isMasked && selection && (
                    <MaskSelectionPopover
                      text={selection.text}
                      type={selectedType}
                      shouldRemember={shouldRemember}
                      options={maskOptions}
                      position={selection.position}
                      onTypeChange={setSelectedType}
                      onRememberChange={setRemember}
                      onCancel={closeSelection}
                      onMask={addManualMask}
                    />
                  )}
                </ColumnContent>
              </Column>
            ))}
          </Columns>
        </Body>
        <Footer>
          <FooterStatus>
            <MaskStatus count={count} isLarge />
            {manualMasks.length > 0 && (
              <ManualCount>
                <SmallIcon src={eyeOffIcon} alt="" />
                직접 가림 {manualMasks.length}건
              </ManualCount>
            )}
            {requestStatus && (
              <RequestMessage
                isError={requestStatus.isError}
                role={requestStatus.isError ? "alert" : "status"}
              >
                {requestStatus.message}
              </RequestMessage>
            )}
          </FooterStatus>
          <Button
            type="button"
            variant="filled"
            disabled={!onSend || isSending}
            onClick={onSend}
          >
            <Icon name="send" />
            가려서 ChatGPT에 보내기
          </Button>
        </Footer>
      </Comparison>
    </Dialog>
  );
}
