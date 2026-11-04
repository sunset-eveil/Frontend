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
