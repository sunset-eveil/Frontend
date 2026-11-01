import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import bgImage from "./assets/bg.png";
import { ComparisonPanel } from "./components/ComparisonPanel";
import { EveilButton } from "./components/EveilButton";
import { Icon, type IconName } from "./components/Icon";
import { InputPanel } from "./components/InputPanel";
import { MaskTypeItem } from "./components/MaskTypeItem";
import { MaskChip, PrivacyHighlight } from "./components/PrivacyText";
import {
  MASK_DEFINITIONS,
  type ManualMask,
  type MaskDefinition,
} from "./masking";
import { colors } from "./styles/colors";
import {
  createMasking,
  deleteMapping,
  getMaskCode,
  putMapping,
} from "./api/maskings";

type Screen = "button" | "chat" | "comparison";
type TextCaret = {
  start: number;
  end: number;
};
type Suggestion = {
  icon: IconName;
  label: string;
};
type MaskSegment = {
  start: number;
  end: number;
  definition: MaskDefinition;
  manual?: ManualMask;
};

const Page = styled.main`
  display: flex;
  width: 100%;
  min-height: 100dvh;
  overflow-x: hidden;
  color: ${colors.chatText};
  background-color: ${colors.background};
  background-image: url(${bgImage});
  background-position: center top;
  background-repeat: no-repeat;
  background-size: cover;
`;

const Content = styled.section`
  position: relative;
  display: flex;
  flex: 0 0 86.46%;
  flex-direction: column;
  min-width: 0;
  min-height: 100dvh;
  margin-left: 13.54%;

  @media (max-width: 760px) {
    flex-basis: 100%;
    margin-left: 0;
  }
`;

const Workspace = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100dvh;
  padding: 38vh 24px 8vh;

  @media (max-width: 520px) {
    padding: 38vh 12px 6vh;
  }
`;

const Heading = styled.h1`
  margin: 0 0 28px;
  padding: 2px 12px;
  color: ${colors.heading};
  background: ${colors.background};
  font-size: clamp(24px, 2.5vw, 30px);
  font-weight: 500;
  line-height: 33.6px;
  letter-spacing: -0.3px;
`;

const WorkspaceContent = styled.div`
  width: min(760px, 100%);
`;

const SendStatus = styled.p<{ error?: boolean }>`
  width: min(760px, 100%);
  margin: 12px 0 0;
  color: ${({ error }) => (error ? "#EF625D" : colors.muted)};
  font-size: 14px;
  line-height: 1.5;
`;

const Prompt = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 58px;
  padding: 0 10px 0 16px;
  border: 1px solid ${colors.chatInputBorder};
  border-radius: 28px;
  background: ${colors.chatInput};
`;

const PromptInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: 0;
  color: ${colors.text};
  background: transparent;
  font-size: 16px;

  &::placeholder {
    color: ${colors.chatMuted};
    opacity: 1;
  }
`;

const PromptMode = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 0;
  color: ${colors.chatText};
  font-size: 16px;
`;

const EveilSlot = styled.div`
  width: 74px;
  height: 36px;
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 6px;
  border: 0;
  border-radius: 50%;
  background: ${colors.chatButton};
`;

const Suggestions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 24px 8px 0;
`;

const SuggestionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 12px;
  color: ${colors.chatText};
  background: transparent;
  font-size: 16px;
  text-align: left;

  &:hover {
    background: ${colors.chatSelected};
  }
`;

const suggestions: Suggestion[] = [
  { icon: "file", label: "이력서 자기소개 부분 다듬어 줘" },
  { icon: "package", label: "010-5821-3304로 온 택배 문자가 진짜인지 봐줘" },
  {
    icon: "firstAid",
    label: "주민번호 950412-2123456으로 보험 청구하는 방법 알려줘",
  },
];

function countOccurrences(text: string, query: string) {
  return text.split(query).length - 1;
}

