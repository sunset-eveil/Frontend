import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import chatgptMarkUrl from '../assets/chatgpt-mark.svg';

type ChatgptMarkProps = {
  size: number;
  color: string;
};

const Mark = styled.span<{ markSize: number; markColor: string }>`
  display: block;
  flex-shrink: 0;
  width: ${({ markSize }) => markSize}px;
  height: ${({ markSize }) => markSize}px;
  background: ${({ markColor }) => markColor};
  mask: url(${chatgptMarkUrl}) center / contain no-repeat;
`;

/** Figma와 같이 ChatGPT 마크 모양을 마스크로 써서 원하는 색을 칠한다. */
export function ChatgptMark({ size, color }: ChatgptMarkProps): ReactNode {
  return <Mark markSize={size} markColor={color} aria-hidden />;
}
