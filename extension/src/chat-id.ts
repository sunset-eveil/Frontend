const CHAT_IDS_KEY = 'eveilChatIds';
const PENDING_IDS_KEY = 'eveilPendingChatIds';

export async function getOrCreateChatId(
  conversationId: string | null,
  tabId?: number,
): Promise<string> {
  if (!globalThis.chrome?.storage) {
    const key = `eveil-chat-id:${conversationId ?? 'preview'}`;
    const existing = sessionStorage.getItem(key);

    if (existing) {
      return existing;
    }

    const chatId = crypto.randomUUID();
    sessionStorage.setItem(key, chatId);
    return chatId;
  }

  const stored = await chrome.storage.local.get(CHAT_IDS_KEY);
  const chatIds = (stored[CHAT_IDS_KEY] ?? {}) as Record<string, string>;
  const pending = await chrome.storage.session.get(PENDING_IDS_KEY);
  const pendingIds = (pending[PENDING_IDS_KEY] ?? {}) as Record<string, string>;
  const tabKey = String(tabId ?? 'popup');

  if (conversationId && chatIds[conversationId]) {
    if (pendingIds[tabKey]) {
      delete pendingIds[tabKey];
      await chrome.storage.session.set({ [PENDING_IDS_KEY]: pendingIds });
    }
    return chatIds[conversationId];
  }

  const chatId = pendingIds[tabKey] ?? crypto.randomUUID();

  if (conversationId) {
    chatIds[conversationId] = chatId;
    delete pendingIds[tabKey];
    await chrome.storage.local.set({ [CHAT_IDS_KEY]: chatIds });
  } else {
    pendingIds[tabKey] = chatId;
  }

  await chrome.storage.session.set({ [PENDING_IDS_KEY]: pendingIds });
  return chatId;
}
