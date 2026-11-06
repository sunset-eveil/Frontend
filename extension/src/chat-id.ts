const CHAT_IDS_KEY = 'eveilChatIds';
const PENDING_IDS_KEY = 'eveilPendingChatIds';

export async function findChatId(conversationId: string): Promise<string | undefined> {
  const stored = await chrome.storage.local.get(CHAT_IDS_KEY);
  return (stored[CHAT_IDS_KEY] as Record<string, string> | undefined)?.[conversationId];
}

export async function bindFirstMessageChatId(
  conversationId: string,
  tabId: number,
  sentChatId: string,
): Promise<boolean> {
  const stored = await chrome.storage.local.get(CHAT_IDS_KEY);
  const chatIds = (stored[CHAT_IDS_KEY] ?? {}) as Record<string, string>;
  if (chatIds[conversationId]) return chatIds[conversationId] === sentChatId;

  const pending = await chrome.storage.session.get(PENDING_IDS_KEY);
  const pendingIds = (pending[PENDING_IDS_KEY] ?? {}) as Record<string, string>;
  if (pendingIds[String(tabId)] !== sentChatId) return false;

  await chrome.storage.local.set({ [CHAT_IDS_KEY]: { ...chatIds, [conversationId]: sentChatId } });
  return true;
}

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

  const chatId = (!conversationId ? pendingIds[tabKey] : undefined) ?? crypto.randomUUID();

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
