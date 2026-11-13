import normalizeOptionValues from './normalizeOptionValues';

test.each([
  [['Red', 'Blue'], ['Red', 'Blue']],
  ['["Red","Blue"]', ['Red', 'Blue']],
  ['[2,4,0]', ['2', '4', '0']],
  ['Red', ['Red']],
  ['"Small"', ['Small']],
  [0, ['0']],
  [null, []],
  [undefined, []],
  ['', []],
  ['null', []],
  ['[]', []],
  [{ unexpected: 'value' }, []],
  ['{"unexpected":"value"}', []],
  [[null, {}, ['nested'], false, ' Red ', 'Red', '', 0], ['Red', '0']],
])('normalizes stored option values %p into %p', (stored, expected) => {
  expect(normalizeOptionValues(stored)).toEqual(expected);
});
