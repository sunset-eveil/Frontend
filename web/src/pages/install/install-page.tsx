import styled from '@emotion/styled';
import { Check, GoogleChromeLogo } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { AppLink } from '../../components/app-link';
import { button } from '../../components/button';
import { Logo } from '../../components/logo';
import { SiteHeader } from '../../components/site-header';
import { FloatingPanel, SplitCard } from '../../components/split-card';
import { CHROME_WEB_STORE_URL } from '../../constants/links';
import { colors } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { media } from '../../styles/layout';

type InstallStep = { title: string; text: string };

const INSTALL_STEPS: readonly InstallStep[] = [
  { title: 'Chrome에 추가', text: '버튼을 누르고 권한을 확인해요' },
  { title: '1분 온보딩', text: '보호 항목을 고르고 직접 체험해요' },
  { title: 'ChatGPT에서 사용', text: '입력창 옆 Eveil 버튼을 눌러요' },
];

const PROMISES: readonly string[] = ['chatgpt.com에서만 작동', '원본은 내 기기에서만 처리', '대화 기록 수집 없음'];

const Page = styled.div`
  min-height: 100dvh;
  background: ${colors.background};
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 880px;
  margin: 0 auto;
  padding: 56px 24px 120px;

  ${media.mobile} {
    padding: 32px 16px 80px;
  }
`;

const Eyebrow = styled.span`
  color: ${colors.primary};
  font-size: 14px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const Title = styled.h1`
  margin-top: 20px;
  color: ${colors.heading};
  font-size: 36px;
  font-weight: ${fonts.weight.extrabold};
  line-height: 46.8px;
  letter-spacing: -1.08px;

  ${media.mobile} {
    font-size: 30px;
    line-height: 40px;
  }
`;

const Lead = styled.p`
  margin: 20px 0 22px;
  color: ${colors.secondary};
  font-size: 16px;
  line-height: 28px;
`;

const Note = styled.p`
  margin-top: 22px;
  color: ${colors.muted};
  font-size: 14px;
  line-height: normal;
`;

const PanelBody = styled(FloatingPanel)`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  border-radius: 16px;
`;

const PanelCaption = styled.span`
  margin-top: 6px;
  color: ${colors.muted};
  font-size: 12px;
  line-height: normal;
`;

const PromiseList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const PromiseItem = styled.li`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${colors.label};
  font-size: 14px;
  line-height: normal;
`;

const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;

  ${media.mobile} {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.li`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 20px;
  border-radius: 14px;
  background: ${colors.white};
`;

const StepNumber = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: ${colors.tile};
  color: ${colors.primary};
  font-size: 14px;
  font-weight: ${fonts.weight.extrabold};
`;

const StepText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StepTitle = styled.span`
  color: ${colors.heading};
  font-size: 16px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const StepCaption = styled.span`
  color: ${colors.secondary};
  font-size: 14px;
  line-height: 21px;
`;

function InstallButton(): ReactNode {
  const content = (
    <>
      <GoogleChromeLogo size={20} color={colors.white} />
      Chrome에 추가
    </>
  );

  if (CHROME_WEB_STORE_URL) {
    return (
      <a href={CHROME_WEB_STORE_URL} target="_blank" rel="noreferrer" css={button.primaryLarge}>
        {content}
      </a>
    );
  }

  return (
    <AppLink href="/onboarding" css={button.primaryLarge}>
      {content}
    </AppLink>
  );
}

export function InstallPage(): ReactNode {
  return (
    <Page>
      <SiteHeader variant="install" />
      <Main>
        <SplitCard
          height={406}
          copy={
            <div css={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <Eyebrow>무료 · 회원가입 없음</Eyebrow>
              <Title>
                크롬에 Eveil을
                <br />
                추가해 주세요
              </Title>
              <Lead>설치가 끝나면 1분 온보딩으로 바로 시작할 수 있어요.</Lead>
              <InstallButton />
              <Note>Edge · Whale 등 크로미움 기반 브라우저에서도 쓸 수 있어요.</Note>
            </div>
          }
          visual={
            <PanelBody>
              <div css={{ display: 'flex', flexDirection: 'column' }}>
                <Logo width={76} />
                <PanelCaption>ChatGPT 개인정보 보호</PanelCaption>
              </div>
              <PromiseList>
                {PROMISES.map((text) => (
                  <PromiseItem key={text}>
                    <Check size={14} color={colors.primary} />
                    {text}
                  </PromiseItem>
                ))}
              </PromiseList>
            </PanelBody>
          }
        />

        <Steps>
          {INSTALL_STEPS.map(({ title, text }, index) => (
            <StepCard key={title}>
              <StepNumber>{index + 1}</StepNumber>
              <StepText>
                <StepTitle>{title}</StepTitle>
                <StepCaption>{text}</StepCaption>
              </StepText>
            </StepCard>
          ))}
        </Steps>
      </Main>
    </Page>
  );
}
