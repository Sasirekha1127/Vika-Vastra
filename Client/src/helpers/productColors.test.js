import { getProductColors, matchesColors } from './productColors';

test('uses active variants and normalizes mixed casing and serialized attributes', () => {
  expect(getProductColors({ colors: '["red"]', Variants: [
    { attributes: { Color: ' Blue ' } },
    { attributes: '{"color":"blue"}' },
    { attributes: { color: 'pink' } },
    { attributes: { color: 'red' }, isActive: false },
    { attributes: 'invalid' },
  ] })).toEqual(['blue', 'pink']);
});

test('supports legacy color lists but does not restore inactive variant colors', () => {
  expect(getProductColors({ colors: '["RED","red","Blue"]' })).toEqual(['red', 'blue']);
  expect(getProductColors({ colors: ['red'], Variants: [{ isActive: false, attributes: { color: 'red' } }] })).toEqual([]);
  expect(getProductColors({ colors: null })).toEqual([]);
});

test('matches any selected color and restores every product when cleared', () => {
  const products = [{ colors: ['blue'] }, { colors: ['pink'] }, { colors: [] }];
  expect(products.filter(product => matchesColors(product, ['blue']))).toEqual([products[0]]);
  expect(products.filter(product => matchesColors(product, ['blue', 'pink']))).toHaveLength(2);
  expect(products.filter(product => matchesColors(product, []))).toHaveLength(3);
});
