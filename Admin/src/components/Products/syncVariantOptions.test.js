import syncVariantOptions from './syncVariantOptions';

const options = [{ name: 'Color', values: ['blue', 'pink', 'red'] }, { name: 'Size', values: ['small', 'medium', 'large'] }];

test('removes stale red while preserving sizes used by other colors', () => {
  const rows = [
    { attributes: { color: 'blue', size: 'small' } },
    { attributes: { Color: 'Blue', Size: 'Medium' } },
    { attributes: { color: 'blue', size: 'large' } },
    { attributes: { color: 'pink', size: 'small' } },
  ];
  expect(syncVariantOptions(options, rows)).toEqual([
    { name: 'Color', values: ['blue', 'pink'] },
    { name: 'Size', values: ['small', 'medium', 'large'] },
  ]);
  expect(options[0].values).toContain('red');
});

test('retains red until the last red variant is removed', () => {
  expect(syncVariantOptions(options, [{ attributes: { color: 'red', size: 'small' } }])[0].values).toEqual(['red']);
  expect(syncVariantOptions(options, []).every(option => option.values.length === 0)).toBe(true);
});
