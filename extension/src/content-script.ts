function getConversationId(): string | null {
  return location.pathname.match(/\/c\/([0-9a-f-]{36})(?:\/|$)/i)?.[1] ?? null;
}

let lastUrl = '';

function notifyConversationChange(): void {
  if (location.href === lastUrl) {
    return;
  }

  lastUrl = location.href;
  void chrome.runtime.sendMessage({
    type: 'eveil:conversation-change',
    conversationId: getConversationId(),
  }).catch(() => undefined);
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'eveil:get-conversation') {
    sendResponse({ conversationId: getConversationId() });
  }
});

window.addEventListener('popstate', notifyConversationChange);
window.addEventListener('hashchange', notifyConversationChange);
new MutationObserver(notifyConversationChange).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
notifyConversationChange();
