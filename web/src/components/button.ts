import { css } from '@emotion/react';
import { COLORS } from '../styles/colors';
import { FONTS } from '../styles/fonts';

const BASE = css`
  display: inline-flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 10px;
  font-family: ${FONTS.family};
  line-height: normal;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;

  &:focus-visible {
    outline: 2px solid ${COLORS.primary};
    outline-offset: 2px;
  }
`;

/** 헤더의 작은 버튼 (도움말, 무료로 시작, 건너뛰기, 홈으로) */
export const NAV_BUTTON = {
  outline: css`
    ${BASE};
    padding: 10px 14px;
    border-color: ${COLORS.border};
    border-radius: 8px;
    background: ${COLORS.white};
    color: ${COLORS.label};
    font-size: 14px;
    font-weight: ${FONTS.weight.semibold};

    &:hover {
      background: ${COLORS.surface};
    }
  `,
  primary: css`
    ${BASE};
    padding: 10px 14px;
    border-color: ${COLORS.primary};
    border-radius: 8px;
    background: ${COLORS.primary};
    color: ${COLORS.white};
    font-size: 14px;
    font-weight: ${FONTS.weight.semibold};

    &:hover {
      background: ${COLORS.primaryDeep};
    }
  `,
};

/** 본문 영역의 큰 버튼 */
export const BUTTON = {
  primaryLarge: css`
    ${BASE};
    gap: 10px;
    padding: 16px 24px;
    background: ${COLORS.primary};
    color: ${COLORS.white};
    font-size: 16px;
    font-weight: ${FONTS.weight.bold};

    &:hover {
      background: ${COLORS.primaryDeep};
    }
  `,
  next: css`
    ${BASE};
    padding: 12px 20px;
    background: ${COLORS.primary};
    color: ${COLORS.white};
    font-size: 16px;
    font-weight: ${FONTS.weight.bold};

    &:hover {
      background: ${COLORS.primaryDeep};
    }
  `,
  secondary: css`
    ${BASE};
    padding: 12px 18px;
    border-color: ${COLORS.border};
    background: ${COLORS.white};
    color: ${COLORS.label};
    font-size: 16px;
    font-weight: ${FONTS.weight.semibold};

    &:hover {
      background: ${COLORS.surface};
    }
  `,
};
