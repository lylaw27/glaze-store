// Shared utilities for Convex functions (not Convex functions themselves).

/**
 * Guards write/admin mutations. Mirrors the old protection where Supabase writes were
 * only possible with the server-only service-role key: only callers that know
 * ADMIN_WRITE_SECRET (set via `npx convex env set ADMIN_WRITE_SECRET ...`) may write.
 * The Next.js server actions / route handlers pass it from process.env.
 */
export function assertAdmin(secret: string): void {
  const expected = process.env.ADMIN_WRITE_SECRET;
  if (!expected || secret !== expected) {
    throw new Error("Unauthorized: invalid admin secret");
  }
}

/** Convert a stored millisecond timestamp to an ISO string (matches the old JSON shape). */
export const toIso = (ms: number): string => new Date(ms).toISOString();
