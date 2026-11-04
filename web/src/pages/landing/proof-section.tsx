import styled from '@emotion/styled';
import type { Icon } from '@phosphor-icons/react';
import { CreditCard, Database, LockKey } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { CountUp } from '../../components/count-up';
import { Reveal } from '../../components/reveal';
import { SectionTitle } from '../../components/section-title';
import { COLORS } from '../../styles/colors';
import { FONTS } from '../../styles/fonts';
import { MEDIA } from '../../styles/layout';

type Stat = { value: number; decimals?: number; suffix: string; label: string };
type Testimonial = { quote: string; name: string; role: string };
type SafetyPromise = { icon: Icon; label: string; text: string };

const STATS: readonly Stat[] = [
  { value: 12, suffix: '만+', label: '누적 사용자' },
  { value: 3400, suffix: '만', label: '감지된 개인정보' },
  { value: 4.8, decimals: 1, suffix: '', label: '크롬 웹스토어 평점' },
];

const TESTIMONIALS: readonly Testimonial[] = [
  { quote: '“이제 내 정보가 기록으로 남지 않아 마음이 편해요.”', name: '박서연', role: '대학생' },
  { quote: '“해킹이 나도 가명뿐이라 걱정이 줄었어요.”', name: '이준호', role: '직장인' },
  { quote: '“계좌번호를 보내기 전에 먼저 가려줘서 안심돼요.”', name: '최유진', role: '사회초년생' },
];

const PROMISES: readonly SafetyPromise[] = [
  { icon: Database, label: '기록 안 남김', text: '원본은 서버에 저장되지 않아요' },
  { icon: LockKey, label: '유출 걱정 없음', text: 'ChatGPT에는 가명만 전달돼요' },
  { icon: CreditCard, label: '금융 정보 보호', text: '계좌·카드번호는 항상 가려요' },
];

const Section = styled.section`
  background: ${COLORS.navy};
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 64px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 112px 24px;

  ${MEDIA.mobile} {
    gap: 40px;
    padding: 80px 16px;
  }
`;

const Stats = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid ${COLORS.whiteAlpha14};
  border-bottom: 1px solid ${COLORS.whiteAlpha14};

  ${MEDIA.mobile} {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
  align-items: center;
  padding: 36px 24px;
  text-align: center;

  & + & {
    border-left: 1px solid ${COLORS.whiteAlpha14};
  }

  ${MEDIA.mobile} {
    padding: 24px;

    & + & {
      border-top: 1px solid ${COLORS.whiteAlpha14};
      border-left: none;
    }
  }
`;

const StatValue = styled.dd`
  margin: 0;
  color: ${COLORS.white};
  font-size: 48px;
  font-weight: ${FONTS.weight.extrabold};
  line-height: normal;
  letter-spacing: -1.44px;
`;

const StatLabel = styled.dt`
  color: ${COLORS.subtle};
  font-size: 16px;
  line-height: normal;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  ${MEDIA.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.figure`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  margin: 0;
  padding: 32px;
  border-radius: 16px;
  background: ${COLORS.navyCard};
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    background: ${COLORS.navyCardHover};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const Quote = styled.blockquote`
  margin: 0;
  color: ${COLORS.testimonial};
  font-size: 18px;
  line-height: 31.5px;
`;

const Author = styled.figcaption`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Avatar = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: ${COLORS.primary};
  color: ${COLORS.white};
  font-size: 16px;
  font-weight: ${FONTS.weight.bold};
`;

const AuthorText = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: normal;
`;

const PromiseItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 0;
  border-top: 1px solid ${COLORS.whiteAlpha14};
`;

const PromiseLabel = styled.span`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${COLORS.mint};
  font-size: 14px;
  font-weight: ${FONTS.weight.bold};
  line-height: normal;
`;

const PromiseText = styled.span`
  color: ${COLORS.white};
  font-size: 18px;
  font-weight: ${FONTS.weight.semibold};
  line-height: 27.9px;
`;

export function ProofSection(): ReactNode {
  return (
    <Section id="proof">
      <Inner>
        <SectionTitle
          tone="dark"
          eyebrow="REVIEWS"
          title={
            <>
              많은 사람들이
              <br />
              Eveil로 ChatGPT를 안심하고 써요
            </>
          }
        />

        <Stats>
          {STATS.map(({ value, decimals, suffix, label }) => (
            <StatItem key={label}>
              <StatLabel>{label}</StatLabel>
              <StatValue>
                <CountUp to={value} decimals={decimals} suffix={suffix} />
              </StatValue>
            </StatItem>
          ))}
        </Stats>

        <Grid>
          {TESTIMONIALS.map(({ quote, name, role }, index) => (
            <Reveal key={name} delay={index * 120}>
              <Card>
                <Quote>{quote}</Quote>
                <Author>
                  <Avatar aria-hidden>{name.charAt(0)}</Avatar>
                  <AuthorText>
                    <span css={{ color: COLORS.white, fontSize: 16, fontWeight: FONTS.weight.bold }}>{name}</span>
                    <span css={{ color: COLORS.subtle, fontSize: 14 }}>{role}</span>
                  </AuthorText>
                </Author>
              </Card>
            </Reveal>
          ))}
        </Grid>

        <Grid>
          {PROMISES.map(({ icon: PromiseIcon, label, text }) => (
            <PromiseItem key={label}>
              <PromiseLabel>
                <PromiseIcon size={18} color={COLORS.mint} />
                {label}
              </PromiseLabel>
              <PromiseText>{text}</PromiseText>
            </PromiseItem>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}
