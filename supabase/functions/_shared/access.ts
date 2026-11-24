export function bearerToken(header: string | null): string | null {
  const match = header?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}
export function isServiceAuthorized(header: string | null, serviceKey: string | undefined): boolean {
  const token = bearerToken(header);
  if (!token || !serviceKey || token.length !== serviceKey.length) return false;
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) mismatch |= token.charCodeAt(i) ^ serviceKey.charCodeAt(i);
  return mismatch === 0;
}
export async function isUserAuthorized(header: string | null, verify: (token: string) => Promise<boolean>): Promise<boolean> {
  const token = bearerToken(header);
  if (!token) return false;
  try { return await verify(token); } catch { return false; }
}
