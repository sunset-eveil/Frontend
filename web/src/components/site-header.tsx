import styled from '@emotion/styled';
import { ArrowLeft, Question } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { colors } from '../styles/colors';
import { fonts } from '../styles/fonts';
import { media } from '../styles/layout';
import { AppLink } from './app-link';
import { navButton } from './button';
import { Logo } from './logo';

type SiteHeaderProps =
  | { variant: 'landing' }
  | { variant: 'help' }
  | { variant: 'install' }
  | { variant: 'onboarding'; onSkip: () => void };

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid ${colors.divider};
  background: ${colors.headerBackground};
  backdrop-filter: blur(4px);
`;

const Inner = styled.div<{ narrow: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: ${({ narrow }) => (narrow ? 1080 : 1180)}px;
  height: 64px;
  margin: 0 auto;
  padding: 0 24px;

  ${media.mobile} {
    padding: 0 16px;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const HomeLink = styled(AppLink)`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const PageLabel = styled.span`
  padding-left: 10px;
  border-left: 1px solid ${colors.border};
  color: ${colors.muted};
  font-size: 16px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;
`;

const HelpNav = styled.nav`
  display: flex;
  gap: 28px;

  ${media.mobile} {
    display: none;
  }
`;

const HelpNavLink = styled(AppLink)`
  color: ${colors.label};
  font-size: 16px;
  font-weight: ${fonts.weight.medium};

  &:hover {
    color: ${colors.primary};
  }
`;

const TextLink = styled(AppLink)`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: ${colors.label};
  font-size: 14px;
  font-weight: ${fonts.weight.semibold};

  &:hover {
    color: ${colors.primary};
  }
`;

function HelpButton(): ReactNode {
  return (
    <AppLink href="/help" css={navButton.outline}>
      <Question size={16} color={colors.label} />
      도움말
    </AppLink>
  );
}

function HeaderActions(props: SiteHeaderProps): ReactNode {
  switch (props.variant) {
    case 'landing':
      return (
        <Actions>
          <HelpButton />
          <AppLink href="/install" css={navButton.primary}>
            무료로 시작
          </AppLink>
        </Actions>
      );
    case 'help':
      return (
        <AppLink href="/" css={navButton.outline}>
          <ArrowLeft size={14} color={colors.label} />
          홈으로
        </AppLink>
      );
    case 'install':
      return (
        <TextLink href="/help">
          <Question size={16} color={colors.label} />
          도움말
        </TextLink>
      );
    case 'onboarding':
      return (
        <Actions>
          <HelpButton />
          <button type="button" css={navButton.primary} onClick={props.onSkip}>
            건너뛰기
          </button>
        </Actions>
      );
  }
}

export function SiteHeader(props: SiteHeaderProps): ReactNode {
  const isHelp = props.variant === 'help';

  return (
    <Bar>
      <Inner narrow={props.variant === 'install'}>
        <HomeLink href="/" aria-label="Eveil 홈">
          <Logo />
          {isHelp && <PageLabel>도움말</PageLabel>}
        </HomeLink>
        {isHelp && (
          <HelpNav aria-label="도움말 메뉴">
            <HelpNavLink href="/help#faq">자주 묻는 질문</HelpNavLink>
            <HelpNavLink href="/help#contact">1:1 문의</HelpNavLink>
          </HelpNav>
        )}
        <HeaderActions {...props} />
      </Inner>
    </Bar>
  );
}
