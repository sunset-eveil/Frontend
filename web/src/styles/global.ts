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

  body {
    margin: 0;
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
