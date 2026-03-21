import { GraphQLError } from 'graphql';

export async function assertOk(
  res: Response,
  label: string,
): Promise<void> {
  if (res.ok) return;
  let detail = res.statusText;
  try {
    const body = await res.text();
    if (body) detail = body;
  } catch {
    /* ignore */
  }
  throw new GraphQLError(`${label}: ${res.status} ${detail}`, {
    extensions: { code: 'UPSTREAM_HTTP_ERROR', status: res.status },
  });
}
