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

  useEffect(() => {
    if (showHint) {
      localStorage.setItem("eveil-hint-shown", "true");
    }
  }, [showHint]);

  const autoCount = MASK_DEFINITIONS.reduce(
    (total, definition, index) =>
      enabled[index]
        ? total + definition.values.reduce(
            (valueTotal, valueToMask) =>
              valueTotal + countOccurrences(value, valueToMask),
            0,
          )
        : total,
    0,
  );
  const count = autoCount + manualMasks.length;

  const updateCaret = (nextCaret: TextCaret) => {
    setCaret((currentCaret) => (
      currentCaret.start === nextCaret.start && currentCaret.end === nextCaret.end
        ? currentCaret
        : nextCaret
    ));
  };

  const removeManualMask = (id: string) => {
    setManualMasks((previous) => previous.filter((mask) => mask.id !== id));
  };

  const addManualMask = (mask: Omit<ManualMask, "id" | "label">) => {
    const definition = MASK_DEFINITIONS.find((item) => item.id === mask.type);

    if (!definition) {
      return;
    }

    setManualMasks((previous) => {
      const remaining = previous.filter(
        (item) => item.end <= mask.start || item.start >= mask.end,
      );
      const sequence =
        remaining.filter((item) => item.type === mask.type).length + 1;

      return [
        ...remaining,
        {
          ...mask,
          id: `manual-${Date.now()}`,
          label: `${definition.label}_${sequence}`,
        },
      ];
    });
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
                    updateCaret({
                      start: event.target.selectionStart ?? event.target.value.length,
                      end: event.target.selectionEnd ?? event.target.value.length,
                    });
                  }}
                  onSelect={(event) => updateCaret({
                    start: event.currentTarget.selectionStart ?? event.currentTarget.value.length,
                    end: event.currentTarget.selectionEnd ?? event.currentTarget.value.length,
                  })}
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
              onViewChange={setView}
              originalContent={content(false)}
              maskedContent={content(true)}
              count={count}
              caret={caret}
              onCaretChange={updateCaret}
              onClose={() => setScreen("button")}
              onExpand={() => setScreen("comparison")}
              onSettings={() => setScreen("comparison")}
              onSend={() => undefined}
            />
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
          onClose={() => setScreen("chat")}
          onCollapse={() => setScreen("chat")}
          onAddManualMask={addManualMask}
          onRemoveManualMask={removeManualMask}
          onSend={() => undefined}
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
