import { driverStatusToGraphql } from './enums.js';

export function mapDriverFromApi(d: Record<string, unknown>) {
  return {
    ...d,
    status: driverStatusToGraphql(String(d.status ?? '')),
  };
}
