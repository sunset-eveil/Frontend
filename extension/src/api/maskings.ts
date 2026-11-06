import type { MaskTypeId } from '../masking';
import { getClientCredentials, rejectChatCredentials } from '../registration';
import { getApiBaseUrl, getAuthHeaders } from './config';
import { invalidateChatMappings } from './chat-mappings';

type MaskingRequest = {
  text: string;
  excludeTypes?: string[];
};

type ApiErrorBody = {
  message?: string;
};

const TYPE_CODES: Record<MaskTypeId, string> = {
  name: 'NAME',
  phone: 'PHONE',
  email: 'EMAIL',
  resident: 'RRN',
  payment: 'CARD_ACCOUNT',
  address: 'ADDRESS',
  amount: 'AMOUNT',
  custom: 'ETC',
};

export function getMaskingTypeCode(type: MaskTypeId): string {
  return TYPE_CODES[type];
}

async function request(
  chatId: string,
  method: 'POST' | 'PUT' | 'DELETE',
  resource: string,
  body?: unknown,
): Promise<void> {
  const credentials = await getClientCredentials(chatId);
  const baseUrl = getApiBaseUrl();

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/api/chats/${encodeURIComponent(chatId)}/${resource}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(credentials, true),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
  } catch {
    throw new Error('마스킹 API에 연결할 수 없습니다. API 주소와 서버 상태를 확인해 주세요.');
  }

  if (response.status !== 204) {
    if (response.status === 401) await rejectChatCredentials(chatId, credentials.authKey);
    throw new Error(await readError(response));
  }
  invalidateChatMappings(chatId);
}

async function readError(response: Response): Promise<string> {
  let body: ApiErrorBody = {};

  try {
    body = await response.json() as ApiErrorBody;
  } catch {
    // An error response may not contain JSON.
  }

  if (response.status === 400) {
    return body.message ?? '요청 값이 올바르지 않습니다.';
  }

  if (response.status === 401) {
    return body.message ?? '클라이언트 인증에 실패했습니다.';
  }

  if (response.status === 403) {
    return body.message ?? '매핑 정보를 열 수 없습니다.';
  }

  return body.message ?? `마스킹 API 요청에 실패했습니다. (HTTP ${response.status})`;
}

export async function createMasking(
  chatId: string,
  text: string,
  enabledTypes: MaskTypeId[],
): Promise<void> {
  const excludedTypes = (Object.keys(TYPE_CODES) as MaskTypeId[])
    .filter((type) => !enabledTypes.includes(type))
    .map((type) => TYPE_CODES[type]);
  const body: MaskingRequest = {
    text,
    ...(excludedTypes.length > 0 ? { excludeTypes: excludedTypes } : {}),
  };

  await request(chatId, 'POST', 'maskings', body);
}

export async function putMapping(
  chatId: string,
  value: string,
  type: MaskTypeId,
): Promise<void> {
  await request(chatId, 'PUT', 'mappings', {
    value: value.trim(),
    type: TYPE_CODES[type],
  });
}

export async function deleteMapping(chatId: string, maskCode: string): Promise<void> {
  await request(chatId, 'DELETE', `mappings/${encodeURIComponent(maskCode)}`);
}
