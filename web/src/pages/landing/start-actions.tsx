import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { DownloadSimple, Question } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { AppLink } from '../../components/app-link';
import { colors } from '../../styles/colors';
import { fonts } from '../../styles/fonts';

type StartActionsProps = {
  justify?: 'flex-start' | 'center';
};

const Row = styled.div<{ justify: StartActionsProps['justify'] }>`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: ${({ justify }) => justify};
`;

const actionBase = css`
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
    outline: 2px solid ${colors.white};
    outline-offset: 2px;
  }
`;

const installStyle = css`
  ${actionBase};
  background: ${colors.white};
  color: ${colors.primaryDeep};
  font-weight: ${fonts.weight.bold};

  &:hover {
    background: ${colors.tile};
  }
`;

const helpStyle = css`
  ${actionBase};
  border-color: ${colors.whiteAlpha40};
  color: ${colors.white};
  font-weight: ${fonts.weight.semibold};

  &:hover {
    border-color: ${colors.white};
  }
`;

/** 파란 배경 위의 '크롬에 무료로 추가' + '도움말' 버튼 묶음 */
export function StartActions({ justify = 'flex-start' }: StartActionsProps): ReactNode {
  return (
    <Row justify={justify}>
      <AppLink href="/install" css={installStyle}>
        <DownloadSimple size={18} color={colors.primaryDeep} />
        크롬에 무료로 추가
      </AppLink>
      <AppLink href="/help" css={helpStyle}>
        <Question size={18} color={colors.white} />
        도움말
      </AppLink>
    </Row>
  );
}
