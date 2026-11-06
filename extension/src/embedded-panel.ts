const parentOrigin = new URLSearchParams(location.search).get('parentOrigin');
const CHAT_ORIGINS = ['https://chatgpt.com', 'https://chat.openai.com'];

export const IS_EMBEDDED = window.parent !== window &&
  new URLSearchParams(location.search).get('embedded') === '1' &&
  parentOrigin !== null && CHAT_ORIGINS.includes(parentOrigin);

export function notifyEmbeddedMode(mode: 'chat' | 'comparison'): void {
  if (IS_EMBEDDED && parentOrigin) {
    window.parent.postMessage({ type: 'eveil:mode', mode }, parentOrigin);
  }
}

export function closeEmbeddedPanel(isSent = false): void {
  if (IS_EMBEDDED && parentOrigin) {
    window.parent.postMessage({
      type: isSent ? 'eveil:close' : 'eveil:close-request',
      isSent,
    }, parentOrigin);
  }
}

export function syncEmbeddedDraft(text: string): void {
  if (IS_EMBEDDED && parentOrigin) {
    window.parent.postMessage({ type: 'eveil:draft', text }, parentOrigin);
  }
}

export function requestComposerValue(): void {
  if (IS_EMBEDDED && parentOrigin) {
    window.parent.postMessage({ type: 'eveil:ready' }, parentOrigin);
  }
}

export function sendMaskedMessage(text: string, conversationId: string | null): Promise<void> {
  if (!IS_EMBEDDED || !parentOrigin) {
    return Promise.reject(new Error('ChatGPT 페이지에서 Eveil을 열어 주세요.'));
  }

  return new Promise((resolve, reject) => {
    const requestId = crypto.randomUUID();
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', handleResult);
      reject(new Error('ChatGPT 전송 응답을 확인하지 못했습니다.'));
    }, 10_000);
    const handleResult = (event: MessageEvent<unknown>): void => {
      if (event.source !== window.parent || event.origin !== parentOrigin) return;
      const data = event.data;
      if (!data || typeof data !== 'object' || !('type' in data) ||
        data.type !== 'eveil:send-result' || !('requestId' in data) ||
        data.requestId !== requestId) return;

      window.clearTimeout(timeout);
      window.removeEventListener('message', handleResult);
      if ('success' in data && data.success === true) {
        resolve();
      } else {
        reject(new Error('message' in data && typeof data.message === 'string'
          ? data.message : 'ChatGPT로 전송하지 못했습니다.'));
      }
    };

    window.addEventListener('message', handleResult);
    window.parent.postMessage({ type: 'eveil:send-masked', requestId, text, conversationId }, parentOrigin);
  });
}

export function observeEmbeddedPanel(): () => void {
  if (!IS_EMBEDDED || !parentOrigin) return () => undefined;
  document.documentElement.dataset.eveilEmbedded = 'true';
  const root = document.getElementById('root')!;
  let previousHeight = 0;
  const observer = new ResizeObserver(() => {
    const height = Math.ceil(root.getBoundingClientRect().height);
    if (height > 0 && height !== previousHeight) {
      previousHeight = height;
      window.parent.postMessage({ type: 'eveil:resize', height }, parentOrigin);
    }
  });
  const handleKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') closeEmbeddedPanel();
  };
  observer.observe(root);
  document.addEventListener('keydown', handleKey);
  return () => { observer.disconnect(); document.removeEventListener('keydown', handleKey); };
}
