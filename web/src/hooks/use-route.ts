import { useCallback, useEffect, useState } from 'react';

export type RoutePath = '/' | '/help' | '/install' | '/onboarding';

const ROUTE_PATHS: readonly RoutePath[] = ['/', '/help', '/install', '/onboarding'];
const NAVIGATE_EVENT = 'eveil:navigate';

function toRoutePath(pathname: string): RoutePath {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return ROUTE_PATHS.find((path) => path === normalized) ?? '/';
}

function scrollToHash(hash: string): void {
  if (!hash) {
    window.scrollTo({ top: 0 });
    return;
  }

  requestAnimationFrame(() => {
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  });
}

export function navigate(href: string): void {
  const url = new URL(href, window.location.origin);
  window.history.pushState(null, '', `${url.pathname}${url.hash}`);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
  scrollToHash(url.hash);
}

export function useRoute(): RoutePath {
  const [path, setPath] = useState<RoutePath>(() => toRoutePath(window.location.pathname));

  const syncPath = useCallback((): void => {
    setPath(toRoutePath(window.location.pathname));
  }, []);

  useEffect(() => {
    window.addEventListener('popstate', syncPath);
    window.addEventListener(NAVIGATE_EVENT, syncPath);
    scrollToHash(window.location.hash);

    return (): void => {
      window.removeEventListener('popstate', syncPath);
      window.removeEventListener(NAVIGATE_EVENT, syncPath);
    };
  }, [syncPath]);

  return path;
}
