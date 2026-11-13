export async function uploadBulkProducts(template, entries, url, onProgress, request = fetch) {
  let next = 0;
  let completed = 0;
  const results = new Array(entries.length);
  await Promise.all(Array.from({ length: Math.min(3, entries.length) }, async () => {
    while (next < entries.length) {
      const index = next++;
      const entry = entries[index];
      const data = new FormData();
      for (const [key, value] of template.entries()) data.append(key, value);
      const sku = `${String(data.get('sku')).trim().slice(0, 35)}-${entry.suffix}`.toUpperCase();
      data.set('sku', sku);
      data.set('image', entry.file);
      const payload = JSON.parse(data.get('initialVariant'));
      payload.sku = sku;
      payload.variants = (Array.isArray(payload.variants) ? payload.variants : []).map((variant, i) => ({
        ...variant,
        sku: `${sku.slice(0, 58)}-${i + 1}`,
        attributes: variant.attributes && typeof variant.attributes === 'object' && !Array.isArray(variant.attributes)
          ? variant.attributes
          : { Default: 'Standard' },
      }));
      data.set('initialVariant', JSON.stringify(payload));
      try {
        const response = await request(url, { method: 'POST', body: data });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Upload failed');
        results[index] = { entry, success: true };
      } catch (error) {
        results[index] = { entry, success: false, error: error.message };
      }
      onProgress(++completed);
    }
  }));
  return results;
}
