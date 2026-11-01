import { getClientCredentials } from '../registration';

export type ChatMapping = {
  maskCode: string;
  type: string;
  value: string;
};

type EncryptedMappings = {
  wrappedAesKey: string;
  iv: string;
  ciphertext: string;
};

function decodeBase64(value: string): Uint8Array<ArrayBuffer> {
  const decoded = atob(value);
  const bytes = new Uint8Array(decoded.length);

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return bytes;
}

async function decryptMappings(
  encrypted: EncryptedMappings,
  kek: string,
): Promise<ChatMapping[]> {
  const iv = decodeBase64(encrypted.iv);

  if (iv.length !== 12) {
    throw new Error('매핑 복호화 IV의 길이가 올바르지 않습니다.');
  }

  try {
    const wrappingKey = await crypto.subtle.importKey(
      'raw',
      decodeBase64(kek),
      'AES-GCM',
      false,
      ['decrypt'],
    );
    const aesKeyBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      wrappingKey,
      decodeBase64(encrypted.wrappedAesKey),
    );

    if (aesKeyBytes.byteLength !== 32) {
      throw new Error();
    }
    const aesKey = await crypto.subtle.importKey(
      'raw',
      aesKeyBytes,
      'AES-GCM',
      false,
      ['decrypt'],
    );
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      aesKey,
      decodeBase64(encrypted.ciphertext),
    );
    const decoded: unknown = JSON.parse(new TextDecoder().decode(plaintext));

    if (!decoded || typeof decoded !== 'object' || !('mappings' in decoded)) {
      throw new Error();
    }

    const mappings = decoded.mappings;

    if (!Array.isArray(mappings) || !mappings.every((item: unknown) => (
      item !== null && typeof item === 'object' &&
      'maskCode' in item && typeof item.maskCode === 'string' &&
      'type' in item && typeof item.type === 'string' &&
      'value' in item && typeof item.value === 'string'
    ))) {
      throw new Error();
    }

    return mappings as ChatMapping[];
  } catch {
    throw new Error('대화 매핑을 복호화하지 못했습니다.');
  }
}

export async function getChatMappings(chatId: string): Promise<ChatMapping[]> {
  const { clientId, authKey, kek } = await getClientCredentials();
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_MASKING_API_BASE_URL)?.replace(/\/$/, '');

  if (!baseUrl) {
    throw new Error('API 서버 주소가 설정되지 않았습니다.');
  }

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/api/chats/${encodeURIComponent(chatId)}/mappings`,
      {
        headers: {
          'X-Client-Id': clientId,
          'X-Auth-Key': authKey,
        },
      },
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

  return decryptMappings(await response.json() as EncryptedMappings, kek);
}
