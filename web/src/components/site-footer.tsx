import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { COLORS } from '../styles/colors';
import { MEDIA } from '../styles/layout';
import { Logo } from './logo';

const Footer = styled.footer`
  border-top: 1px solid ${COLORS.divider};
  background: ${COLORS.white};
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 40px 24px;

  ${MEDIA.mobile} {
    padding: 32px 16px;
  }
`;

const Copyright = styled.span`
  color: ${COLORS.muted};
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
