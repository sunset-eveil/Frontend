import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Global } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GLOBAL_STYLES } from './styles/global';
import App from './app';
import { observeEmbeddedPanel } from './embedded-panel';

observeEmbeddedPanel();

const QUERY_CLIENT = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={QUERY_CLIENT}>
      <Global styles={GLOBAL_STYLES} />
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
