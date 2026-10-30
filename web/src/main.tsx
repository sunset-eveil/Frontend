import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Global, css } from '@emotion/react';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Global styles={css`
      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }
    `} />
    <App />
  </StrictMode>,
);
