import { css } from '@emotion/react';
import { COLORS } from './colors';
import { FONTS } from './fonts';

export const GLOBAL_STYLES = css`
  :root {
    color-scheme: dark;
    font-family: ${FONTS.family};
    color: ${COLORS.text};
    background: ${COLORS.background};
  }

  body {
    min-width: 320px;
    margin: 0;
  }

  * {
    box-sizing: border-box;
  }

  button,
  input,
  textarea {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }

  button:focus-visible,
  textarea:focus-visible {
    outline: 2px solid ${COLORS.indicator};
    outline-offset: 3px;
  }
`;
