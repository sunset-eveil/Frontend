import { useState, type FormEvent, type ReactElement } from 'react';
import styled from '@emotion/styled';
import { submitPassphrase, type RegistrationMode } from '../registration';
import { COLORS } from '../styles/colors';
import { Button } from './button';

type RegistrationScreenProps = {
  chatId: string;
  mode: Exclude<RegistrationMode, 'ready'>;
  onComplete: () => void;
};

const Page = styled.main`
  display: grid;
  min-height: 100dvh;
  padding: 24px;
  place-items: center;
  background: ${COLORS.background};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(100%, 380px);
  padding: 24px;
  border: 1px solid ${COLORS.border};
  border-radius: 16px;
  background: ${COLORS.surface};
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
`;

const Description = styled.p`
  margin: 0;
  color: ${COLORS.muted};
  font-size: 14px;
  line-height: 1.5;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${COLORS.border};
  border-radius: 8px;
  color: ${COLORS.text};
  background: ${COLORS.surfaceRaised};
`;

const ErrorMessage = styled.p`
  margin: 0;
  color: ${COLORS.highlightText};
  font-size: 13px;
  line-height: 1.5;
`;

export function RegistrationScreen({ chatId, mode, onComplete }: RegistrationScreenProps): ReactElement {
  const [passphrase, setPassphrase] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isPending || mode === 'error') {
      return;
    }

    setIsPending(true);
    setError('');

    try {
      await submitPassphrase(chatId, passphrase, mode);
      setPassphrase('');
      onComplete();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '처리 중 오류가 발생했습니다.');
    } finally {
      setIsPending(false);
    }
  };

  return <Page>
    <Form onSubmit={handleSubmit}>
      <Title>{isRegister ? 'Eveil 시작하기' : 'Eveil 잠금 해제'}</Title>
      <Description>
        {isRegister
          ? '이 대화에 사용할 패스프레이즈를 설정하세요.'
          : '이 대화에 설정한 패스프레이즈를 입력하세요.'}
      </Description>
      {mode === 'error' ? (
        <ErrorMessage role="alert">등록 상태를 읽지 못했습니다. 확장 프로그램을 다시 열어 주세요.</ErrorMessage>
      ) : (
        <>
          <Label>
            패스프레이즈
            <Input
              type="password"
              autoComplete="off"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              required
            />
          </Label>
          {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
          <Button type="submit" variant="filled" disabled={isPending || !passphrase}>
            {isPending ? '처리 중...' : isRegister ? '등록하기' : '잠금 해제'}
          </Button>
        </>
      )}
    </Form>
  </Page>;
}
