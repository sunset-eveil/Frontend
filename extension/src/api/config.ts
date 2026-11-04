type ClientCredentials = {
  clientId: string;
  authKey: string;
  kek: string;
};

export function getApiBaseUrl(): string {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() ||
    import.meta.env.VITE_MASKING_API_BASE_URL?.trim())?.replace(/\/+$/, '');

  if (!baseUrl) {
    throw new Error('API 서버 주소가 설정되지 않았습니다.');
  }

  return baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
}

export function getAuthHeaders(
  { clientId, authKey, kek }: ClientCredentials,
  includeKek = false,
): Record<string, string> {
  return {
    'X-Client-Id': clientId,
    'X-Auth-Key': authKey,
    ...(includeKek ? { 'X-Kek': kek } : {}),
  };
}
