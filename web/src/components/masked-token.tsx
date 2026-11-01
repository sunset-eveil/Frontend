import styled from '@emotion/styled';
import { colors } from '../styles/colors';
import { fonts } from '../styles/fonts';

type MaskedTokenProps = {
  tone?: 'chip' | 'white';
  size?: 'regular' | 'small';
};

/** 가명으로 바뀐 개인정보를 표시하는 칩 (예: 이름_1) */
export const MaskedToken = styled.span<MaskedTokenProps>`
  display: inline-block;
  margin: 0 2px;
  padding: ${({ size = 'regular' }) => (size === 'small' ? '0 6px' : '0 8px')};
  border-radius: ${({ size = 'regular' }) => (size === 'small' ? 4 : 5)}px;
  background: ${({ tone = 'chip' }) => (tone === 'white' ? colors.white : colors.chip)};
  color: ${colors.primaryDeep};
  font-size: 14px;
  font-weight: ${fonts.weight.bold};
  line-height: ${({ size = 'regular' }) => (size === 'small' ? 18 : 20)}px;
  white-space: nowrap;
`;
