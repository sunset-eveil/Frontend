import { decryptMappings, type ChatMapping, type EncryptedMappings } from '../mapping-crypto';
import { getClientCredentials } from '../registration';
import { getApiBaseUrl, getAuthHeaders } from './config';

export type { ChatMapping } from '../mapping-crypto';

export async function getChatMappings(chatId: string): Promise<ChatMapping[]> {
  const credentials = await getClientCredentials();
  const baseUrl = getApiBaseUrl();
  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/api/chats/${encodeURIComponent(chatId)}/mappings`,
      { headers: getAuthHeaders(credentials) },
    );
  } catch {
    throw new Error('매핑 API에 연결할 수 없습니다.');
  }

  if (response.status === 404) {
    return [];
  }

  if (response.status === 401) {
    throw new Error('클라이언트 인증에 실패했습니다.');
  }

  if (!response.ok) {
    throw new Error(`매핑 조회에 실패했습니다. (HTTP ${response.status})`);
  }

  return decryptMappings(await response.json() as EncryptedMappings, credentials.kek);
}
