import { css } from '@emotion/react';
import { colors } from '../styles/colors';
import { fonts } from '../styles/fonts';

const base = css`
  display: inline-flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 10px;
  font-family: ${fonts.family};
  line-height: normal;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

/** 헤더의 작은 버튼 (도움말, 무료로 시작, 건너뛰기, 홈으로) */
export const navButton = {
  outline: css`
    ${base};
    padding: 10px 14px;
    border-color: ${colors.border};
    border-radius: 8px;
    background: ${colors.white};
    color: ${colors.label};
    font-size: 14px;
    font-weight: ${fonts.weight.semibold};

    &:hover {
      background: ${colors.surface};
    }
  `,
  primary: css`
    ${base};
    padding: 10px 14px;
    border-color: ${colors.primary};
    border-radius: 8px;
    background: ${colors.primary};
    color: ${colors.white};
    font-size: 14px;
    font-weight: ${fonts.weight.semibold};

    &:hover {
      background: ${colors.primaryDeep};
    }
  `,
};

/** 본문 영역의 큰 버튼 */
export const button = {
  primaryLarge: css`
    ${base};
    gap: 10px;
    padding: 16px 24px;
    background: ${colors.primary};
    color: ${colors.white};
    font-size: 16px;
    font-weight: ${fonts.weight.bold};

    &:hover {
      background: ${colors.primaryDeep};
    }
  `,
  next: css`
    ${base};
    padding: 12px 20px;
    background: ${colors.primary};
    color: ${colors.white};
    font-size: 16px;
    font-weight: ${fonts.weight.bold};

    &:hover {
      background: ${colors.primaryDeep};
    }
  `,
  secondary: css`
    ${base};
    padding: 12px 18px;
    border-color: ${colors.border};
    background: ${colors.white};
    color: ${colors.label};
    font-size: 16px;
    font-weight: ${fonts.weight.semibold};

    &:hover {
      background: ${colors.surface};
    }
  `,
};
