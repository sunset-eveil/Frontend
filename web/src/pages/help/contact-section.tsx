import styled from '@emotion/styled';
import { PaperPlaneTilt, ShieldCheck } from '@phosphor-icons/react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { button } from '../../components/button';
import { INQUIRY_EMAIL } from '../../constants/links';
import { colors, shadows } from '../../styles/colors';
import { fonts } from '../../styles/fonts';
import { media } from '../../styles/layout';

const INQUIRY_TYPES: readonly string[] = ['설치·사용 방법', '개인정보 보호', '계정·요금', '오류 신고', '기타'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InquiryForm = {
  type: string;
  email: string;
  message: string;
  hasAgreed: boolean;
};

type FormErrors = Partial<Record<'email' | 'message' | 'hasAgreed' | 'form', string>>;

const INITIAL_FORM: InquiryForm = { type: INQUIRY_TYPES[0] ?? '', email: '', message: '', hasAgreed: false };

function validate(form: InquiryForm): FormErrors {
  const errors: FormErrors = {};
  if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = '답변 받을 이메일을 정확히 적어 주세요.';
  }
  if (form.message.trim().length === 0) {
    errors.message = '문의 내용을 적어 주세요.';
  }
  if (!form.hasAgreed) {
    errors.hasAgreed = '이메일 수집에 동의해 주셔야 답변드릴 수 있어요.';
  }
  return errors;
}

function buildMailto(form: InquiryForm): string {
  const subject = `[Eveil 문의] ${form.type}`;
  const body = `문의 유형: ${form.type}\n답변 받을 이메일: ${form.email.trim()}\n\n${form.message.trim()}`;
  return `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const Section = styled.section`
  scroll-margin-top: 64px;
  background: ${colors.background};
`;

const Inner = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 48px;
  align-items: start;
  max-width: 1080px;
  margin: 0 auto;
  padding: 88px 24px;

  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 64px 16px;
  }
`;

const Intro = styled.div`
  display: flex;
  flex-direction: column;
`;

const Eyebrow = styled.span`
  color: ${colors.primary};
  font-size: 16px;
  font-weight: ${fonts.weight.bold};
  line-height: normal;
`;

const Title = styled.h2`
  margin-top: 15px;
  color: ${colors.heading};
  font-size: 34px;
  font-weight: ${fonts.weight.extrabold};
  line-height: 45.9px;
  letter-spacing: -1.02px;

  ${media.mobile} {
    font-size: 28px;
    line-height: 38px;
  }
`;

const Lead = styled.p`
  margin-top: 16px;
  color: ${colors.secondary};
  font-size: 16px;
  line-height: 28px;
`;

const Notice = styled.p`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-top: 16px;
  padding: 16px 18px;
  border-radius: 12px;
  background: ${colors.white};
  color: ${colors.secondary};
  font-size: 14px;
  line-height: 22.4px;

  svg {
    flex-shrink: 0;
  }
`;

const Card = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 32px;
  border-radius: 18px;
  background: ${colors.white};
  box-shadow: ${shadows.form};

  ${media.mobile} {
    padding: 24px 20px;
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.span`
  color: ${colors.heading};
  font-size: 14px;
  font-weight: ${fonts.weight.semibold};
  line-height: normal;
`;

const controlStyle = `
  width: 100%;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  background: ${colors.white};
  color: ${colors.heading};
  font-size: 16px;
  outline: none;

  &::placeholder {
    color: ${colors.placeholder};
  }

  &:focus {
    border-color: ${colors.primary};
  }

  &[aria-invalid='true'] {
    border-color: ${colors.danger};
  }
`;

const Select = styled.select`
  ${controlStyle};
  height: 48px;
  padding: 0 30px 0 18px;
`;

const Input = styled.input`
  ${controlStyle};
  height: 48px;
  padding: 0 14px;
`;

const Textarea = styled.textarea`
  ${controlStyle};
  min-height: 180px;
  padding: 12px 14px;
  line-height: 25.6px;
  resize: vertical;
`;

const Agreement = styled.label`
  display: flex;
  gap: 13px;
  align-items: center;
  padding: 3px 4px;
  color: ${colors.secondary};
  font-size: 14px;
  line-height: normal;
  cursor: pointer;

  input {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin: 0;
    border: 1px solid ${colors.checkboxBorder};
    border-radius: 2.5px;
    background: ${colors.white} center / 12px no-repeat;
    appearance: none;
    cursor: pointer;
  }

  input:checked {
    border-color: ${colors.primary};
    background-color: ${colors.primary};
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 6.2 5 8.6l4.5-5' fill='none' stroke='white' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  }

  input:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

const ErrorText = styled.span`
  color: ${colors.danger};
  font-size: 13px;
  line-height: normal;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 52px;
`;

export function ContactSection(): ReactNode {
  const [form, setForm] = useState<InquiryForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  const update = <Key extends keyof InquiryForm>(key: Key, value: InquiryForm[Key]): void => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (!INQUIRY_EMAIL) {
      setErrors({ form: '문의 메일 주소가 아직 설정되지 않았어요. 잠시 후 다시 시도해 주세요.' });
      return;
    }
    window.location.href = buildMailto(form);
  };

  return (
    <Section id="contact">
      <Inner>
        <Intro>
          <Eyebrow>1:1 INQUIRY</Eyebrow>
          <Title>원하는 답을 못 찾으셨나요?</Title>
          <Lead>문의를 남겨 주시면 영업일 기준 24시간 안에 이메일로 답변드려요.</Lead>
          <Notice>
            <ShieldCheck size={20} color={colors.primary} />
            문의 내용에 개인정보(주민번호, 카드번호 등)는 적지 말아 주세요.
          </Notice>
        </Intro>

        <Card noValidate onSubmit={handleSubmit}>
          <Field>
            <FieldLabel>문의 유형</FieldLabel>
            <Select value={form.type} onChange={(event) => update('type', event.target.value)}>
              {INQUIRY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            <FieldLabel>답변 받을 이메일</FieldLabel>
            <Input
              type="email"
              placeholder="example@mail.com"
              autoComplete="email"
              value={form.email}
              aria-invalid={Boolean(errors.email)}
              onChange={(event) => update('email', event.target.value)}
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </Field>

          <Field>
            <FieldLabel>문의 내용</FieldLabel>
            <Textarea
              placeholder="어떤 상황에서 문제가 생겼는지 알려 주세요."
              value={form.message}
              aria-invalid={Boolean(errors.message)}
              onChange={(event) => update('message', event.target.value)}
            />
            {errors.message && <ErrorText>{errors.message}</ErrorText>}
          </Field>

          <div>
            <Agreement>
              <input
                type="checkbox"
                checked={form.hasAgreed}
                onChange={(event) => update('hasAgreed', event.target.checked)}
              />
              답변을 위한 이메일 수집에 동의합니다.
            </Agreement>
            {errors.hasAgreed && <ErrorText>{errors.hasAgreed}</ErrorText>}
          </div>

          <SubmitButton type="submit" css={button.primaryLarge}>
            <PaperPlaneTilt size={18} color={colors.white} />
            문의 보내기
          </SubmitButton>
          {errors.form && <ErrorText role="alert">{errors.form}</ErrorText>}
        </Card>
      </Inner>
    </Section>
  );
}
