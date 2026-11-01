import { css } from '@emotion/react';
import { colors } from './colors';
import { fonts } from './fonts';

export const globalStyles = css`
  :root {
    color-scheme: light;
    font-family: ${fonts.family};
    color: ${colors.heading};
    background: ${colors.white};
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }

  /* 시스템이 다크 모드여도 입력창 등 기본 컨트롤이 어둡게 칠해지지 않도록 라이트로 고정 */
  html,
  body {
    color-scheme: light;
  }

  body {
    margin: 0;
    background: ${colors.white};
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }

  button {
    cursor: pointer;
  }
`;
