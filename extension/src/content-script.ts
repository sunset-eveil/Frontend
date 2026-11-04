(() => {
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
  let hintDismissed = true;
  let frameHeight = 440;
  let pendingLayout: number | undefined;
  let isDisposed = false;
  let pageObserver: MutationObserver | undefined;
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
      iframe { position: absolute; display: block; border: 0; border-radius: 20px; background: transparent;
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
    <section class="hint" role="region" aria-label="Eveil 사용 안내" hidden>
      <strong>Eveil이 여기 있어요</strong>
      <p>눌러서 보낼 내용을 입력하면 개인정보를 가려서 보내 드려요.</p>
      <div><button type="button">알겠어요</button></div>
    </section>
  `;
  const hint = overlayShadow.querySelector<HTMLElement>('.hint')!;

  function dispose(): void {
    if (isDisposed) return;
    isDisposed = true;
    pageObserver?.disconnect();
    events.abort();
    if (pendingLayout !== undefined) cancelAnimationFrame(pendingLayout);
    control.remove();
    overlay.remove();
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

  function setOpen(nextOpen: boolean): void {
    if (!hasContext() || !control.isConnected) return;
    isOpen = nextOpen;
    trigger.setAttribute('aria-expanded', String(isOpen));
    if (isOpen && !frame) {
      frame = document.createElement('iframe');
      frame.title = 'Eveil 개인정보 가림';
      frame.src = `${extensionBaseUrl}index.html?embedded=1&parentOrigin=${encodeURIComponent(location.origin)}`;
      overlayShadow.append(frame);
    }
    if (frame) frame.hidden = !isOpen;
    updatePosition();
  }

  function dismissHint(): void {
    if (!hasContext()) return;
    hintDismissed = true;
    hint.hidden = true;
    runExtensionTask(() => chrome.storage.local.set({ [HINT_KEY]: true }));
  }

  function updatePosition(): void {
    if (!hasContext()) return;
    if (!control.isConnected || !composer?.isConnected) {
      hint.hidden = true;
      if (frame) frame.hidden = true;
      return;
    }
    const bounds = composer.getBoundingClientRect();
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
    const x = target ? target.left - 110 : bounds.right - 264;
    const y = target ? target.top + (target.height - 36) / 2 : bounds.bottom - 46;
    // all:initial!important isolates the host from page CSS; coordinates must
    // have the same priority or that reset wins and the button becomes static.
    control.style.setProperty('position', 'fixed', 'important');
    control.style.setProperty('z-index', '2147482999', 'important');
    control.style.setProperty('left', `${Math.max(bounds.left + 8, x)}px`, 'important');
    control.style.setProperty('top', `${Math.max(8, y)}px`, 'important');
    const anchor = trigger.getBoundingClientRect();
    const width = Math.min(760, Math.max(360, bounds.width), window.innerWidth - 24);
    const height = Math.min(frameHeight, Math.max(120, window.innerHeight - 24));
    const left = Math.max(12, Math.min(bounds.right - width, window.innerWidth - width - 12));
    const above = anchor.top - height - 12;
    const top = above >= 12 ? above : Math.max(12, Math.min(anchor.bottom + 12, window.innerHeight - height - 12));
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

  function mountControl(): void {
    if (!hasContext()) return;
    document.querySelectorAll(`#${CONTROL_ID}`).forEach((element) => {
      if (element !== control) element.remove();
    });
    const editor = document.querySelector<HTMLElement>(
      '#prompt-textarea, textarea[data-testid="prompt-textarea"], [contenteditable="true"][role="textbox"], [contenteditable="true"][data-placeholder], textarea[placeholder*="메시지"], textarea[placeholder*="Message"]',
    );
    composer = editor?.closest<HTMLElement>('form') ?? editor?.closest<HTMLElement>(
      '[data-type="unified-composer"], #composer-background, [data-testid="composer"]',
    ) ?? editor?.parentElement?.parentElement ?? null;
    if (!editor || !composer) {
      updatePosition();
      return;
    }
    // Keep the button outside ChatGPT's clipped action wrappers. Those wrappers
    // are often shorter than the pill and cut off its top and bottom borders.
    if (control.parentElement !== document.documentElement) document.documentElement.append(control);
    if (!overlay.isConnected) document.documentElement.append(overlay);
    updatePosition();
  }

  function notifyConversationChange(): void {
    if (location.href === lastUrl) return;
    if (lastUrl) setOpen(false);
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
    setOpen(!isOpen);
  }, eventOptions);
  hint.querySelector('button')!.addEventListener('click', dismissHint, eventOptions);
  document.addEventListener('pointerdown', (event) => {
    const path = event.composedPath();
    if (isOpen && !path.includes(control) && !path.includes(overlay)) setOpen(false);
  }, eventOptions);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen) { setOpen(false); trigger.focus(); }
  }, eventOptions);
  window.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (!frame || event.source !== frame.contentWindow || event.origin !== EXTENSION_ORIGIN) return;
    const data = event.data;
    if (!data || typeof data !== 'object' || !('type' in data)) return;
    if (data.type === 'eveil:close') { setOpen(false); trigger.focus({ preventScroll: true }); }
    if (data.type === 'eveil:resize' && 'height' in data && typeof data.height === 'number' && Number.isFinite(data.height)) {
      frameHeight = Math.max(180, Math.min(1000, data.height));
      updatePosition();
    }
  }, eventOptions);
  function handleRuntimeMessage(
    message: { type?: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ): void {
    if (!hasContext()) return;
    if (message?.type === 'eveil:get-conversation') {
      sendResponse({ conversationId: getConversationId() });
    }
    if (message?.type === 'eveil:toggle-composer') {
      mountControl();
      dismissHint();
      setOpen(!isOpen);
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
  window.addEventListener('resize', updatePosition, eventOptions);
  window.addEventListener('scroll', updatePosition, { ...eventOptions, capture: true });
  window.addEventListener('eveil:dispose-content', dispose, eventOptions);
  if (hasContext()) {
    pageObserver = new MutationObserver(scheduleLayout);
    pageObserver.observe(document.documentElement, { childList: true, subtree: true });
    scheduleLayout();
  }
})();
