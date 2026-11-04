import { getApiBaseUrl } from './config';

type RegisterClientRequest = {
  clientId: string;
  authKey: string;
  kek: string;
};

export async function registerClient(body: RegisterClientRequest): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.status === 201 || response.status === 409) {
    return;
  }

  if (response.status === 400) {
    throw new Error('등록 요청 형식이 올바르지 않습니다.');
  }

  throw new Error('클라이언트 등록에 실패했습니다. 다시 시도해 주세요.');
}
