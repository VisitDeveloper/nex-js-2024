/**
 * Delay before a confirmed delete is sent to the API. User can undo until then.
 * Set `NEXT_PUBLIC_DELETE_UNDO_SECONDS` in env (client bundle; must be NEXT_PUBLIC_*).
 */
export function getDeleteUndoSeconds(): number {
  const raw = process.env.NEXT_PUBLIC_DELETE_UNDO_SECONDS;
  const n = raw != null && String(raw).trim() !== "" ? Number(raw) : 10;
  if (!Number.isFinite(n)) return 10;
  const i = Math.floor(n);
  if (i < 1) return 1;
  if (i > 300) return 300;
  return i;
}
