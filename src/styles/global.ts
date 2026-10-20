import { css } from '@emotion/react';
import { colors } from './colors';
import { fonts } from './fonts';

export const globalStyles = css`
  :root {
    color-scheme: dark;
    font-family: ${fonts.family};
    color: ${colors.text};
    background: ${colors.background};
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
    outline: 2px solid ${colors.indicator};
    outline-offset: 3px;
  }
`;
