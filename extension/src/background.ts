import { getChatMappings } from './api/chat-mappings';
import { bindFirstMessageChatId, findChatId } from './chat-id';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'eveil:get-host-tab') {
    sendResponse({ tabId: sender.tab?.id });
    return;
  }
  if ((message?.type !== 'eveil:get-response-mappings' && message?.type !== 'eveil:bind-first-message') ||
    sender.frameId !== 0 ||
    (sender.origin !== 'https://chatgpt.com' && sender.origin !== 'https://chat.openai.com') ||
    typeof message.conversationId !== 'string' ||
    !/^[0-9a-f-]{36}$/i.test(message.conversationId)) return;
  if (message.type === 'eveil:bind-first-message') {
    if (sender.tab?.id === undefined || typeof message.chatId !== 'string') return;
    void bindFirstMessageChatId(message.conversationId, sender.tab.id, message.chatId).then(
      (saved) => sendResponse({ saved }),
      () => sendResponse({ saved: false }),
    );
    return true;
  }

  const senderConversationId = sender.url &&
    new URL(sender.url).pathname.match(/\/c\/([0-9a-f-]{36})(?:\/|$)/i)?.[1];
  if (senderConversationId !== message.conversationId) return;

  void findChatId(message.conversationId).then(async (chatId) => {
    return { mappings: chatId ? await getChatMappings(chatId) : [] };
  }).then(sendResponse, () => sendResponse({}));
  return true;
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;
  await chrome.action.setBadgeText({ tabId: tab.id, text: '' });
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'eveil:toggle-composer' });
    if (!result?.mounted) throw new Error('Composer unavailable');
    await chrome.action.setTitle({ tabId: tab.id, title: 'Eveil 입력창 열기' });
  } catch {
    await chrome.action.setTitle({ tabId: tab.id, title: 'ChatGPT 페이지를 열거나 새로고침한 뒤 EVEIL을 눌러 주세요.' });
  }
});
