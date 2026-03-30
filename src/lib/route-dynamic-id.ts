/**
 * Next.js 15+ may pass `params` as a Promise; Next 14 uses a plain object.
 * Using `await Promise.resolve(params)` supports both.
 */
export async function numericEntryIdFromParams(
  params: { id: string } | Promise<{ id: string }>
): Promise<string | null> {
  const p = await Promise.resolve(params);
  const id = p?.id?.trim();
  if (!id || !/^\d+$/.test(id)) return null;
  return id;
}
