import { getApiBaseUrl, getAuthHeaders, isMappingNotFound } from './config';

type RegisterClientRequest = {
  clientId: string;
  authKey: string;
  kek: string;
};

export class ClientVerificationError extends Error {}

export async function registerClient(body: RegisterClientRequest): Promise<'created' | 'existing'> {
  const response = await fetch(`${getApiBaseUrl()}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (response.status === 201) return 'created';
  if (response.status === 409) return 'existing';

  if (response.status === 400) {
    throw new Error('등록 요청 형식이 올바르지 않습니다.');
  }

  throw new Error('클라이언트 등록에 실패했습니다. 다시 시도해 주세요.');
}

export async function verifyClient(chatId: string, credentials: RegisterClientRequest): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/chats/${encodeURIComponent(chatId)}/mappings`, {
    headers: getAuthHeaders(credentials),
    cache: 'no-store',
  });
  // An authenticated chat without saved mappings returns 404.
  if (response.ok || await isMappingNotFound(response)) return;
  if (response.status === 401) {
    throw new ClientVerificationError('패스프레이즈가 일치하지 않거나 서버에 등록된 클라이언트가 없어요.');
  }
  throw new Error(`클라이언트 인증을 확인하지 못했어요. (HTTP ${response.status})`);
}
