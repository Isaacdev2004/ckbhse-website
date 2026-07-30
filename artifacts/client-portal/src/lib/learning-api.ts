function readCsrfToken(): string | undefined {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export async function learningFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  const csrf = readCsrfToken();
  if (csrf !== undefined && init.method !== undefined && init.method !== 'GET') {
    headers.set('x-csrf-token', csrf);
  }

  const response = await fetch(`/api/v1/learning${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
