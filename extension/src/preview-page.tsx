import { IS_EMBEDDED, closeEmbeddedPanel, notifyEmbeddedMode, requestComposerValue, sendMaskedMessage, syncEmbeddedDraft } from './embedded-panel';
import { getMaskingTypeCode } from './api/maskings';
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useMutation } from '@tanstack/react-query';
import styled from "@emotion/styled";
import { ComparisonPanel } from "./components/comparison-panel";
import { EveilButton } from "./components/eveil-button";
import { InputPanel } from "./components/input-panel";
import { MaskTypeItem } from "./components/mask-type-item";
import { MaskTypeModal } from "./components/mask-type-modal";
import { MaskChip, PrivacyHighlight } from "./components/privacy-text";
import {
  MASK_DEFINITIONS,
  type ManualMask,
  type MaskDefinition,
  type MaskTypeId,
} from "./masking";
import { COLORS } from "./styles/colors";
import { getOrCreateChatId } from './chat-id';
import { getChatMappings, type ChatMapping } from './api/chat-mappings';
import {
  createMasking,
  deleteMapping,
  putMapping,
} from "./api/maskings";

type Screen = "button" | "chat" | "comparison";
type TextCaret = {
  start: number;
  end: number;
};
type MaskSegment = {
  start: number;
  end: number;
  definition: MaskDefinition;
  manual?: ManualMask;
  mapping?: ChatMapping;
  isRevealed?: boolean;
};
type MaskingVariables = {
  chatId: string;
  text: string;
  enabledTypes: MaskTypeId[];
};
type MappingVariables = {
  chatId: string;
  value: string;
  type: MaskTypeId;
};
type DeleteMappingVariables = {
  chatId: string;
  maskCode: string;
};

const Page = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 760px;
  max-width: 100vw;
  gap: 12px;
  min-height: 220px;
  padding: 16px;
`;

const SendStatus = styled.p<{ isError?: boolean }>`
  width: min(760px, 100%);
  margin: 12px 0 0;
  color: ${({ isError }) => (isError ? "#EF625D" : COLORS.muted)};
  font-size: 14px;
  line-height: 1.5;
`;

const EveilSlot = styled.div`
  width: 74px;
  height: 36px;
  align-self: flex-end;
