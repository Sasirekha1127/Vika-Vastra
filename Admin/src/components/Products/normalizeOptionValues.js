// JSON columns can arrive as arrays or serialized JSON, depending on the API.
export default function normalizeOptionValues(value) {
  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return [];
    try {
      value = JSON.parse(text);
    } catch {
      value = text;
    }
  }

  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values
    .filter(item => typeof item === 'string' || (typeof item === 'number' && Number.isFinite(item)))
    .map(item => String(item).trim())
    .filter(Boolean))];
}
