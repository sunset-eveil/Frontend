import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import logoUrl from '../assets/logo.svg';

type LogoProps = {
  width?: number;
};

const LOGO_RATIO = 20 / 84;

const Image = styled.img`
  display: block;
  flex-shrink: 0;
`;

export function Logo({ width = 84 }: LogoProps): ReactNode {
  return <Image src={logoUrl} alt="Eveil" width={width} height={Math.round(width * LOGO_RATIO)} />;
}
