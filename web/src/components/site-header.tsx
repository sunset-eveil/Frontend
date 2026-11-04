import styled from '@emotion/styled';
import { ArrowLeft, Question } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { COLORS } from '../styles/colors';
import { FONTS } from '../styles/fonts';
import { MEDIA } from '../styles/layout';
import { AppLink } from './app-link';
import { NAV_BUTTON } from './button';
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
  border-bottom: 1px solid ${COLORS.divider};
  background: ${COLORS.headerBackground};
  backdrop-filter: blur(4px);
`;

const Inner = styled.div<{ isNarrow: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: ${({ isNarrow }) => (isNarrow ? 1080 : 1180)}px;
  height: 64px;
  margin: 0 auto;
  padding: 0 24px;

  ${MEDIA.mobile} {
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
  border-left: 1px solid ${COLORS.border};
  color: ${COLORS.muted};
  font-size: 16px;
  font-weight: ${FONTS.weight.semibold};
  line-height: normal;
`;

const HelpNav = styled.nav`
  display: flex;
  gap: 28px;

  ${MEDIA.mobile} {
    display: none;
  }
`;

const HelpNavLink = styled(AppLink)`
  color: ${COLORS.label};
  font-size: 16px;
  font-weight: ${FONTS.weight.medium};

  &:hover {
    color: ${COLORS.primary};
  }
`;

const TextLink = styled(AppLink)`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: ${COLORS.label};
  font-size: 14px;
  font-weight: ${FONTS.weight.semibold};

  &:hover {
    color: ${COLORS.primary};
  }
`;

function HelpButton(): ReactNode {
  return (
    <AppLink href="/help" css={NAV_BUTTON.outline}>
      <Question size={16} color={COLORS.label} />
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
          <AppLink href="/install" css={NAV_BUTTON.primary}>
            무료로 시작
          </AppLink>
        </Actions>
      );
    case 'help':
      return (
        <AppLink href="/" css={NAV_BUTTON.outline}>
          <ArrowLeft size={14} color={COLORS.label} />
          홈으로
        </AppLink>
      );
    case 'install':
      return (
        <TextLink href="/help">
          <Question size={16} color={COLORS.label} />
          도움말
        </TextLink>
      );
    case 'onboarding':
      return (
        <Actions>
          <HelpButton />
          <button type="button" css={NAV_BUTTON.primary} onClick={props.onSkip}>
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
      <Inner isNarrow={props.variant === 'install'}>
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
