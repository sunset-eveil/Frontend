export type ChatMapping = {
  maskCode: string;
  type: string;
  value: string;
};

export type EncryptedMappings = {
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

export async function decryptMappings(
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
      'AES-KW',
      false,
      ['unwrapKey'],
    );
    const aesKey = await crypto.subtle.unwrapKey(
      'raw',
      decodeBase64(encrypted.wrappedAesKey),
      wrappingKey,
      'AES-KW',
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    );

    if (!('length' in aesKey.algorithm) || aesKey.algorithm.length !== 256) {
      throw new Error();
    }
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
