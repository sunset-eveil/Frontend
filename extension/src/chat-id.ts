const CHAT_IDS_KEY = 'eveilChatIds';
const PENDING_IDS_KEY = 'eveilPendingChatIds';
const CHAT_ID_STORAGE_LOCK = 'eveil-chat-id-storage';
export const LEGACY_CHAT_IDS_KEY = 'eveilLegacyChatIds';

export async function findChatId(conversationId: string): Promise<string | undefined> {
  const stored = await chrome.storage.local.get(CHAT_IDS_KEY);
  return (stored[CHAT_IDS_KEY] as Record<string, string> | undefined)?.[conversationId];
}

export async function bindFirstMessageChatId(
  conversationId: string,
  tabId: number,
  sentChatId: string,
): Promise<boolean> {
  return navigator.locks.request(CHAT_ID_STORAGE_LOCK, () =>
    bindPendingChatId(conversationId, tabId, sentChatId));
}

export async function discardPendingChatId(tabId: number, sentChatId: string): Promise<void> {
  return navigator.locks.request(CHAT_ID_STORAGE_LOCK, async () => {
    const pending = await chrome.storage.session.get(PENDING_IDS_KEY);
    const pendingIds = (pending[PENDING_IDS_KEY] ?? {}) as Record<string, string>;
    const tabKey = String(tabId);
    if (pendingIds[tabKey] !== sentChatId) return;
    delete pendingIds[tabKey];
    await chrome.storage.session.set({ [PENDING_IDS_KEY]: pendingIds });
  });
}

async function bindPendingChatId(conversationId: string, tabId: number, sentChatId: string): Promise<boolean> {
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

  return navigator.locks.request(CHAT_ID_STORAGE_LOCK, () => resolveStoredChatId(conversationId, tabId));
}

async function resolveStoredChatId(conversationId: string | null, tabId?: number): Promise<string> {
  const stored = await chrome.storage.local.get([CHAT_IDS_KEY, LEGACY_CHAT_IDS_KEY]);
  const chatIds = (stored[CHAT_IDS_KEY] ?? {}) as Record<string, string>;
  if (stored[LEGACY_CHAT_IDS_KEY] === undefined) {
    // Only chats already known before per-chat registration can use the old client.
    await chrome.storage.local.set({ [LEGACY_CHAT_IDS_KEY]: Object.values(chatIds) });
  }
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
