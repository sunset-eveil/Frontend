import { Global } from '@emotion/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import { GLOBAL_STYLES } from './styles/global';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Global styles={GLOBAL_STYLES} />
    <App />
  </StrictMode>,
);
