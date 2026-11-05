(() => {
  type ChatMapping = {
    maskCode: string;
    value: string;
  };

  let extensionBaseUrl: string;
  try {
    if (!chrome.runtime.id) return;
    extensionBaseUrl = chrome.runtime.getURL('');
  } catch {
    return;
  }
  // Dispose an earlier injection before attaching a new one to the same page.
  window.dispatchEvent(new Event('eveil:dispose-content'));

  const CONTROL_ID = 'eveil-composer-control';
  const OVERLAY_ID = 'eveil-composer-overlay';
  const HINT_KEY = 'eveil-composer-hint-dismissed';
  const EXTENSION_ORIGIN = extensionBaseUrl.replace(/\/$/, '');

  let lastUrl = '';
  let frame: HTMLIFrameElement | undefined;
  let composer: HTMLElement | null = null;
  let isOpen = false;
  let isExpanded = false;
  let draft = '';
  let frameReady = false;
  let pendingCloseRequestId: string | undefined;
  let pendingCloseTimeout: number | undefined;
  let hintDismissed = true;
  let frameHeight = 440;
  let pendingLayout: number | undefined;
  let isDisposed = false;
  let pageObserver: MutationObserver | undefined;
  let responseObserver: MutationObserver | undefined;
  let responseOverlayHost: HTMLElement | undefined;
  let responseOverlayLayer: HTMLDivElement | undefined;
  let responseMappings: ChatMapping[] = [];
  let responseTokenTargets: Array<{
    left: number;
    top: number;
    right: number;
    bottom: number;
    toggle: () => void;
  }> = [];
  let responsePointerStart: {
    x: number;
    y: number;
    target: typeof responseTokenTargets[number];
  } | undefined;
  let suppressResponseClick = false;
  const revealedResponseTokens = new WeakMap<Text, Set<number>>();
  let pendingResponseOverlay: number | undefined;
  const events = new AbortController();
  const eventOptions = { signal: events.signal };

  const control = document.createElement('span');
  control.id = CONTROL_ID;
  control.style.cssText = 'all:initial!important;position:absolute!important;z-index:10!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:74px!important;height:36px!important;min-height:36px!important;overflow:visible!important;line-height:0!important;box-sizing:border-box!important;';
  const controlShadow = control.attachShadow({ mode: 'open' });
  controlShadow.innerHTML = `
    <style>
      :host { color-scheme: dark; }
      button { all: initial; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center;
        width: 74px; height: 34px; border: 1px solid #9184d9; border-radius: 999px;
        background: #191927; color: #e6e1ff; cursor: pointer; font: 800 12px/1 system-ui, sans-serif; letter-spacing: .4px; }
      button:hover, button[aria-expanded="true"] { background: #343048; }
      button:focus-visible { outline: 2px solid #c0b5ff; outline-offset: 3px; }
    </style>
    <button type="button" aria-label="Eveil 입력창 열기" aria-expanded="false" aria-controls="${OVERLAY_ID}">EVEIL</button>
  `;
  const trigger = controlShadow.querySelector('button')!;

  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;';
  const overlayShadow = overlay.attachShadow({ mode: 'open' });
  overlayShadow.innerHTML = `
    <style>
      :host { color-scheme: dark; }
      [hidden] { display: none !important; }
      .backdrop { position: absolute; inset: 0; background: rgba(8, 9, 18, .78);
        backdrop-filter: blur(2px); pointer-events: auto; }
      .composer-cover { position: absolute; background: #212121; pointer-events: auto; }
      iframe { position: absolute; z-index: 1; display: block; border: 0; border-radius: 20px; background: transparent;
        pointer-events: auto; color-scheme: dark; }
      .hint { position: absolute; box-sizing: border-box; width: 262px; padding: 13px 14px;
        border: 1px solid #9184d9; border-radius: 12px; background: #242432; color: #eceaf5;
        box-shadow: 0 6px 18px #0006; font: 14px/1.6 system-ui, sans-serif; pointer-events: auto; }
      .hint p { margin: 7px 0 10px; color: #c1bfce; }
      .hint div { display: flex; justify-content: flex-end; }
      .hint button { border: 1px solid #9184d9; border-radius: 8px; padding: 5px 12px;
        background: transparent; color: inherit; cursor: pointer; font: inherit; }
      .hint::after { content: ''; position: absolute; right: 24px; bottom: -7px; width: 12px; height: 12px;
        border-right: 1px solid #9184d9; border-bottom: 1px solid #9184d9; background: #242432; transform: rotate(45deg); }
    </style>
    <div class="backdrop" hidden aria-hidden="true"></div>
    <div class="composer-cover" hidden aria-hidden="true"></div>
    <section class="hint" role="region" aria-label="Eveil 사용 안내" hidden>
      <strong>Eveil이 여기 있어요</strong>
      <p>눌러서 보낼 내용을 입력하면 개인정보를 가려서 보내 드려요.</p>
      <div><button type="button">알겠어요</button></div>
    </section>
  `;
  const hint = overlayShadow.querySelector<HTMLElement>('.hint')!;
  const backdrop = overlayShadow.querySelector<HTMLElement>('.backdrop')!;
  const composerCover = overlayShadow.querySelector<HTMLElement>('.composer-cover')!;

  function dispose(): void {
    if (isDisposed) return;
    isDisposed = true;
    pageObserver?.disconnect();
    responseObserver?.disconnect();
    events.abort();
    if (pendingLayout !== undefined) cancelAnimationFrame(pendingLayout);
    if (pendingResponseOverlay !== undefined) cancelAnimationFrame(pendingResponseOverlay);
    control.remove();
    overlay.remove();
    responseOverlayHost?.remove();
    try {
      chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
    } catch {
      // A reloaded extension no longer owns this content script's runtime.
    }
  }

  function hasContext(): boolean {
    if (isDisposed) return false;
    try {
      if (chrome.runtime.id) return true;
    } catch {
      // Access can also throw after the extension is reloaded.
    }
    dispose();
    return false;
  }

  function handleExtensionError(error: unknown): void {
    if (!hasContext() || (error instanceof Error && /extension context invalidated/i.test(error.message))) {
      dispose();
    }
  }

  function runExtensionTask(task: () => unknown): void {
    if (!hasContext()) return;
    try {
      // Chrome APIs can throw synchronously before returning their Promise.
      void Promise.resolve(task()).catch(handleExtensionError);
    } catch (error) {
      handleExtensionError(error);
    }
  }

  function getConversationId(): string | null {
    return location.pathname.match(/\/c\/([0-9a-f-]{36})(?:\/|$)/i)?.[1] ?? null;
  }

  function ensureResponseOverlay(): void {
    if (responseOverlayHost?.isConnected && responseOverlayLayer) return;

    responseOverlayHost = document.createElement('div');
    responseOverlayHost.dataset.eveilResponseOverlay = 'true';
    responseOverlayHost.style.cssText = 'all:initial!important;position:fixed!important;inset:0!important;z-index:2147482998!important;pointer-events:none!important;';
    const shadow = responseOverlayHost.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = `
      :host { all: initial; }
      .layer { position: fixed; inset: 0; pointer-events: none; }
      .token { position: fixed; box-sizing: border-box; padding: 0; margin: 0; border: 0;
        white-space: nowrap; overflow: visible; text-align: left; pointer-events: none; user-select: none; }
    `;
    responseOverlayLayer = document.createElement('div');
    responseOverlayLayer.className = 'layer';
    shadow.append(style, responseOverlayLayer);
    document.documentElement.append(responseOverlayHost);
  }

  function getOpaqueBackground(element: HTMLElement): string {
    let current: HTMLElement | null = element;

    while (current) {
      const background = getComputedStyle(current).backgroundColor;
      const alpha = background.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([^)]+)\)/)?.[1];
      if (background && background !== 'transparent' && (!alpha || Number(alpha) >= 0.98)) {
        return background;
      }
      current = current.parentElement;
    }

    const root = getComputedStyle(document.documentElement);
    const rootBackground = root.backgroundColor;
    const rootAlpha = rootBackground.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([^)]+)\)/)?.[1];
    if (rootBackground && rootBackground !== 'transparent' &&
      (!rootAlpha || Number(rootAlpha) >= 0.98)) return rootBackground;
    return root.colorScheme.includes('dark') ? '#212121' : '#fff';
  }

  function scheduleResponseOverlay(allowRetry = true): void {
    if (pendingResponseOverlay !== undefined) return;
    pendingResponseOverlay = requestAnimationFrame(() => renderResponseOverlays(allowRetry));
  }

  function renderResponseOverlays(allowRetry = true): void {
    pendingResponseOverlay = undefined;
    if (!responseMappings.length) {
      responseTokenTargets = [];
      responseOverlayLayer?.replaceChildren();
      return;
    }

    ensureResponseOverlay();
    const layer = responseOverlayLayer;
    if (!layer) return;
    layer.replaceChildren();
    responseTokenTargets = [];
    const mappings = responseMappings
      .filter((mapping) => mapping.maskCode && mapping.value)
      .sort((first, second) => second.maskCode.length - first.maskCode.length);
    const messages = document.querySelectorAll<HTMLElement>(
      '[data-message-author-role="assistant"]',
    );
    let needsRetry = messages.length === 0;

    messages.forEach((message) => {
      const walker = document.createTreeWalker(message, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          return node.textContent && parent && !parent.closest(
            'script, style, textarea, [contenteditable="true"], [data-eveil-response-overlay]',
          ) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });

      let node = walker.nextNode();
      while (node) {
        const text = node.textContent ?? '';
        const parent = node.parentElement;
        if (!parent) {
          node = walker.nextNode();
          continue;
        }

        let cursor = 0;
        while (cursor < text.length) {
          let match: { mapping: ChatMapping; start: number } | undefined;
          for (const mapping of mappings) {
            const start = text.indexOf(mapping.maskCode, cursor);
            if (start >= 0 && (!match || start < match.start)) match = { mapping, start };
          }
          if (!match) break;

          const range = document.createRange();
          range.setStart(node, match.start);
          range.setEnd(node, match.start + match.mapping.maskCode.length);
          const rects = Array.from(range.getClientRects()).filter(
            (rect) => rect.width > 0 && rect.height > 0,
          );
          if (!rects.length) needsRetry = true;
          const textStyle = getComputedStyle(parent);
          const background = getOpaqueBackground(parent);

          const firstRect = rects[0];
          if (firstRect) {
            const textNode = node as Text;
            const tokenStart = match.start;
            const mapping = match.mapping;
            const revealed = revealedResponseTokens.get(textNode)?.has(tokenStart) ?? false;
            const token = document.createElement('span');
            token.className = 'token';
            token.textContent = revealed ? mapping.value : mapping.maskCode;
            token.style.cssText = `left:${firstRect.left}px;top:${firstRect.top}px;min-width:${firstRect.width}px;min-height:${firstRect.height}px;color:${textStyle.color};font:${textStyle.font};line-height:${textStyle.lineHeight};background:${background};`;
            const toggle = (): void => {
              const offsets = revealedResponseTokens.get(textNode) ?? new Set<number>();
              if (offsets.has(tokenStart)) offsets.delete(tokenStart);
              else offsets.add(tokenStart);
              revealedResponseTokens.set(textNode, offsets);
              scheduleResponseOverlay();
            };
            layer.append(token);
            const tokenBounds = token.getBoundingClientRect();
            responseTokenTargets.push({
              left: tokenBounds.left,
              top: tokenBounds.top,
              right: tokenBounds.right,
              bottom: tokenBounds.bottom,
              toggle,
            });
          }
          cursor = match.start + match.mapping.maskCode.length;
        }
        node = walker.nextNode();
      }
    });

    if (needsRetry && allowRetry) {
      pendingResponseOverlay = requestAnimationFrame(() => renderResponseOverlays(false));
    }
  }

  function handleResponseCopy(event: ClipboardEvent): void {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !event.clipboardData || !responseMappings.length) return;

    const selectedAssistantMessage = Array.from(document.querySelectorAll<HTMLElement>(
      '[data-message-author-role="assistant"]',
    )).some((message) => Array.from({ length: selection.rangeCount }, (_, index) =>
      selection.getRangeAt(index),
    ).some((range) => {
      try {
        return range.intersectsNode(message);
      } catch {
        return false;
      }
    }));
    if (!selectedAssistantMessage) return;

    const copiedText = selection.toString();
    const mappings = responseMappings.filter((mapping) => copiedText.includes(mapping.maskCode));
    if (!mappings.length) return;
    const mappingByCode = new Map(mappings.map((mapping) => [mapping.maskCode, mapping.value]));
    const maskCodes = mappings
      .map((mapping) => mapping.maskCode)
      .sort((first, second) => second.length - first.length)
      .map((maskCode) => maskCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const originalText = copiedText.replace(
      new RegExp(maskCodes.join('|'), 'g'),
      (maskCode) => mappingByCode.get(maskCode) ?? maskCode,
    );
    event.clipboardData.setData('text/plain', originalText);
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function getResponseTokenTarget(
    x: number,
    y: number,
  ): typeof responseTokenTargets[number] | undefined {
    return responseTokenTargets.find((target) => (
      x >= target.left && x <= target.right && y >= target.top && y <= target.bottom
    ));
  }

  function handleResponsePointerDown(event: PointerEvent): void {
    const target = getResponseTokenTarget(event.clientX, event.clientY);
    responsePointerStart = target ? {
      x: event.clientX,
      y: event.clientY,
      target,
    } : undefined;
  }

  function handleResponsePointerUp(event: PointerEvent): void {
    const start = responsePointerStart;
    responsePointerStart = undefined;
    if (!start || getResponseTokenTarget(event.clientX, event.clientY) !== start.target ||
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) return;

    start.target.toggle();
    suppressResponseClick = true;
    event.preventDefault();
    window.setTimeout(() => { suppressResponseClick = false; }, 0);
  }

  function handleResponseClick(event: MouseEvent): void {
    if (!suppressResponseClick) return;
    suppressResponseClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function getComposerEditor(): HTMLElement | undefined {
    return Array.from(document.querySelectorAll<HTMLElement>(
      '#prompt-textarea, textarea[data-testid="prompt-textarea"], [contenteditable="true"][role="textbox"], [contenteditable="true"][data-placeholder], textarea[placeholder*="메시지"], textarea[placeholder*="Message"]',
    )).find((candidate) => {
      const bounds = candidate.getBoundingClientRect();
      return bounds.width > 0 && bounds.height > 0;
    });
  }

  function getComposerContainer(editor: HTMLElement): HTMLElement | null {
    return editor.closest<HTMLElement>('form') ?? editor.closest<HTMLElement>(
      '[data-type="unified-composer"], #composer-background, [data-testid="composer"]',
    ) ?? editor.parentElement?.parentElement ?? null;
  }

  function nextFrame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  function readComposerText(editor: HTMLElement): string {
    const text = editor instanceof HTMLTextAreaElement ? editor.value : editor.innerText;
    return text.replace(/\r\n/g, '\n').replace(/\n$/, '');
  }

  async function getComposerEditorWithRetry(): Promise<HTMLElement> {
    let editor = getComposerEditor();
    if (!editor?.isConnected) {
      await nextFrame();
      editor = getComposerEditor();
    }
    if (!editor?.isConnected) throw new Error('ChatGPT 입력창을 찾을 수 없습니다.');
    return editor;
  }

  async function sendComposerValue(): Promise<void> {
    const targetFrame = frame;
    if (!targetFrame?.contentWindow) return;
    try {
      const editor = await getComposerEditorWithRetry();
      if (!isOpen || frame !== targetFrame) return;
      targetFrame.contentWindow?.postMessage({
        type: 'eveil:composer-value',
        text: readComposerText(editor),
      }, EXTENSION_ORIGIN);
    } catch (error) {
      targetFrame.contentWindow?.postMessage({
        type: 'eveil:composer-error',
        message: error instanceof Error ? error.message : 'ChatGPT 입력값을 읽지 못했습니다.',
      }, EXTENSION_ORIGIN);
    }
  }

  function setOpen(nextOpen: boolean, shouldTransferDraft = true): void {
    if (!hasContext() || !control.isConnected) return;
    if (!nextOpen && isOpen && shouldTransferDraft) {
      void insertComposerText(draft).then(() => {
        draft = '';
        frame?.contentWindow?.postMessage({ type: 'eveil:draft-transferred' }, EXTENSION_ORIGIN);
        applyOpenState(false);
      }).catch((error: unknown) => {
        frame?.contentWindow?.postMessage({
          type: 'eveil:close-error',
          message: error instanceof Error ? error.message : '원문을 옮기지 못했습니다.',
        }, EXTENSION_ORIGIN);
        applyOpenState(false);
      });
      return;
    }
    applyOpenState(nextOpen);
  }

  function applyOpenState(nextOpen: boolean): void {
    isOpen = nextOpen;
    if (!isOpen) frame?.contentWindow?.postMessage({ type: 'eveil:panel-hidden' }, EXTENSION_ORIGIN);
    trigger.setAttribute('aria-expanded', String(isOpen));
    control.style.setProperty('display', isOpen ? 'none' : 'inline-flex', 'important');
    backdrop.hidden = !isOpen || !isExpanded;
    if (isOpen && !frame) {
      frame = document.createElement('iframe');
      frame.title = 'Eveil 개인정보 가림';
      frame.src = `${extensionBaseUrl}index.html?embedded=1&parentOrigin=${encodeURIComponent(location.origin)}`;
      overlayShadow.append(frame);
    }
    if (isOpen && frameReady) sendComposerValue();
    if (frame) frame.hidden = !isOpen;
    updatePosition();
  }

  function closeWithCurrentDraft(): void {
    if (!isOpen) return;
    if (!frameReady || !frame?.contentWindow) {
      frame?.contentWindow?.postMessage({
        type: 'eveil:close-error',
        message: '입력값을 준비하는 중입니다. 잠시 후 다시 시도해 주세요.',
      }, EXTENSION_ORIGIN);
      return;
    }

    pendingCloseRequestId = crypto.randomUUID();
    frame.contentWindow.postMessage({
      type: 'eveil:get-draft',
      requestId: pendingCloseRequestId,
    }, EXTENSION_ORIGIN);
    if (pendingCloseTimeout !== undefined) window.clearTimeout(pendingCloseTimeout);
    pendingCloseTimeout = window.setTimeout(() => {
      pendingCloseRequestId = undefined;
      pendingCloseTimeout = undefined;
      frame?.contentWindow?.postMessage({
        type: 'eveil:close-error',
        message: '최신 입력값을 확인하지 못해 확장을 닫지 않았습니다. 다시 시도해 주세요.',
      }, EXTENSION_ORIGIN);
    }, 500);
  }

  function dismissHint(): void {
    if (!hasContext()) return;
    hintDismissed = true;
    hint.hidden = true;
    runExtensionTask(() => chrome.storage.local.set({ [HINT_KEY]: true }));
  }

  function updatePosition(allowRetry = true): void {
    if (!hasContext()) return;
    if (!control.isConnected) {
      hint.hidden = true;
      backdrop.hidden = true;
      composerCover.hidden = true;
      if (frame) frame.hidden = true;
      return;
    }
    if (!composer?.isConnected) {
      const editor = getComposerEditor();
      composer = editor ? getComposerContainer(editor) : null;
      if (!composer?.isConnected) {
        hint.hidden = true;
        backdrop.hidden = true;
        composerCover.hidden = true;
        if (frame) frame.hidden = true;
        if (allowRetry) requestAnimationFrame(() => updatePosition(false));
        return;
      }
    }
    const bounds = composer.getBoundingClientRect();
    if (!bounds.width || !bounds.height) {
      hint.hidden = true;
      backdrop.hidden = true;
      composerCover.hidden = true;
      if (frame) frame.hidden = true;
      if (allowRetry) requestAnimationFrame(() => updatePosition(false));
      return;
    }
    const visible = (element: HTMLElement): boolean => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const model = Array.from(composer.querySelectorAll<HTMLElement>(
      '[data-testid="model-switcher-dropdown-button"], button, [role="button"]',
    )).find((element) => visible(element) && (
      element.dataset.testid === 'model-switcher-dropdown-button' ||
      /^(Instant|Auto|Thinking|Pro)\b/i.test(element.textContent?.trim() ?? '')
    ));
    const action = model ?? Array.from(composer.querySelectorAll<HTMLElement>(
      '#composer-submit-button, [data-testid="send-button"], [data-testid="composer-speech-button"]',
    )).find(visible);
    const target = action?.getBoundingClientRect();
    const x = target ? target.left - 82 : bounds.right - 264;
    const y = bounds.top + (bounds.height - 36) / 2;
    // all:initial!important isolates the host from page CSS; coordinates must
    // have the same priority or that reset wins and the button becomes static.
    control.style.setProperty('position', 'fixed', 'important');
    control.style.setProperty('z-index', '2147482999', 'important');
    control.style.setProperty('left', `${Math.max(bounds.left + 8, x)}px`, 'important');
    control.style.setProperty('top', `${Math.max(8, y)}px`, 'important');
    const anchor = trigger.getBoundingClientRect();
    const width = isExpanded
      ? window.innerWidth
      : Math.min(760, Math.max(360, bounds.width), window.innerWidth - 24);
    // The fixed comparison dialog is outside #root's layout. Its viewport must
    // not shrink to the compact root height reported by ResizeObserver.
    const height = isExpanded ? window.innerHeight
      : Math.min(Math.max(frameHeight, bounds.height + 32), Math.max(120, window.innerHeight - 24));
    const left = isExpanded
      ? 0
      : Math.max(12, Math.min(bounds.left + (bounds.width - width) / 2, window.innerWidth - width - 12));
    const top = isExpanded
      ? 0
      : Math.max(12, Math.min(bounds.bottom + 16 - height, window.innerHeight - height - 12));
    composerCover.hidden = !isOpen || isExpanded;
    if (!composerCover.hidden) {
      composerCover.style.cssText = `left:${bounds.left}px;top:${bounds.top}px;width:${bounds.width}px;height:${bounds.height}px;`;
    }
    if (frame) {
      frame.style.cssText = `left:${left}px;top:${top}px;width:${width}px;height:${height}px;`;
      frame.hidden = !isOpen;
    }
    hint.hidden = hintDismissed || isOpen;
    if (!hint.hidden) {
      hint.style.left = `${Math.max(12, Math.min(anchor.right - 262, window.innerWidth - 274))}px`;
      hint.style.top = `${Math.max(12, anchor.top - hint.getBoundingClientRect().height - 12)}px`;
    }
  }

  function mountControl(allowRetry = true): void {
    if (!hasContext()) return;
    document.querySelectorAll(`#${CONTROL_ID}`).forEach((element) => {
      if (element !== control) element.remove();
    });
    const editor = getComposerEditor();
    composer = editor ? getComposerContainer(editor) : null;
    if (!editor || !composer) {
      if (allowRetry) requestAnimationFrame(() => mountControl(false));
      return;
    }
    // Keep the button outside ChatGPT's clipped action wrappers. Those wrappers
    // are often shorter than the pill and cut off its top and bottom borders.
    if (control.parentElement !== document.documentElement) document.documentElement.append(control);
    if (!overlay.isConnected) document.documentElement.append(overlay);
    updatePosition();
  }

  async function insertComposerText(text: string): Promise<HTMLElement> {
    const editor = await getComposerEditorWithRetry();

    const currentText = readComposerText(editor);
    if (currentText === text) return editor;

    editor.focus();
    if (editor instanceof HTMLTextAreaElement) {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
      setter?.call(editor, text);
      editor.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    } else if (editor.isContentEditable) {
      if (currentText) {
        const range = document.createRange();
        range.selectNodeContents(editor);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      document.execCommand(text ? 'insertText' : 'delete', false, text);
    } else {
      throw new Error('ChatGPT 입력창에 내용을 입력할 수 없습니다.');
    }

    const expectedText = text.replace(/\r\n/g, '\n').replace(/\n$/, '');
    if (editor.isConnected && readComposerText(editor) === expectedText) return editor;

    await nextFrame();
    const currentEditor = getComposerEditor();
    if (currentEditor?.isConnected && readComposerText(currentEditor) === expectedText) {
      return currentEditor;
    }
    throw new Error('ChatGPT 입력창에 내용을 넣지 못했습니다.');
  }

  async function submitMaskedText(text: string): Promise<void> {
    if (!text.trim()) throw new Error('전송할 내용이 없습니다.');
    const editor = await insertComposerText(text);
    const form = editor.closest('form');
    if (!form) throw new Error('ChatGPT 입력창의 전송 양식을 찾을 수 없습니다.');
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    if (!editor.isConnected || !form.isConnected) {
      throw new Error('ChatGPT 입력창이 변경됐습니다.');
    }
    const initialUrl = location.href;
    form.requestSubmit();
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 50));
      if (!editor.isConnected && location.href !== initialUrl) {
        return;
      }
      const remaining = readComposerText(editor);
      if (!remaining.trim()) {
        return;
      }
    }
    throw new Error('ChatGPT 입력창에 내용이 남아 있습니다. 전송 여부를 확인해 주세요.');
  }

  function notifyConversationChange(): void {
    if (location.href === lastUrl) return;
    responseMappings = [];
    responseTokenTargets = [];
    responseOverlayLayer?.replaceChildren();
    if (lastUrl) {
      setOpen(false, false);
      draft = '';
    }
    lastUrl = location.href;
    runExtensionTask(() => chrome.runtime.sendMessage({
      type: 'eveil:conversation-change',
      conversationId: getConversationId(),
    }));
  }

  function scheduleLayout(): void {
    if (!hasContext() || pendingLayout !== undefined) return;
    pendingLayout = requestAnimationFrame(() => {
      pendingLayout = undefined;
      if (!hasContext()) return;
      notifyConversationChange();
      mountControl();
    });
  }

  trigger.addEventListener('click', () => {
    dismissHint();
    setOpen(!isOpen, false);
  }, eventOptions);
  backdrop.addEventListener('click', closeWithCurrentDraft, eventOptions);
  hint.querySelector('button')!.addEventListener('click', dismissHint, eventOptions);
  document.addEventListener('pointerdown', (event) => {
    const path = event.composedPath();
    if (isOpen && !path.includes(control) && !path.includes(overlay) &&
      !getResponseTokenTarget(event.clientX, event.clientY)) closeWithCurrentDraft();
  }, eventOptions);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) closeWithCurrentDraft();
  }, eventOptions);
  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (!frame || event.source !== frame.contentWindow || event.origin !== EXTENSION_ORIGIN) return;
    const data = event.data;
    if (!data || typeof data !== 'object' || !('type' in data)) return;
    if (data.type === 'eveil:close-request') {
      closeWithCurrentDraft();
      return;
    }
    if (data.type === 'eveil:ready') {
      frameReady = true;
      if (isOpen) sendComposerValue();
    }
    if (data.type === 'eveil:draft-response' &&
      'requestId' in data && data.requestId === pendingCloseRequestId &&
      'text' in data && typeof data.text === 'string') {
      if (pendingCloseTimeout !== undefined) window.clearTimeout(pendingCloseTimeout);
      pendingCloseTimeout = undefined;
      pendingCloseRequestId = undefined;
      draft = data.text;
      setOpen(false);
    }
    if (data.type === 'eveil:draft' && 'text' in data && typeof data.text === 'string') {
      draft = data.text;
    }
    if (data.type === 'eveil:send-masked' && 'requestId' in data &&
      typeof data.requestId === 'string' && 'text' in data && typeof data.text === 'string') {
      const targetFrame = frame.contentWindow;
      void submitMaskedText(data.text).then(() => {
        targetFrame?.postMessage({ type: 'eveil:send-result', requestId: data.requestId, success: true }, EXTENSION_ORIGIN);
      }).catch((error: unknown) => {
        targetFrame?.postMessage({
          type: 'eveil:send-result',
          requestId: data.requestId,
          success: false,
          message: error instanceof Error ? error.message : 'ChatGPT로 전송하지 못했습니다.',
        }, EXTENSION_ORIGIN);
      });
    }
    if (data.type === 'eveil:close') {
      const isSent = 'isSent' in data && data.isSent === true;
      if (isSent) {
        draft = '';
      } else if ('text' in data && typeof data.text === 'string') {
        draft = data.text;
      }
      setOpen(false, !isSent);
      if (!isOpen) trigger.focus({ preventScroll: true });
    }
    if (data.type === 'eveil:mode' && 'mode' in data && (data.mode === 'chat' || data.mode === 'comparison')) {
      isExpanded = data.mode === 'comparison';
      backdrop.hidden = !isOpen || !isExpanded;
      updatePosition();
    }
    if (data.type === 'eveil:resize' && 'height' in data && typeof data.height === 'number' && Number.isFinite(data.height)) {
      frameHeight = Math.max(180, Math.min(1000, data.height));
      updatePosition();
    }
  }, eventOptions);
  function handleRuntimeMessage(
    message: { type?: string; chatId?: string; mappings?: unknown },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ): void {
    if (!hasContext()) return;
    if (message?.type === 'eveil:set-response-mappings' &&
      typeof message.chatId === 'string' && Array.isArray(message.mappings) &&
      message.mappings.every((mapping) => (
        mapping !== null && typeof mapping === 'object' &&
        'maskCode' in mapping && typeof mapping.maskCode === 'string' &&
        'value' in mapping && typeof mapping.value === 'string'
      ))) {
      responseMappings = message.mappings as ChatMapping[];
      responseTokenTargets = [];
      scheduleResponseOverlay();
      sendResponse({ updated: true });
    }
    if (message?.type === 'eveil:get-conversation') {
      sendResponse({ conversationId: getConversationId() });
    }
    if (message?.type === 'eveil:toggle-composer') {
      mountControl();
      dismissHint();
      setOpen(!isOpen, false);
      sendResponse({ mounted: control.isConnected });
    }
  }
  runExtensionTask(() => chrome.runtime.onMessage.addListener(handleRuntimeMessage));
  runExtensionTask(async () => {
    const stored = await chrome.storage.local.get(HINT_KEY);
    if (!hasContext()) return;
    hintDismissed = stored[HINT_KEY] === true;
    updatePosition();
  });
  window.addEventListener('popstate', scheduleLayout, eventOptions);
  window.addEventListener('hashchange', scheduleLayout, eventOptions);
  window.addEventListener('resize', () => updatePosition(), eventOptions);
  window.addEventListener('scroll', () => updatePosition(), { ...eventOptions, capture: true });
  window.addEventListener('eveil:dispose-content', dispose, eventOptions);
  if (hasContext()) {
    pageObserver = new MutationObserver(scheduleLayout);
    pageObserver.observe(document.documentElement, { childList: true, subtree: true });
    responseObserver = new MutationObserver(() => scheduleResponseOverlay());
    responseObserver.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    document.addEventListener('copy', handleResponseCopy, { ...eventOptions, capture: true });
    document.addEventListener('pointerdown', handleResponsePointerDown, { ...eventOptions, capture: true });
    document.addEventListener('pointerup', handleResponsePointerUp, { ...eventOptions, capture: true });
    document.addEventListener('click', handleResponseClick, { ...eventOptions, capture: true });
    window.addEventListener('scroll', () => scheduleResponseOverlay(), { ...eventOptions, capture: true });
    window.addEventListener('resize', () => scheduleResponseOverlay(), eventOptions);
    scheduleLayout();
  }
})();
