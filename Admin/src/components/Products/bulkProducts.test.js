import { uploadBulkProducts } from './bulkProducts';

const template = () => {
  const data = new FormData();
  data.set('sku', 'SAREE');
  data.set('productName', 'Shared name');
  data.set('shortDescription', 'Shared description');
  data.set('initialVariant', JSON.stringify({ variants: [{ sku: 'OLD', attributes: { color: 'blue' } }] }));
  return data;
};

test('ten images create ten products with shared details, distinct images and unique SKUs', async () => {
  const entries = Array.from({ length: 10 }, (_, index) => ({ suffix: `batch-${index}`, file: new File(['image'], `${index}.png`, { type: 'image/png' }) }));
  const request = jest.fn(async () => ({ ok: true, json: async () => ({ success: true }) }));
  const progress = jest.fn();
  const results = await uploadBulkProducts(template(), entries, '/products/add', progress, request);
  expect(results.filter(result => result.success)).toHaveLength(10);
  expect(new Set(request.mock.calls.map(([, options]) => options.body.get('sku'))).size).toBe(10);
  request.mock.calls.forEach(([, { body }], index) => {
    expect(body.get('productName')).toBe('Shared name');
    expect(body.get('shortDescription')).toBe('Shared description');
    expect(body.get('image').name).toBe(`${index}.png`);
    expect(JSON.parse(body.get('initialVariant')).variants[0].sku).not.toBe('OLD');
    expect(JSON.parse(body.get('initialVariant')).variants[0].attributes).toEqual({ color: 'blue' });
  });
  expect(progress).toHaveBeenLastCalledWith(10);
});

test('reports individual failures without losing successful uploads', async () => {
  const entries = [0, 1].map(index => ({ suffix: `${index}`, file: new File([''], `${index}.png`) }));
  const request = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({}) }).mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'SKU conflict' }) });
  const results = await uploadBulkProducts(template(), entries, '/products/add', () => {}, request);
  expect(results[0].success).toBe(true);
  expect(results[1]).toEqual({ entry: entries[1], success: false, error: 'SKU conflict' });
});
