import styled from '@emotion/styled';
import type { Icon } from '@phosphor-icons/react';
import { CreditCard, Database, LockKeyOpen } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { SectionTitle } from '../../components/section-title';
import { colors } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { media } from '../../styles/layout';

type Concern = {
  icon: Icon;
  quote: string;
  detail: string;
};

const CONCERNS: readonly Concern[] = [
  { icon: Database, quote: '“내 정보가 기록으로 남는 게 싫어요.”', detail: '보낸 대화는 서버에 그대로 저장돼요.' },
  { icon: LockKeyOpen, quote: '“해킹으로 유출될까 봐 불안해요.”', detail: '계정 도용 한 번에 대화가 통째로 넘어가요.' },
  { icon: CreditCard, quote: '“금융 사기에 쓰일까 봐 걱정돼요.”', detail: '유출된 계좌·카드번호는 피싱의 재료가 돼요.' },
];

const Section = styled.section`
  background: ${colors.background};
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 56px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 112px 24px;

  ${media.mobile} {
    gap: 40px;
    padding: 80px 16px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;

  ${media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 32px;
  border-radius: 16px;
  background: ${colors.white};
`;

const IconCircle = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: ${colors.dangerSurface};
`;

const Quote = styled.p`
  color: ${colors.heading};
  font-size: 20px;
  font-weight: ${fonts.weight.bold};
  line-height: 31px;
  letter-spacing: -0.4px;
`;

const Detail = styled.p`
  color: ${colors.secondary};
  font-size: 16px;
  line-height: 27.2px;
`;

export function ProblemSection(): ReactNode {
  return (
    <Section id="problem">
      <Inner>
        <SectionTitle
          eyebrow="PROBLEM"
          title={
            <>
              편해서 쓰는 ChatGPT,
              <br />내 정보는 어디까지 보냈을까요?
            </>
          }
          description="한 번 보낸 메시지는 되돌릴 수 없어요."
        />
        <Grid>
          {CONCERNS.map(({ icon: ConcernIcon, quote, detail }) => (
            <Card key={quote}>
              <IconCircle>
                <ConcernIcon size={24} color={colors.danger} />
              </IconCircle>
              <Quote>{quote}</Quote>
              <Detail>{detail}</Detail>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}
