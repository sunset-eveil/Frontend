import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Global } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { globalStyles } from './styles/global';
import App from './App';

const QUERY_CLIENT = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={QUERY_CLIENT}>
      <Global styles={globalStyles} />
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
