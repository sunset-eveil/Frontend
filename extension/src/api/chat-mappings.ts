import { decryptMappings, type ChatMapping, type EncryptedMappings } from '../mapping-crypto';
import { getClientCredentials } from '../registration';
import { getApiBaseUrl, getAuthHeaders } from './config';

export type { ChatMapping } from '../mapping-crypto';

const CACHE_TTL_MS = 60_000;
const mappingCache = new Map<string, {
  request: Promise<ChatMapping[]>;
  expiresAt?: number;
  timer?: ReturnType<typeof setTimeout>;
}>();

export function invalidateChatMappings(chatId: string): void {
  clearTimeout(mappingCache.get(chatId)?.timer);
  mappingCache.delete(chatId);
}

export function getCachedChatMappings(
  chatId: string,
  { refresh = false }: { refresh?: boolean } = {},
): Promise<ChatMapping[]> {
  const cached = mappingCache.get(chatId);
  if (cached && (cached.expiresAt === undefined || (!refresh && cached.expiresAt > Date.now()))) {
    return cached.request;
  }
  invalidateChatMappings(chatId);

  const entry: NonNullable<ReturnType<typeof mappingCache.get>> = {
    request: getChatMappings(chatId).then((mappings) => {
      if (mappingCache.get(chatId) !== entry) return getCachedChatMappings(chatId);
      if (mappings.length === 0) {
        invalidateChatMappings(chatId);
      } else {
        entry.expiresAt = Date.now() + CACHE_TTL_MS;
        entry.timer = setTimeout(() => invalidateChatMappings(chatId), CACHE_TTL_MS);
      }
      return mappings;
    }, (error: unknown) => {
      if (mappingCache.get(chatId) === entry) invalidateChatMappings(chatId);
      throw error;
    }),
  };
  mappingCache.set(chatId, entry);
  return entry.request;
}

export async function getChatMappings(chatId: string): Promise<ChatMapping[]> {
  const credentials = await getClientCredentials();
  const baseUrl = getApiBaseUrl();
  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/api/chats/${encodeURIComponent(chatId)}/mappings`,
      { headers: getAuthHeaders(credentials), cache: 'no-store' },
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
