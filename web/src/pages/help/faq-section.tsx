import styled from '@emotion/styled';
import { CaretDown } from '@phosphor-icons/react';
import { useState, type ReactNode } from 'react';
import { colors } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { media } from '../../styles/layout';
import { FAQ_CATEGORIES, type FaqCategory, type FaqItem } from './faq-data';

type FaqSectionProps = {
  items: readonly FaqItem[];
  category: FaqCategory | null;
  onCategoryChange: (category: FaqCategory | null) => void;
  hasQuery: boolean;
};

const Section = styled.section`
  scroll-margin-top: 64px;
  background: ${colors.white};
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 880px;
  margin: 0 auto;
  padding: 88px 24px;

  ${media.mobile} {
    padding: 64px 16px;
  }
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Eyebrow = styled.span`
  color: ${colors.primary};
  font-size: 16px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const Title = styled.h2`
  color: ${colors.heading};
  font-size: 34px;
  font-weight: ${fonts.weight.extrabold};
  line-height: normal;
  letter-spacing: -1.02px;
`;

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  padding: 10px 16px;
  border: 1px solid ${({ isActive }) => (isActive ? colors.heading : colors.border)};
  border-radius: 999px;
  background: ${({ isActive }) => (isActive ? colors.heading : colors.white)};
  color: ${({ isActive }) => (isActive ? colors.white : colors.label)};
  font-size: 14px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;

  &:hover {
    border-color: ${colors.heading};
  }
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  border-top: 1px solid ${colors.heading};
  list-style: none;
`;

const Item = styled.li`
  border-bottom: 1px solid ${colors.divider};
`;

const QuestionButton = styled.button`
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  padding: 22px 4px;
  border: none;
  background: none;
  text-align: left;
`;

const Mark = styled.span<{ isAnswer?: boolean }>`
  flex-shrink: 0;
  width: 14px;
  color: ${({ isAnswer }) => (isAnswer ? colors.muted : colors.primary)};
  font-size: 18px;
  font-weight: ${fonts.weight.extrabold};
  line-height: normal;
`;

const QuestionText = styled.span`
  flex: 1;
  color: ${colors.heading};
  font-size: 16px;
  font-weight: ${fonts.weight.semibold};
  line-height: 24px;
`;

const CategoryTag = styled.span`
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: 999px;
  background: ${colors.background};
  color: ${colors.muted};
  font-size: 12px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;

  ${media.mobile} {
    display: none;
  }
`;

const Caret = styled.span<{ isOpen: boolean }>`
  display: flex;
  flex-shrink: 0;
  transform: rotate(${({ isOpen }) => (isOpen ? 180 : 0)}deg);
  transition: transform 0.2s ease;
`;

const Answer = styled.div`
  display: flex;
  gap: 16px;
  padding: 0 4px 24px;
`;

const AnswerText = styled.p`
  flex: 1;
  padding: 15px 18px 17px;
  border-radius: 10px;
  background: ${colors.surface};
  color: ${colors.secondary};
  font-size: 16px;
  line-height: 28.8px;
`;

const Empty = styled.p`
  padding: 40px 4px;
  color: ${colors.muted};
  font-size: 16px;
  text-align: center;
`;

export function FaqSection({ items, category, onCategoryChange, hasQuery }: FaqSectionProps): ReactNode {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const toggle = (id: string): void => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <Section id="faq">
      <Inner>
        <Heading>
          <Eyebrow>FAQ</Eyebrow>
          <Title>자주 묻는 질문</Title>
        </Heading>

        <Filters role="group" aria-label="질문 분류">
          <FilterButton type="button" isActive={category === null} onClick={() => onCategoryChange(null)}>
            전체
          </FilterButton>
          {FAQ_CATEGORIES.map((item) => (
            <FilterButton
              key={item}
              type="button"
              isActive={category === item}
              aria-pressed={category === item}
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </FilterButton>
          ))}
        </Filters>

        <List>
          {items.map(({ id, category: itemCategory, question, answer }) => {
            const isOpen = openId === id;
            const answerId = `faq-answer-${id}`;

            return (
              <Item key={id}>
                <QuestionButton type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => toggle(id)}>
                  <Mark aria-hidden>Q</Mark>
                  <QuestionText>{question}</QuestionText>
                  <CategoryTag>{itemCategory}</CategoryTag>
                  <Caret isOpen={isOpen} aria-hidden>
                    <CaretDown size={18} color={colors.muted} />
                  </Caret>
                </QuestionButton>
                {isOpen && (
                  <Answer id={answerId}>
                    <Mark isAnswer aria-hidden>
                      A
                    </Mark>
                    <AnswerText>{answer}</AnswerText>
                  </Answer>
                )}
              </Item>
            );
          })}
        </List>
        {items.length === 0 && (
          <Empty>{hasQuery ? '검색 결과가 없어요. 아래 1:1 문의로 남겨 주세요.' : '등록된 질문이 없어요.'}</Empty>
        )}
      </Inner>
    </Section>
  );
}
