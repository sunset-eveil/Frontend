import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { DownloadSimple, Question } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { AppLink } from '../../components/app-link';
import { COLORS } from '../../styles/colors';
import { FONTS } from '../../styles/fonts';

type StartActionsProps = {
  justify?: 'flex-start' | 'center';
};

const Row = styled.div<{ justify: StartActionsProps['justify'] }>`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: ${({ justify }) => justify};
`;

const ACTION_BASE = css`
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 16px 24px;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 16px;
  line-height: normal;
  white-space: nowrap;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:focus-visible {
    outline: 2px solid ${COLORS.white};
    outline-offset: 2px;
  }
`;

const INSTALL_STYLE = css`
  ${ACTION_BASE};
  background: ${COLORS.white};
  color: ${COLORS.primaryDeep};
  font-weight: ${FONTS.weight.bold};

  &:hover {
    background: ${COLORS.tile};
  }
`;

const HELP_STYLE = css`
  ${ACTION_BASE};
  border-color: ${COLORS.whiteAlpha40};
  color: ${COLORS.white};
  font-weight: ${FONTS.weight.semibold};

  &:hover {
    border-color: ${COLORS.white};
  }
`;

/** 파란 배경 위의 '크롬에 무료로 추가' + '도움말' 버튼 묶음 */
export function StartActions({ justify = 'flex-start' }: StartActionsProps): ReactNode {
  return (
    <Row justify={justify}>
      <AppLink href="/install" css={INSTALL_STYLE}>
        <DownloadSimple size={18} color={COLORS.primaryDeep} />
        크롬에 무료로 추가
      </AppLink>
      <AppLink href="/help" css={HELP_STYLE}>
        <Question size={18} color={COLORS.white} />
        도움말
      </AppLink>
    </Row>
  );
}
