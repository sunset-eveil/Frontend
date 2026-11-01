export type RegistrationMode = 'register' | 'unlock' | 'ready' | 'error';

type RegistrationData = {
  clientId?: string;
  salt?: string;
  isRegistered?: boolean;
};

export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationError';
  }
}

const LOCAL_KEY = 'eveilRegistration';
const KEK_SESSION_KEY = 'eveilKek';
const AUTH_SESSION_KEY = 'eveilAuthKey';
const ENCODER = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const decoded = atob(value);
  const bytes = new Uint8Array(decoded.length);

  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }

  return bytes;
}

async function getLocalData(): Promise<RegistrationData> {
  const stored = await chrome.storage.local.get(LOCAL_KEY);
  return stored[LOCAL_KEY] ?? {};
}

export async function getRegistrationMode(): Promise<RegistrationMode> {
  const data = await getLocalData();

  if (!data.isRegistered) {
    return 'register';
  }

  const session = await chrome.storage.session.get([KEK_SESSION_KEY, AUTH_SESSION_KEY]);
  return session[KEK_SESSION_KEY] && session[AUTH_SESSION_KEY] ? 'ready' : 'unlock';
}

async function deriveKeys(
  passphrase: string,
  salt: string,
): Promise<{ kek: string; authKey: string }> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    ENCODER.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const masterBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64(salt), iterations: 600_000 },
    passwordKey,
    256,
  );
  const masterKey = await crypto.subtle.importKey(
    'raw',
    masterBits,
    'HKDF',
    false,
    ['deriveBits'],
  );
  const derive = async (info: string): Promise<string> => {
    const bits = await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(), info: ENCODER.encode(info) },
      masterKey,
      256,
    );

    return toBase64(new Uint8Array(bits));
  };

  return {
    kek: await derive('eveil-enc-v1'),
    authKey: await derive('eveil-auth-v1'),
  };
}

export async function submitPassphrase(
  passphrase: string,
  mode: 'register' | 'unlock',
): Promise<void> {
  if (!passphrase.trim()) {
    throw new RegistrationError('패스프레이즈를 입력해 주세요.');
  }

  const stored = await getLocalData();

  if (mode === 'unlock') {
    if (!stored.salt || !stored.isRegistered) {
      throw new RegistrationError('등록 정보를 찾을 수 없습니다.');
    }

    const { kek, authKey } = await deriveKeys(passphrase, stored.salt);
    await chrome.storage.session.set({
      [KEK_SESSION_KEY]: kek,
      [AUTH_SESSION_KEY]: authKey,
    });
    return;
  }

  const data: RegistrationData = {
    clientId: stored.clientId ?? crypto.randomUUID(),
    salt: stored.salt ?? toBase64(crypto.getRandomValues(new Uint8Array(16))),
    isRegistered: false,
  };
  await chrome.storage.local.set({ [LOCAL_KEY]: data });

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

  if (!baseUrl) {
    throw new RegistrationError('API 서버 주소가 설정되지 않았습니다.');
  }

  const { kek, authKey } = await deriveKeys(passphrase, data.salt!);
  await chrome.storage.session.set({
    [KEK_SESSION_KEY]: kek,
    [AUTH_SESSION_KEY]: authKey,
  });
  const response = await fetch(`${baseUrl}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: data.clientId, authKey, kek }),
  });

  if (response.status === 201 || response.status === 409) {
    await chrome.storage.local.set({ [LOCAL_KEY]: { ...data, isRegistered: true } });
    return;
  }

  if (response.status === 400) {
    throw new RegistrationError('등록 요청 형식이 올바르지 않습니다.');
  }

  throw new RegistrationError('클라이언트 등록에 실패했습니다. 다시 시도해 주세요.');
}
