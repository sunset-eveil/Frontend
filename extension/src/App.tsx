import { useEffect, useState, type ReactElement } from 'react';
import { RegistrationScreen } from './components/registration-screen';
import { getRegistrationMode, type RegistrationMode } from './registration';
import { PreviewPage } from './PreviewPage';

export default function App(): ReactElement | null {
  const [mode, setMode] = useState<RegistrationMode | 'loading'>('loading');

  useEffect(() => {
    if (!globalThis.chrome?.storage) {
      setMode('ready');
      return;
    }

    getRegistrationMode().then(setMode).catch(() => setMode('error'));
  }, []);

  if (mode === 'loading') {
    return null;
  }

  if (mode !== 'ready') {
    return <RegistrationScreen mode={mode} onComplete={() => setMode('ready')} />;
  }

  return <PreviewPage />;
}
