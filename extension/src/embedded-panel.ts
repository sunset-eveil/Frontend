const parentOrigin = new URLSearchParams(location.search).get('parentOrigin');
const CHAT_ORIGINS = ['https://chatgpt.com', 'https://chat.openai.com'];

export const IS_EMBEDDED = window.parent !== window &&
  new URLSearchParams(location.search).get('embedded') === '1' &&
  parentOrigin !== null && CHAT_ORIGINS.includes(parentOrigin);

export function closeEmbeddedPanel(): void {
  if (IS_EMBEDDED && parentOrigin) window.parent.postMessage({ type: 'eveil:close' }, parentOrigin);
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
