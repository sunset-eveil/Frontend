import { registerClient, verifyClient } from './api/clients';
import { LEGACY_CHAT_IDS_KEY } from './chat-id';

export type RegistrationMode = 'register' | 'unlock' | 'ready' | 'error';

type RegistrationData = {
  clientId?: string;
  salt?: string;
  isRegistered?: boolean;
};
type ChatCredentials = { clientId: string; authKey: string; kek: string };

export class RegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegistrationError';
  }
}

const LOCAL_KEY = 'eveilRegistration';
const chatRegistrationKey = (chatId: string): string => `${LOCAL_KEY}:${chatId}`;
const chatSessionKey = (chatId: string): string => `eveilCredentials:${chatId}`;
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

async function getLocalData(chatId: string): Promise<RegistrationData> {
  const key = chatRegistrationKey(chatId);
  const stored = await chrome.storage.local.get([key, LOCAL_KEY, LEGACY_CHAT_IDS_KEY]);
  const registration = stored[key] as RegistrationData | undefined;
  const legacy = stored[LOCAL_KEY] as RegistrationData | undefined;
  const legacyChatIds = stored[LEGACY_CHAT_IDS_KEY] as string[] | undefined;
  if (registration) return registration;
  if (legacyChatIds?.includes(chatId) && legacy?.isRegistered) {
    return legacy;
  }
  return {};
}

export async function getClientCredentials(chatId: string): Promise<ChatCredentials> {
  const data = await getLocalData(chatId);
  const key = chatSessionKey(chatId);
  const session = (await chrome.storage.session.get(key))[key] as ChatCredentials | undefined;

  if (
    !data.isRegistered || !data.clientId ||
    session?.clientId !== data.clientId ||
    typeof session.authKey !== 'string' || typeof session.kek !== 'string'
  ) {
    throw new RegistrationError('클라이언트 등록 또는 잠금 해제가 필요합니다.');
  }

  return { clientId: data.clientId, authKey: session.authKey, kek: session.kek };
}

export async function getRegistrationMode(chatId: string): Promise<RegistrationMode> {
  const data = await getLocalData(chatId);

  if (!data.isRegistered) {
    return 'register';
  }

  try {
    await getClientCredentials(chatId);
    return 'ready';
  } catch (error) {
    if (error instanceof RegistrationError) return 'unlock';
    throw error;
  }
}

export function onChatCredentialsChanged(chatId: string, callback: () => void): () => void {
  const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string): void => {
    if (area === 'session' && chatSessionKey(chatId) in changes) callback();
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

export async function rejectChatCredentials(chatId: string, authKey: string): Promise<void> {
  await navigator.locks.request(chatRegistrationKey(chatId), async () => {
    const key = chatSessionKey(chatId);
    const stored = await chrome.storage.session.get(key);
    const credentials = stored[key] as ChatCredentials | undefined;
    if (credentials?.authKey === authKey) await chrome.storage.session.remove(key);
  });
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
  chatId: string,
  passphrase: string,
  mode: 'register' | 'unlock',
): Promise<void> {
  if (!passphrase.trim()) {
    throw new RegistrationError('패스프레이즈를 입력해 주세요.');
  }

  await navigator.locks.request(chatRegistrationKey(chatId), async () => {
    const stored = await getLocalData(chatId);
    if ((mode === 'unlock' || stored.isRegistered) && (!stored.salt || !stored.clientId || !stored.isRegistered)) {
      throw new RegistrationError('등록 정보를 찾을 수 없습니다.');
    }

    const clientId = stored.clientId ?? crypto.randomUUID();
    const salt = stored.salt ?? toBase64(crypto.getRandomValues(new Uint8Array(16)));
    const localKey = chatRegistrationKey(chatId);
    if (!stored.isRegistered) {
      await chrome.storage.local.set({ [localKey]: { clientId, salt, isRegistered: false } });
    }

    const credentials = { clientId, ...await deriveKeys(passphrase, salt) };
    if (stored.isRegistered || await registerClient(credentials) === 'existing') {
      await verifyClient(chatId, credentials);
    }
    await chrome.storage.local.set({ [localKey]: { clientId, salt, isRegistered: true } });
    await chrome.storage.session.set({ [chatSessionKey(chatId)]: credentials });
  });
}