export function PreviewPage() {
  const [screen, setScreen] = useState<Screen>("button");
  const [showHint, setShowHint] = useState(
    () => localStorage.getItem("eveil-hint-shown") !== "true",
  );
  const [value, setValue] = useState("");
  const [caret, setCaret] = useState<TextCaret>({ start: 0, end: 0 });
  const [view, setView] = useState<"original" | "masked">("original");
  const [enabled, setEnabled] = useState(MASK_DEFINITIONS.map(() => true));
  const [manualMasks, setManualMasks] = useState<ManualMask[]>([]);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{
    message: string;
    error: boolean;
  } | null>(null);

  useEffect(() => {
    if (showHint) {
      localStorage.setItem("eveil-hint-shown", "true");
    }
  }, [showHint]);

  const autoCount = MASK_DEFINITIONS.reduce(
    (total, definition, index) =>
      enabled[index]
        ? total +
          definition.values.reduce(
            (valueTotal, valueToMask) =>
              valueTotal + countOccurrences(value, valueToMask),
            0,
          )
        : total,
    0,
  );
  const count = autoCount + manualMasks.length;

  const removeManualMask = async (id: string) => {
    const mask = manualMasks.find((item) => item.id === id);
    if (!mask) return;

    setSending(true);
    setSendStatus({
      message: "마스킹 해제를 요청하는 중입니다…",
      error: false,
    });
    try {
      await deleteMapping(mask.maskCode);
      setManualMasks((previous) => previous.filter((item) => item.id !== id));
      setSendStatus({
        message: "마스킹을 해제했습니다. (HTTP 204)",
        error: false,
      });
    } catch (error) {
      setSendStatus({
        message:
          error instanceof Error
            ? error.message
            : "마스킹 해제에 실패했습니다.",
        error: true,
      });
    } finally {
      setSending(false);
    }
  };

  const sendForMasking = async () => {
    if (!value.trim()) {
      setSendStatus({ message: "마스킹할 내용을 입력해 주세요.", error: true });
      return;
    }
    setSending(true);
    setSendStatus({ message: "마스킹 API에 요청 중입니다…", error: false });
    try {
      await createMasking(
        value,
        MASK_DEFINITIONS.filter((_, index) => enabled[index]).map(
          (definition) => definition.id,
        ),
      );
      setSendStatus({
        message: "마스킹 매핑이 업데이트됐습니다. (HTTP 204)",
        error: false,
      });
    } catch (error) {
      setSendStatus({
        message:
          error instanceof Error
            ? error.message
            : "마스킹 요청에 실패했습니다.",
        error: true,
      });
    } finally {
      setSending(false);
    }
  };

  const changeView = (nextView: "original" | "masked") => {
    setView(nextView);
    if (nextView === "masked") {
      void sendForMasking();
    }
  };

  const addManualMask = async (
    mask: Omit<ManualMask, "id" | "label" | "maskCode">,
  ) => {
    const definition = MASK_DEFINITIONS.find((item) => item.id === mask.type);

    if (!definition) {
      return;
    }

    const sequence =
      manualMasks.filter((item) => item.type === mask.type).length + 1;
    const maskCode = getMaskCode(mask.type, sequence);
    setSending(true);
    setSendStatus({
      message: "선택한 마스킹 매핑을 저장하는 중입니다…",
      error: false,
    });
    try {
      await putMapping(mask.text, mask.type);
    } catch (error) {
      setSendStatus({
        message:
          error instanceof Error ? error.message : "매핑 저장에 실패했습니다.",
        error: true,
      });
      setSending(false);
      return;
    }

    setManualMasks((previous) => {
      const remaining = previous.filter(
        (item) => item.end <= mask.start || item.start >= mask.end,
      );

      return [
        ...remaining,
        {
          ...mask,
          id: `manual-${Date.now()}`,
          label: `${definition.label}_${sequence}`,
          maskCode,
        },
      ];
    });
    setSendStatus({
      message: "선택한 마스킹 매핑을 저장했습니다. (HTTP 204)",
      error: false,
    });
    setSending(false);
  };

  const content = (masked: boolean) => {
    const automatic = MASK_DEFINITIONS.flatMap((definition, definitionIndex) =>
      enabled[definitionIndex]
        ? definition.values.flatMap((valueToMask) => {
            const segments: MaskSegment[] = [];
            let start = value.indexOf(valueToMask);

            while (start >= 0) {
              segments.push({
                start,
                end: start + valueToMask.length,
                definition,
              });
              start = value.indexOf(valueToMask, start + valueToMask.length);
            }

            return segments;
          })
        : [],
    );
    const manual = manualMasks.flatMap((mask) => {
      const definition = MASK_DEFINITIONS.find((item) => item.id === mask.type);

      return definition
        ? [{ start: mask.start, end: mask.end, definition, manual: mask }]
        : [];
    });
    const segments = [
      ...automatic.filter(
        (segment) =>
          !manual.some(
            (item) => segment.start < item.end && segment.end > item.start,
          ),
      ),
      ...manual,
    ]
      .sort((first, second) => first.start - second.start)
      .reduce<MaskSegment[]>((result, segment) => {
        const previous = result.at(-1);

        if (!previous || segment.start >= previous.end) {
          result.push(segment);
        }

        return result;
      }, []);
    const result = [];
    let cursor = 0;

    segments.forEach((segment, index) => {
      if (segment.start > cursor) {
        result.push(value.slice(cursor, segment.start));
      }

      const text = value.slice(segment.start, segment.end);
      const manualId = segment.manual?.id;
      result.push(
        masked ? (
          <MaskChip
            key={`mask-${index}`}
            icon={segment.definition.chip}
            onClick={manualId ? () => removeManualMask(manualId) : undefined}
          >
            {segment.manual?.label ?? `${segment.definition.label}_1`}
          </MaskChip>
        ) : (
          <PrivacyHighlight key={`mask-${index}`}>{text}</PrivacyHighlight>
        ),
      );
      cursor = segment.end;
    });

    if (cursor < value.length) {
      result.push(value.slice(cursor));
    }

    return result;
  };

  return (
    <Page>
      <Content>
        <Workspace>
          <Heading>준비되면 시작하세요.</Heading>
          {screen === "button" && (
            <WorkspaceContent>
              <Prompt>
                <Icon name="plus" />
                <PromptInput
                  aria-label="ChatGPT 메시지 입력"
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                    setCaret({
                      start:
                        event.target.selectionStart ??
                        event.target.value.length,
                      end:
                        event.target.selectionEnd ?? event.target.value.length,
                    });
                  }}
                  onSelect={(event) =>
                    setCaret({
                      start:
                        event.currentTarget.selectionStart ??
                        event.currentTarget.value.length,
                      end:
                        event.currentTarget.selectionEnd ??
                        event.currentTarget.value.length,
                    })
                  }
                  placeholder="ChatGPT에게 물어보세요"
                />
                <EveilSlot>
                  <EveilButton
                    onClick={() => {
                      setScreen("chat");
                      setShowHint(false);
                    }}
                    showHint={showHint}
                    onDismissHint={() => setShowHint(false)}
                  />
                </EveilSlot>
                <PromptMode>
                  Instant <Icon name="inputCaret" />
                </PromptMode>
                <Icon name="microphone" />
                <SendButton type="button" aria-label="전송">
                  <Icon name="arrowUp" />
                </SendButton>
              </Prompt>
              <Suggestions>
                {suggestions.map((item) => (
                  <SuggestionButton key={item.label}>
                    <Icon name={item.icon} />
                    {item.label}
                  </SuggestionButton>
                ))}
              </Suggestions>
            </WorkspaceContent>
          )}
          {screen === "chat" && (
            <InputPanel
              value={value}
              onChange={setValue}
              view={view}
              onViewChange={changeView}
              originalContent={content(false)}
              maskedContent={content(true)}
              count={count}
              caret={caret}
              onCaretChange={setCaret}
              onClose={() => setScreen("button")}
              onExpand={() => setScreen("comparison")}
              onSettings={() => setScreen("comparison")}
              onSend={sendForMasking}
              sending={sending}
            />
          )}
          {screen === "chat" && sendStatus && (
            <SendStatus
              role={sendStatus.error ? "alert" : "status"}
              error={sendStatus.error}
            >
              {sendStatus.message}
            </SendStatus>
          )}
        </Workspace>
      </Content>
      {screen === "comparison" && (
        <ComparisonPanel
          original={content(false)}
          masked={content(true)}
          count={count}
          maskOptions={MASK_DEFINITIONS}
          manualMasks={manualMasks}
          requestStatus={sendStatus}
          onClose={() => setScreen("chat")}
          onCollapse={() => setScreen("chat")}
          onAddManualMask={addManualMask}
          onRemoveManualMask={removeManualMask}
          onSend={sendForMasking}
          types={MASK_DEFINITIONS.map((definition, index) => (
            <MaskTypeItem
              key={definition.id}
              label={definition.label}
              icon={definition.icon}
              count={definition.values.reduce(
                (total, valueToMask) =>
                  total + countOccurrences(value, valueToMask),
                0,
              )}
              checked={enabled[index]}
              onChange={(checked) =>
                setEnabled((previous) =>
                  previous.map((item, itemIndex) =>
                    itemIndex === index ? checked : item,
                  ),
                )
              }
            />
          ))}
        />
      )}
    </Page>
  );
}
