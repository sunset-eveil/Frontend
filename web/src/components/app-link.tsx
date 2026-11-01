import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { navigate } from '../hooks/use-route';

type AppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

/** 앱 안의 페이지로 이동하는 링크. 새로고침 없이 화면만 바꾼다. */
export function AppLink({ href, onClick, children, ...props }: AppLinkProps): ReactNode {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) {
      return;
    }
    event.preventDefault();
    navigate(href);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
