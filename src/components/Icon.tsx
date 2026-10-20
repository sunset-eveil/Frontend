import styled from "@emotion/styled";

const assets = import.meta.glob<string>("../assets/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
});

const variants = {
  more: 109,
  plus: 112,
  inputCaret: 113,
  microphone: 114,
  arrowUp: 115,
  file: 116,
  package: 117,
  firstAid: 118,
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
  coins: 133,
  userChip: 134,
  phoneChip: 46,
  emailChip: 135,
  pinChip: 136,
  coinsChip: 137,
  send: 41,
  shieldCheck: 57,
  shieldCheckLarge: 138,
} as const;

export type IconName = keyof typeof variants;
type IconProps = { name: IconName };
type LogoProps = { size?: "button" | "status" | "editor" | "comparison" };

const Image = styled.img<{ flip?: boolean }>`
  display: block;
  flex-shrink: 0;
  transform: ${({ flip }) => flip ? 'rotate(180deg)' : 'none'};
`;

export function Icon({ name }: IconProps) {
  return (
    <Image
      src={assets[`../assets/icon-${variants[name]}.svg`]}
      flip={name === 'inputCaret' || name === 'arrowUp' || name === 'microphone'}
      alt=""
      aria-hidden="true"
    />
  );
}

export function Logo({ size = "button" }: LogoProps) {
  const variant = { button: 11, status: 10, editor: 12, comparison: 13 }[size];
  return <Image src={assets[`../assets/logo-${variant}.svg`]} alt="Eveil" />;
}
