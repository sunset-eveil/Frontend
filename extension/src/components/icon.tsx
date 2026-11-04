import type { ReactNode } from "react";
import styled from "@emotion/styled";

const ASSETS = import.meta.glob<string>("../assets/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const VARIANTS = {
  more: 109,
  pencil: 119,
  shield: 120,
  settings: 121,
  expand: 122,
  collapse: 124,
  close: 56,
  closeLarge: 126,
  user: 127,
  phone: 128,
  email: 129,
  id: 130,
  card: 131,
  pin: 132,
  userChip: 134,
  phoneChip: 46,
  emailChip: 135,
  pinChip: 136,
  send: 41,
  shieldCheck: 57,
  shieldCheckLarge: 138,
} as const;

export type IconName = keyof typeof VARIANTS;
type IconProps = { name: IconName };
type LogoProps = { size?: "button" | "status" | "editor" | "comparison" };

const Image = styled.img`
  display: block;
  flex-shrink: 0;
`;

export function Icon({ name }: IconProps): ReactNode {
  return (
    <Image
      src={ASSETS[`../assets/icon-${VARIANTS[name]}.svg`]}
      alt=""
      aria-hidden="true"
    />
  );
}

export function Logo({ size = "button" }: LogoProps): ReactNode {
  const variant = { button: 11, status: 10, editor: 12, comparison: 13 }[size];
  return <Image src={ASSETS[`../assets/logo-${variant}.svg`]} alt="Eveil" />;
}
