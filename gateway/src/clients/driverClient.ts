import { assertOk } from '../http/graphqlHttpError.js';
import { mapDriverFromApi } from '../mappers/driver.js';

export function createDriverClient(
  fetchSvc: (path: string, init?: RequestInit) => Promise<Response>,
) {
  return {
    async getDriver(id: string) {
      const res = await fetchSvc(`/drivers/${encodeURIComponent(id)}`);
      if (res.status === 404) return null;
      await assertOk(res, 'GET /drivers/:id');
      return mapDriverFromApi((await res.json()) as Record<string, unknown>);
    },
  };
}
