import type { ReactNode } from 'react';
import { useRoute } from './hooks/use-route';
import { HelpPage } from './pages/help/help-page';
import { InstallPage } from './pages/install/install-page';
import { LandingPage } from './pages/landing/landing-page';
import { OnboardingPage } from './pages/onboarding/onboarding-page';

export function App(): ReactNode {
  const path = useRoute();

  switch (path) {
    case '/help':
      return <HelpPage />;
    case '/install':
      return <InstallPage />;
    case '/onboarding':
      return <OnboardingPage />;
    case '/':
      return <LandingPage />;
  }
}
