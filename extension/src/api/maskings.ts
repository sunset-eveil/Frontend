import type { MaskTypeId } from "../masking";

type MaskingRequest = {
  text: string;
  excludeTypes?: string[];
};

type ApiErrorBody = {
  message?: string;
};

const TYPE_CODES: Record<MaskTypeId, string> = {
  name: "NAME",
  phone: "PHONE",
  email: "EMAIL",
  resident: "RESIDENT",
  payment: "PAYMENT",
  address: "ADDRESS",
  amount: "AMOUNT",
  custom: "CUSTOM",
};

function requiredSetting(name: string, value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`${name} 설정이 없습니다. .env 파일을 확인해 주세요.`);
  }
  return normalized;
}

function validateBase64(name: string, value: string, expectedBytes?: number) {
  let decoded: string;
  try {
    decoded = atob(value);
  } catch {
    throw new Error(`${name} 값은 Base64 형식이어야 합니다.`);
  }
  if (expectedBytes !== undefined && decoded.length !== expectedBytes) {
    throw new Error(
      `${name} 값은 디코딩 후 ${expectedBytes}바이트여야 합니다.`,
    );
  }
}

function getSessionChatId() {
  const key = "eveil-maskings-chat-id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;

  const id = crypto.randomUUID();
  sessionStorage.setItem(key, id);
  return id;
}

function getApiConfig() {
  const clientId = requiredSetting(
    "VITE_MASKING_CLIENT_ID",
    import.meta.env.VITE_MASKING_CLIENT_ID,
  );
  const authKey = requiredSetting(
    "VITE_MASKING_AUTH_KEY",
    import.meta.env.VITE_MASKING_AUTH_KEY,
  );
  const kek = requiredSetting(
    "VITE_MASKING_KEK",
    import.meta.env.VITE_MASKING_KEK,
  );
  const configuredBaseUrl = requiredSetting(
    "VITE_MASKING_API_BASE_URL",
    import.meta.env.VITE_MASKING_API_BASE_URL,
  );
  validateBase64("VITE_MASKING_AUTH_KEY", authKey);
  validateBase64("VITE_MASKING_KEK", kek, 32);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      clientId,
    )
  ) {
    throw new Error(
      "VITE_MASKING_CLIENT_ID는 등록된 클라이언트 UUID여야 합니다.",
    );
  }

  let baseUrl: string;
  try {
    const parsedUrl = new URL(configuredBaseUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:")
      throw new Error();
    baseUrl = configuredBaseUrl.replace(/\/$/, "");
  } catch {
    throw new Error(
      "VITE_MASKING_API_BASE_URL에 유효한 HTTP 또는 HTTPS 주소를 설정해 주세요.",
    );
  }

  return {
    baseUrl,
    chatId: getSessionChatId(),
    headers: {
      "Content-Type": "application/json",
      "X-Client-Id": clientId,
      "X-Auth-Key": authKey,
      "X-Kek": kek,
    },
  };
}

async function request(method: "POST" | "PUT" | "DELETE", resource: string, body?: unknown) {
  const { baseUrl, chatId, headers } = getApiConfig();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/chats/${encodeURIComponent(chatId)}/${resource}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "마스킹 API에 연결할 수 없습니다. API 주소와 서버 상태를 확인해 주세요.",
    );
  }

  if (response.status !== 204) {
    throw new Error(await readError(response));
  }
}

async function readError(response: Response) {
  let body: ApiErrorBody = {};
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // Some gateways return an empty or non-JSON error response.
  }

  if (response.status === 400)
    return (
      body.message ??
      "요청 값이 올바르지 않습니다. 제외 유형 설정을 확인해 주세요."
    );
  if (response.status === 401)
    return (
      body.message ??
      "클라이언트 인증에 실패했습니다. API 인증 설정을 확인해 주세요."
    );
  if (response.status === 403)
    return (
      body.message ?? "매핑 정보를 열 수 없습니다. X-Kek 설정을 확인해 주세요."
    );
  return (
    body.message ?? `마스킹 API 요청에 실패했습니다. (HTTP ${response.status})`
  );
}

export async function createMasking(text: string, enabledTypes: MaskTypeId[]) {
  const excludedTypes = (Object.keys(TYPE_CODES) as MaskTypeId[])
    .filter((type) => !enabledTypes.includes(type))
    .map((type) => TYPE_CODES[type]);
  const body: MaskingRequest = {
    text,
    ...(excludedTypes.length > 0 ? { excludeTypes: excludedTypes } : {}),
  };

  await request("POST", "maskings", body);
}

export async function putMapping(value: string, type: MaskTypeId) {
  await request("PUT", "mappings", {
    value: value.trim(),
    type: TYPE_CODES[type],
  });
}

export function getMaskCode(type: MaskTypeId, sequence: number) {
  return `${TYPE_CODES[type]}${sequence}`;
}

export async function deleteMapping(maskCode: string) {
  await request("DELETE", `mappings/${encodeURIComponent(maskCode)}`);
}
