export function createServiceFetch(
  baseUrl: string,
  getAuthorization: () => string | undefined,
): (path: string, init?: RequestInit) => Promise<Response> {
  const origin = baseUrl.replace(/\/$/, '');
  return async (path: string, init: RequestInit = {}) => {
    const url = `${origin}${path.startsWith('/') ? path : `/${path}`}`;
    const headers = new Headers(init.headers);
    const auth = getAuthorization();
    if (auth) headers.set('Authorization', auth);
    if (
      init.body != null &&
      typeof init.body === 'string' &&
      !headers.has('Content-Type')
    ) {
      headers.set('Content-Type', 'application/json');
    }
    return fetch(url, { ...init, headers });
  };
}
