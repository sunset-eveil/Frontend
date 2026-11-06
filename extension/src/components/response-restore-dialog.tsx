import { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import type { ChatMapping } from "../api/chat-mappings";
import { getMaskingTypeCode } from "../api/maskings";
import { MASK_DEFINITIONS } from "../masking";
import { COLORS } from "../styles/colors";
import { Button, IconButton } from "./button";

const Dialog = styled.dialog`
  width: min(760px, calc(100% - 24px));
  max-height: calc(100% - 24px);
  padding: 20px;
  border: 1px solid ${COLORS.border};
  border-radius: 16px;
  background: ${COLORS.surface};
  color: ${COLORS.text};

  &::backdrop { background: ${COLORS.overlay}; }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  h2 { margin: 0; font-size: 18px; }
`;

const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 16px 0;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: grid;
  gap: 8px;
  color: ${COLORS.secondary};
  font-size: 14px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  height: clamp(120px, 30vh, 260px);
  padding: 10px;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  resize: vertical;
  background: ${COLORS.surfaceRaised};
  color: ${COLORS.text};
`;

const Footer = styled.footer`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: ${COLORS.muted};
  font-size: 13px;
`;

const tokenTypes = MASK_DEFINITIONS.map(({ id }) => getMaskingTypeCode(id)).join("|");

function restoreText(text: string, mappings: ChatMapping[]) {
  const values = new Map(mappings
    .filter(({ maskCode, value }) => maskCode && value)
    .map(({ maskCode, value }) => [maskCode, value]));
  const codes = [...values.keys()].sort((a, b) => b.length - a.length)
    .map((code) => code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const alternatives = [...codes, `(?:${tokenTypes})[_-]?[1-9][0-9]*`].join("|");
  const pattern = new RegExp(`(?<![A-Za-z0-9_])(?:${alternatives})(?![A-Za-z0-9_])`, "gi");
  const matched = new Set<string>();
  const missing = new Set<string>();
  const restored = text.replace(pattern, (code) => {
    const canonical = code.toUpperCase().replace(/[_-](?=[1-9][0-9]*$)/, "");
    const value = values.get(code) ?? values.get(canonical);
    if (value !== undefined) {
      matched.add(code);
      return value;
    }
    missing.add(code);
    return code;
  });
  return { text: restored, matched: [...matched], missing: [...missing] };
}

export function ResponseRestoreDialog({ mappings, fromCache, onClose }: {
  mappings: ChatMapping[];
  fromCache: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const inputField = useRef<HTMLTextAreaElement>(null);
  const outputField = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const result = useMemo(() => restoreText(input, mappings), [input, mappings]);
  const output = result.text;

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    inputField.current?.focus();
    return () => element?.close();
  }, []);

  useEffect(() => {
    if (!result.matched.length && !result.missing.length) return;
    console.info("[Eveil] 복원 토큰", { matched: result.matched, missing: result.missing });
  }, [result]);

  const copyOutput = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("원문을 복사했어요.");
    } catch {
      outputField.current?.focus();
      outputField.current?.select();
      setCopyStatus("자동 복사에 실패했어요. 선택된 원문을 직접 복사해 주세요.");
    }
  };

  return (
    <Dialog
      ref={dialog}
      aria-labelledby="response-restore-title"
      onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
    >
      <Header>
        <h2 id="response-restore-title">답변 복원</h2>
        <IconButton icon="close" label="답변 복원 닫기" onClick={onClose} />
      </Header>
      {fromCache && <p role="status">최신 복원 정보를 가져오지 못해 이전에 조회한 정보를 사용하고 있어요.</p>}
      <Fields>
        <Field>
          마스킹된 답변
          <Textarea
            ref={inputField}
            placeholder="복사한 답변을 붙여넣으세요"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setCopyStatus("");
            }}
          />
        </Field>
        <Field>
          복원된 원문
          <Textarea ref={outputField} value={output} readOnly />
        </Field>
      </Fields>
      <Footer>
        <span role="status">
          {copyStatus || (result.missing.length ? `이 대화에 복원 정보가 없는 토큰: ${result.missing.join(", ")}`
            : !mappings.length ? "이 대화에 저장된 복원 정보가 없어요."
            : input && output === input ? "이 대화의 복원 정보와 일치하는 토큰이 없어요." : "")}
        </span>
        <Button type="button" disabled={!output.trim()} onClick={() => void copyOutput()}>
          원문 복사
        </Button>
      </Footer>
    </Dialog>
  );
}