`;

function countOccurrences(text: string, query: string): number {
  if (!query) return 0;
  return text.split(query).length - 1;
}

export function PreviewPage(): ReactNode {
  const [chatId, setChatId] = useState<string>();
  const activeChatId = useRef<string | undefined>(undefined);
  const [maskedValue, setMaskedValue] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>(IS_EMBEDDED ? "chat" : "button");
  const [filterAnchor, setFilterAnchor] = useState<DOMRect | null>(null);
  const [isHintVisible, setShowHint] = useState(
    () => localStorage.getItem("eveil-hint-shown") !== "true",
  );
  const [value, setValue] = useState("");
  const latestValue = useRef(value);
  latestValue.current = value;
  useEffect(() => syncEmbeddedDraft(value), [value]);
  useEffect(() => {
    if (!IS_EMBEDDED) return;
    const parentOrigin = new URLSearchParams(location.search).get('parentOrigin');
    const handleParentMessage = (event: MessageEvent<unknown>): void => {
      if (event.source !== window.parent || event.origin !== parentOrigin) return;
      const data = event.data;
      if (!data || typeof data !== 'object' || !('type' in data)) return;
      if (data.type === 'eveil:get-draft' && 'requestId' in data &&
        typeof data.requestId === 'string') {
        window.parent.postMessage({
          type: 'eveil:draft-response',
          requestId: data.requestId,
          text: latestValue.current,
        }, parentOrigin);
      }
      if (data.type === 'eveil:composer-value' && 'text' in data &&
        typeof data.text === 'string') {
        latestValue.current = data.text;
        setValue(data.text);
        setCaret({ start: data.text.length, end: data.text.length });
        setManualMasks([]);
        setMaskedValue(null);
        setMappingResult(undefined);
        setView('original');
        setSendStatus(null);
      }
      if (data.type === 'eveil:composer-error' && 'message' in data &&
        typeof data.message === 'string') {
        setSendStatus({ message: data.message, isError: true });
      }
      if (data.type === 'eveil:panel-hidden') setFilterAnchor(null);
      if (data.type === 'eveil:draft-transferred') {
        latestValue.current = '';
        setValue('');
        setManualMasks([]);
        setMaskedValue(null);
        setMappingResult(undefined);
      }
      if (data.type === 'eveil:close-error' && 'message' in data &&
        typeof data.message === 'string') {
        setSendStatus({ message: data.message, isError: true });
      }
    };
    window.addEventListener('message', handleParentMessage);
    return () => window.removeEventListener('message', handleParentMessage);
  }, []);
  useEffect(() => {
    requestComposerValue();
  }, []);
  const [caret, setCaret] = useState<TextCaret>({ start: 0, end: 0 });
  const [view, setView] = useState<"original" | "masked">("original");
  const [enabled, setEnabled] = useState(MASK_DEFINITIONS.map(() => true));
  const latestEnabled = useRef(enabled);
  latestEnabled.current = enabled;
  const [manualMasks, setManualMasks] = useState<ManualMask[]>([]);
  const latestManualMasks = useRef(manualMasks);
  latestManualMasks.current = manualMasks;
  const [sendStatus, setSendStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);
  const [isPosting, setPosting] = useState(false);
  const sendInProgress = useRef(false);

  useEffect(() => {
    if (IS_EMBEDDED && screen !== 'button') notifyEmbeddedMode(screen);
  }, [screen]);

  const [mappingResult, setMappingResult] = useState<{ chatId: string; mappings: ChatMapping[] }>();
  const [isFetchingMappings, setFetchingMappings] = useState(false);
  const loadMappings = async (requestedChatId: string): Promise<ChatMapping[]> => {
    setFetchingMappings(true);
    try {
      const mappings = await getChatMappings(requestedChatId);
      if (activeChatId.current === requestedChatId) setMappingResult({ chatId: requestedChatId, mappings });
      return mappings;
    } finally {
      setFetchingMappings(false);
    }
  };
  const createMaskingMutation = useMutation({
    mutationFn: ({ chatId, text, enabledTypes }: MaskingVariables) =>
      createMasking(chatId, text, enabledTypes),
    onSuccess: () => setMappingResult(undefined),
  });
  const putMappingMutation = useMutation({
    mutationFn: ({ chatId, value, type }: MappingVariables) =>
      putMapping(chatId, value, type),
    onSuccess: () => setMappingResult(undefined),
  });
  const deleteMappingMutation = useMutation({
    mutationFn: ({ chatId, maskCode }: DeleteMappingVariables) =>
      deleteMapping(chatId, maskCode),
    onSuccess: () => setMappingResult(undefined),
  });
  const isSending = createMaskingMutation.isPending ||
    putMappingMutation.isPending || deleteMappingMutation.isPending ||
    isFetchingMappings || isPosting;
  const activeMappings = maskedValue === value && mappingResult?.chatId === chatId
    ? mappingResult?.mappings
    : undefined;

  useEffect(() => {
    let isActive = true;
    let activeTabId: number | undefined;
    let latestUpdate = 0;

    const updateChat = async (conversationId: string | null): Promise<void> => {
      const update = ++latestUpdate;
      const nextChatId = await getOrCreateChatId(conversationId, activeTabId);

      if (isActive && update === latestUpdate && activeChatId.current !== nextChatId) {
        if (activeChatId.current) {
          setValue('');
          setMaskedValue(null);
          setMappingResult(undefined);
          setManualMasks([]);
          setEnabled(MASK_DEFINITIONS.map(() => true));
          setView('original');
        }

        activeChatId.current = nextChatId;
        setChatId(nextChatId);
      }
    };

    const handleMessage = (
      message: { type?: string; conversationId?: string | null },
      sender: chrome.runtime.MessageSender,
    ): void => {
      if (message.type === 'eveil:conversation-change' && sender.tab?.id === activeTabId) {
        void updateChat(message.conversationId ?? null);
      }
    };

    if (!globalThis.chrome?.tabs) {
      void updateChat(null);
      return () => { isActive = false; };
    }

    chrome.runtime.onMessage.addListener(handleMessage);
    void chrome.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
      activeTabId = tab?.id;
      const initialUpdate = ++latestUpdate;
      let conversationId: string | null = null;

      if (activeTabId !== undefined) {
        try {
          const result = await chrome.tabs.sendMessage(activeTabId, {
            type: 'eveil:get-conversation',
          });
          conversationId = result?.conversationId ?? null;
        } catch {
          conversationId = null;
        }
      }

      if (initialUpdate === latestUpdate) {
        await updateChat(conversationId);
      }
    }).catch(() => updateChat(null));

    return () => {
      isActive = false;
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  useEffect(() => {
    if (isHintVisible) {
      localStorage.setItem("eveil-hint-shown", "true");
    }
  }, [isHintVisible]);

  const countMatches = (definition: MaskDefinition): number => {
    if (activeMappings) {
      return activeMappings
        .filter((mapping) => mapping.type === getMaskingTypeCode(definition.id))
        .reduce((total, mapping) => total +
          countOccurrences(value, mapping.value) +
          countOccurrences(value, mapping.maskCode), 0);
    }

    return globalThis.chrome?.storage
      ? 0
      : definition.values.reduce(
          (total, item) => total + countOccurrences(value, item),
          0,
        );
  };
  const autoCount = MASK_DEFINITIONS.reduce(
    (total, definition, index) => total + (enabled[index] ? countMatches(definition) : 0),
    0,
  );
  const count = autoCount + manualMasks.length;

  const removeManualMask = async (id: string): Promise<void> => {
    const mask = manualMasks.find((item) => item.id === id);
    if (!mask) return;

    setSendStatus({
      message: "마스킹 해제를 요청하는 중입니다…",
      isError: false,
    });
    try {
      if (!chatId) throw new Error('대화 ID를 확인할 수 없습니다.');
      await deleteMappingMutation.mutateAsync({ chatId, maskCode: mask.maskCode });
      setManualMasks((previous) => previous.filter((item) => item.id !== id));
      setSendStatus({
        message: "마스킹을 해제했습니다. (HTTP 204)",
        isError: false,
      });
    } catch (error) {
      setSendStatus({
        message:
          error instanceof Error
            ? error.message
            : "마스킹 해제에 실패했습니다.",
        isError: true,
      });
    }
  };

  const maskForPreview = async (text = value): Promise<ChatMapping[] | undefined> => {
    if (!text.trim()) {
      setSendStatus({ message: "마스킹할 내용을 입력해 주세요.", isError: true });
      return undefined;
    }
    setSendStatus({ message: "마스킹 API에 요청 중입니다…", isError: false });
    try {
      if (!chatId) throw new Error('대화 ID를 확인할 수 없습니다.');
      await createMaskingMutation.mutateAsync({
        chatId,
        text,
        enabledTypes: MASK_DEFINITIONS.filter((_, index) => enabled[index]).map(
          (definition) => definition.id,
        ),
      });
      setMaskedValue(text);
      try {
        const mappings = await loadMappings(chatId);
        if (activeChatId.current !== chatId) return undefined;
        setSendStatus({
          message: "마스킹 매핑이 업데이트됐습니다. (HTTP 204)",
          isError: false,
        });
        return mappings;
      } catch {
        setSendStatus({
          message: '마스킹은 완료됐지만 매핑을 불러오지 못했습니다.',
          isError: true,
        });
        return undefined;
      }
    } catch (error) {
      setSendStatus({
        message:
          error instanceof Error
            ? error.message
            : "마스킹 요청에 실패했습니다.",
        isError: true,
      });
      return undefined;
    }
  };

  const changeView = (nextView: "original" | "masked"): void => {
    setView(nextView);
    if (nextView === "masked") {
      void maskForPreview();
    }
  };

  const openComparison = (): void => {
    setFilterAnchor(null);
    setScreen('comparison');
    if (value.trim() && !isSending) void maskForPreview();
  };

  const changeMaskType = async (index: number, isChecked: boolean): Promise<void> => {
    if (!isChecked) {
      if (!chatId) {
        setSendStatus({ message: '대화 ID를 확인할 수 없습니다.', isError: true });
        return;
      }

      try {
        const mappings = await loadMappings(chatId);
        if (activeChatId.current !== chatId) return;

        if (mappings.some((mapping) => value.includes(mapping.maskCode))) {
          setMaskedValue(value);
        }
      } catch (error) {
        if (activeChatId.current !== chatId) return;
        setSendStatus({
          message: error instanceof Error ? error.message : '매핑 조회에 실패했습니다.',
          isError: true,
        });
        return;
      }
    }

    setEnabled((previous) => previous.map((item, itemIndex) => (
      itemIndex === index ? isChecked : item
    )));
  };

  const addManualMask = async (
    mask: Omit<ManualMask, "id" | "label" | "maskCode">,
  ): Promise<void> => {
    const definition = MASK_DEFINITIONS.find((item) => item.id === mask.type);

    if (!definition) {
      return;
    }

    setSendStatus({
      message: "선택한 마스킹 매핑을 저장하는 중입니다…",
      isError: false,
    });
    try {
      if (!chatId) throw new Error('대화 ID를 확인할 수 없습니다.');
      const previousMappings = await loadMappings(chatId);
      await putMappingMutation.mutateAsync({
        chatId,
        value: mask.text,
        type: mask.type,
      });
      const mappings = await loadMappings(chatId);
      if (activeChatId.current !== chatId) return;

      const matching = mappings.filter(
        (item) => item.value === mask.text.trim() && item.type === getMaskingTypeCode(mask.type),
      );
      const newMappings = matching.filter(
        (item) => !previousMappings.some((previous) => previous.maskCode === item.maskCode),
      );
      const mapping = newMappings.length === 1
        ? newMappings[0]
        : newMappings.length === 0 && matching.length === 1
          ? matching[0]
          : undefined;

      if (!mapping) throw new Error('저장된 매핑 코드를 확인할 수 없습니다. 다시 시도해 주세요.');

      const sequence = mapping.maskCode.match(/\d+$/)?.[0];
      setManualMasks((previous) => {
        const remaining = previous.filter(
          (item) => item.end <= mask.start || item.start >= mask.end,
        );

        return [
          ...remaining,
          {
            ...mask,
            id: `manual-${Date.now()}`,
            label: sequence ? `${definition.label}_${sequence}` : definition.label,
            maskCode: mapping.maskCode,
          },
        ];
      });
      setSendStatus({
        message: '선택한 마스킹 매핑을 저장했습니다.',
        isError: false,
      });
    } catch (error) {
      setSendStatus({
        message:
          error instanceof Error ? error.message : "매핑 저장에 실패했습니다.",
        isError: true,
      });
    }
  };

  const getMaskSegments = (
    isMasked: boolean,
    mappings: ChatMapping[] | undefined = activeMappings,
    text = value,
  ): MaskSegment[] => {
    const automatic = MASK_DEFINITIONS.flatMap((definition, definitionIndex) =>
      enabled[definitionIndex]
        ? (mappings
            ? mappings.filter((mapping) => mapping.type === getMaskingTypeCode(definition.id) && mapping.value.length > 0)
            : (globalThis.chrome?.storage ? [] : definition.values).map(
                (valueToMask) => ({ value: valueToMask, maskCode: '' }),
              ))
          .flatMap((mapping) => {
            const segments: MaskSegment[] = [];
            let start = text.indexOf(mapping.value);

            while (start >= 0) {
              segments.push({
                start,
                end: start + mapping.value.length,
                definition,
                mapping: mappings ? mapping as ChatMapping : undefined,
              });
              start = text.indexOf(mapping.value, start + mapping.value.length);
            }

            return segments;
          })
        : [],
    );
    const codeSegments: MaskSegment[] = isMasked
      ? (mappings ?? []).flatMap((mapping) => {
          const definition = MASK_DEFINITIONS.find(
            (item) => getMaskingTypeCode(item.id) === mapping.type,
          );

          if (!definition || !mapping.maskCode) return [];

          const segments: MaskSegment[] = [];
          let start = text.indexOf(mapping.maskCode);

          while (start >= 0) {
            const before = text[start - 1] ?? '';
            const after = text[start + mapping.maskCode.length] ?? '';

            if (!/[A-Za-z0-9]/.test(before) && !/[A-Za-z0-9]/.test(after)) {
              segments.push({
                start,
                end: start + mapping.maskCode.length,
                definition,
                mapping,
                isRevealed: !enabled[MASK_DEFINITIONS.indexOf(definition)],
              });
            }
            start = text.indexOf(mapping.maskCode, start + mapping.maskCode.length);
          }

          return segments;
        })
      : [];
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
      ...codeSegments,
      ...manual,
    ]
      .sort((first, second) => first.start - second.start || second.end - first.end)
      .reduce<MaskSegment[]>((result, segment) => {
        const previous = result.at(-1);

        if (!previous || segment.start >= previous.end) {
          result.push(segment);
        }

        return result;
      }, []);
    return segments;
  };

  const content = (isMasked: boolean): ReactNode[] => {
    const segments = getMaskSegments(isMasked);
    const result = [];
    let cursor = 0;

    segments.forEach((segment, index) => {
      if (segment.start > cursor) {
        result.push(value.slice(cursor, segment.start));
      }

      const text = value.slice(segment.start, segment.end);
      const manualId = segment.manual?.id;
      result.push(
        segment.isRevealed ? (segment.mapping?.value ?? text) : isMasked ? (
          <MaskChip
            key={`mask-${index}`}
            icon={segment.definition.chip}
            onClick={manualId ? () => removeManualMask(manualId) : undefined}
          >
            {segment.manual?.label ?? segment.mapping?.maskCode ?? `${segment.definition.label}_1`}
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

  const toMaskedText = (mappings: ChatMapping[], text = value): string => {
    const segments = getMaskSegments(true, mappings, text);
    let maskedText = '';
    let cursor = 0;

    for (const segment of segments) {
      maskedText += text.slice(cursor, segment.start);
      const original = text.slice(segment.start, segment.end);
      const replacement = segment.isRevealed
        ? segment.mapping?.value ?? original
        : segment.manual?.maskCode ?? segment.mapping?.maskCode;
      if (!replacement) throw new Error('가릴 내용의 매핑 코드를 확인할 수 없습니다.');
      maskedText += replacement;
      cursor = segment.end;
    }

    return maskedText + text.slice(cursor);
  };

  const handleInputChange = (nextValue: string): void => {
    if (nextValue === value) return;
    latestValue.current = nextValue;
    setValue(nextValue);
    syncEmbeddedDraft(nextValue);
    setManualMasks([]);
    setMaskedValue(null);
    setMappingResult(undefined);
  };

  const sendToChatGpt = async (): Promise<void> => {
    if (sendInProgress.current || isSending) return;
    sendInProgress.current = true;
    setPosting(true);
    const sourceText = latestValue.current;
    const sourceChatId = chatId;
    const sourceEnabled = enabled;
    const sourceManualMasks = manualMasks;

    try {
      const mappings = await maskForPreview(sourceText);
      if (!mappings) return;
      if (activeChatId.current !== sourceChatId || latestValue.current !== sourceText ||
        latestEnabled.current !== sourceEnabled || latestManualMasks.current !== sourceManualMasks) {
        throw new Error('대화나 가림 설정이 바뀌어 전송을 중단했습니다.');
      }

      await sendMaskedMessage(toMaskedText(mappings, sourceText));
      setValue('');
      setCaret({ start: 0, end: 0 });
      setMaskedValue(null);
      setMappingResult(undefined);
      setManualMasks([]);
      setView('original');
      setFilterAnchor(null);
      setSendStatus(null);
      closeEmbeddedPanel(true);
    } catch (error) {
      setSendStatus({
        message: error instanceof Error ? error.message : 'ChatGPT로 전송하지 못했습니다.',
        isError: true,
      });
    } finally {
      sendInProgress.current = false;
      setPosting(false);
    }
  };

  return (
    <Page>
      {screen === "button" && (
        <EveilSlot>
          <EveilButton
            onClick={() => {
              setScreen("chat");
              setShowHint(false);
            }}
            isHintVisible={isHintVisible}
            onDismissHint={() => setShowHint(false)}
          />
        </EveilSlot>
      )}
          {screen === "chat" && (
            <InputPanel
              value={value}
              onChange={handleInputChange}
              view={view}
              onViewChange={changeView}
              originalContent={content(false)}
              maskedContent={content(true)}
              count={count}
              caret={caret}
              onCaretChange={setCaret}
              onClose={() => {
                setFilterAnchor(null);
                if (IS_EMBEDDED) closeEmbeddedPanel();
                else setScreen('button');
              }}
              onExpand={openComparison}
              onSettings={setFilterAnchor}
              onSend={sendToChatGpt}
              isSending={isSending}
            />
          )}
          {screen === "chat" && sendStatus?.isError && (
            <SendStatus
              role={sendStatus.isError ? "alert" : "status"}
              isError={sendStatus.isError}
            >
              {sendStatus.message}
            </SendStatus>
          )}
      {screen === "chat" && filterAnchor && (
        <MaskTypeModal
          anchor={filterAnchor}
          options={MASK_DEFINITIONS}
          enabled={enabled}
          counts={MASK_DEFINITIONS.map(countMatches)}
          onChange={(index, isChecked) => { void changeMaskType(index, isChecked); }}
          onClose={() => setFilterAnchor(null)}
        />
      )}
      {screen === "comparison" && (
        <ComparisonPanel
          original={content(false)}
          masked={content(true)}
          count={count}
          maskOptions={MASK_DEFINITIONS}
          manualMasks={manualMasks}
          isSending={isSending}
          requestStatus={sendStatus?.isError ? sendStatus : null}
          onClose={() => setScreen("chat")}
          onCollapse={() => setScreen("chat")}
          onAddManualMask={addManualMask}
          onRemoveManualMask={removeManualMask}
          onSend={sendToChatGpt}
          types={MASK_DEFINITIONS.map((definition, index) => (
            <MaskTypeItem
              key={definition.id}
              label={definition.label}
              icon={definition.icon}
              count={countMatches(definition)}
              isChecked={enabled[index]}
              onChange={(isChecked) => { void changeMaskType(index, isChecked); }}
            />
          ))}
        />
      )}
    </Page>
  );
}
