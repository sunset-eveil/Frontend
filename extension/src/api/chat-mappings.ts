import { decryptMappings, type ChatMapping, type EncryptedMappings } from '../mapping-crypto';
import { getClientCredentials, rejectChatCredentials } from '../registration';
import { getApiBaseUrl, getAuthHeaders, isMappingNotFound } from './config';

export type { ChatMapping } from '../mapping-crypto';

const CACHE_TTL_MS = 60_000;
type CacheEntry = {
  request?: Promise<ChatMapping[]>;
  snapshot?: { mappings: ChatMapping[]; expiresAt: number };
  timer?: ReturnType<typeof setTimeout>;
};
const mappingCache = new Map<string, CacheEntry>();
class TemporaryMappingError extends Error {}

function readSnapshot(entry: CacheEntry | undefined): ChatMapping[] | undefined {
  return entry?.snapshot && entry.snapshot.expiresAt > Date.now() ? entry.snapshot.mappings : undefined;
}

export function invalidateChatMappings(chatId: string): void {
  clearTimeout(mappingCache.get(chatId)?.timer);
  mappingCache.delete(chatId);
}

export function getCachedChatMappings(
  chatId: string,
  { refresh = false }: { refresh?: boolean } = {},
): Promise<ChatMapping[]> {
  const entry = mappingCache.get(chatId) ?? {};
  if (entry.request) return entry.request;
  const cached = readSnapshot(entry);
  if (!refresh && cached) return Promise.resolve(cached);

  entry.request = getChatMappings(chatId).then((mappings) => {
    if (mappingCache.get(chatId) !== entry) return getCachedChatMappings(chatId);
    entry.request = undefined;
    clearTimeout(entry.timer);
    if (mappings.length === 0) {
      invalidateChatMappings(chatId);
    } else {
      entry.snapshot = { mappings, expiresAt: Date.now() + CACHE_TTL_MS };
      entry.timer = setTimeout(() => {
        entry.snapshot = undefined;
        if (!entry.request && mappingCache.get(chatId) === entry) mappingCache.delete(chatId);
      }, CACHE_TTL_MS);
    }
    return mappings;
  }, (error: unknown) => {
    if (mappingCache.get(chatId) === entry) {
      entry.request = undefined;
      if (!(error instanceof TemporaryMappingError) || !readSnapshot(entry)) invalidateChatMappings(chatId);
    }
    throw error;
  });
  mappingCache.set(chatId, entry);
  return entry.request;
}

export async function getRestoreChatMappings(chatId: string): Promise<{ mappings: ChatMapping[]; fromCache: boolean }> {
  try {
    return { mappings: await getCachedChatMappings(chatId, { refresh: true }), fromCache: false };
  } catch (error) {
    const cached = readSnapshot(mappingCache.get(chatId));
    if (error instanceof TemporaryMappingError && cached) return { mappings: cached, fromCache: true };
    throw error;
  }
}

export async function getChatMappings(chatId: string): Promise<ChatMapping[]> {
  const credentials = await getClientCredentials(chatId);
  const baseUrl = getApiBaseUrl();
  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/api/chats/${encodeURIComponent(chatId)}/mappings`,
      { headers: getAuthHeaders(credentials), cache: 'no-store' },
    );
  } catch {
    throw new TemporaryMappingError('매핑 API에 연결할 수 없습니다.');
  }

  if (response.status === 404) {
    if (await isMappingNotFound(response)) {
      console.info('[Eveil] 저장된 매핑 없음', { clientId: credentials.clientId, chatId });
      return [];
    }
    throw new Error('복원 API 경로를 찾지 못했습니다. 서버 주소를 확인해 주세요. (HTTP 404)');
  }

  if (response.status === 401) {
    await rejectChatCredentials(chatId, credentials.authKey);
    throw new Error('이 대화의 클라이언트 인증에 실패했습니다. (HTTP 401)');
  }

  if (response.status === 429 || response.status >= 500) {
    throw new TemporaryMappingError(`매핑 조회에 실패했습니다. (HTTP ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(`매핑 조회에 실패했습니다. (HTTP ${response.status})`);
  }

  return decryptMappings(await response.json() as EncryptedMappings, credentials.kek);
}
