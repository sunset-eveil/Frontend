import styled from '@emotion/styled';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useMemo, useState, type ReactNode } from 'react';
import { SiteFooter } from '../../components/site-footer';
import { SiteHeader } from '../../components/site-header';
import { colors, shadows } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { media } from '../../styles/layout';
import { ContactSection } from './contact-section';
import { FAQ_ITEMS, type FaqCategory, type FaqItem } from './faq-data';
import { FaqSection } from './faq-section';

function filterFaq(items: readonly FaqItem[], category: FaqCategory | null, query: string): FaqItem[] {
  const keyword = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesCategory = category === null || item.category === category;
    const matchesKeyword =
      keyword.length === 0 || `${item.question} ${item.answer}`.toLowerCase().includes(keyword);
    return matchesCategory && matchesKeyword;
  });
}

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  background: ${colors.primaryDeep};

  &::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -160px;
    width: 520px;
    height: 520px;
    border: 1px solid ${colors.whiteAlpha12};
    border-radius: 50%;
  }
`;

const HeroInner = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  max-width: 880px;
  margin: 0 auto;
  padding: 80px 24px;

  ${media.mobile} {
    padding: 56px 16px;
  }
`;

const HeroTitle = styled.h1`
  color: ${colors.white};
  font-size: 46px;
  font-weight: ${fonts.weight.extrabold};
  line-height: 57.5px;
  letter-spacing: -1.61px;
  text-align: center;

  ${media.mobile} {
    font-size: 32px;
    line-height: 42px;
  }
`;

const SearchBox = styled.label`
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  max-width: 560px;
  padding: 0 18px;
  border-radius: 12px;
  background: ${colors.white};
  box-shadow: ${shadows.search};
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  height: 56px;
  padding: 0 2px;
  border: none;
  background: none;
  color: ${colors.heading};
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: ${colors.placeholder};
  }
`;

export function HelpPage(): ReactNode {
  const [category, setCategory] = useState<FaqCategory | null>(null);
  const [query, setQuery] = useState('');
  const items = useMemo((): FaqItem[] => filterFaq(FAQ_ITEMS, category, query), [category, query]);

  return (
    <>
      <SiteHeader variant="help" />
      <main>
        <Hero>
          <HeroInner>
            <HeroTitle>무엇을 도와드릴까요?</HeroTitle>
            <SearchBox>
              <MagnifyingGlass size={20} color={colors.muted} aria-hidden />
              <SearchInput
                type="search"
                aria-label="자주 묻는 질문 검색"
                placeholder="궁금한 내용을 검색해 보세요 (예: 복원, 설치)"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </SearchBox>
          </HeroInner>
        </Hero>
        <FaqSection
          items={items}
          category={category}
          onCategoryChange={setCategory}
          hasQuery={query.trim().length > 0}
        />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
