const test = require('node:test');
const assert = require('node:assert');
const { calculateTotals } = require('../src/calc');

test('returns zero for no items', () => {
  const result = calculateTotals({});
  assert.strictEqual(result.total, 0);
  assert.deepStrictEqual(result.subtotals, []);
});

test('calculates totals for multiple items', () => {
  const result = calculateTotals({ thit: 2, banhMiMat: 1, nemNuong: 3 });
  assert.strictEqual(result.total, 49000);
  assert.deepStrictEqual(result.subtotals, [
    { label: 'Thịt', value: 22000 },
    { label: 'Bánh mì mật', value: 6000 },
    { label: 'Nem nướng', value: 21000 }
  ]);
});

test('handles banh mi thit with extra meat', () => {
  const result = calculateTotals({ banhMiThit: 2, soThitBanhMi: 3 });
  assert.strictEqual(result.total, 50000);
  assert.deepStrictEqual(result.subtotals, [
    { label: 'Bánh mì kẹp thịt (3 thịt/bánh)', value: 50000 }
  ]);
});
