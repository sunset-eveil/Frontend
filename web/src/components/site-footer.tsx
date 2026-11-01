import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { colors } from '../styles/colors';
import { media } from '../styles/layout';
import { Logo } from './logo';

const Footer = styled.footer`
  border-top: 1px solid ${colors.divider};
  background: ${colors.white};
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 24px;

  ${media.mobile} {
    padding: 32px 16px;
  }
`;

const Copyright = styled.span`
  color: ${colors.muted};
  font-size: 14px;
  line-height: normal;
`;

export function SiteFooter(): ReactNode {
  return (
    <Footer>
      <Inner>
        <Logo width={66} />
        <Copyright>© 2026 Eveil. All rights reserved.</Copyright>
      </Inner>
    </Footer>
  );
}
