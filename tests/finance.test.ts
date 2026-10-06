import test from 'node:test';
import assert from 'node:assert/strict';
import {
  roundTo,
  calculateLineItem,
  calculateCart,
  isPaymentSplitBalanced,
  convertFromSAR
} from '../src/services/finance';

test('Finance Engine: roundTo prevents floating-point inaccuracies', () => {
  assert.equal(roundTo(0.1 + 0.2, 2), 0.3);
  assert.equal(roundTo(1.005, 2), 1.01);
  assert.equal(roundTo(395.00 * 0.15, 2), 59.25);
  assert.equal(roundTo(10.555, 2), 10.56);
});

test('Finance Engine: calculateLineItem computes subtotal and standard 15% VAT', () => {
  const item = calculateLineItem({ name: 'Test Item', qty: 50, price: 6.50 }, 15);
  assert.equal(item.subtotal, 325.00);
  assert.equal(item.taxAmount, 48.75);
  assert.equal(item.total, 373.75);
});

test('Finance Engine: calculateCart computes subtotal, tax, and total accurately', () => {
  const cart = calculateCart([
    { name: 'ALMAS 1.5 L*6', price: 6.50, qty: 50 },
    { name: 'ALMAS 500 ML*12', price: 7.00, qty: 10 }
  ], 'Sales VAT 15%');

  assert.equal(cart.subtotal, 395.00);
  assert.equal(cart.taxAmount, 59.25);
  assert.equal(cart.total, 454.25);
  assert.equal(cart.itemCount, 60);
});

test('Finance Engine: calculateCart handles zero and exempt tax rates', () => {
  const cart = calculateCart([
    { name: 'Zero-rated bread', price: 10.00, qty: 2 }
  ], 'Zero Rated');

  assert.equal(cart.subtotal, 20.00);
  assert.equal(cart.taxAmount, 0.00);
  assert.equal(cart.total, 20.00);
});

test('Finance Engine: isPaymentSplitBalanced validates payment distribution', () => {
  // Exact match
  const exact = isPaymentSplitBalanced(454.25, 254.25, 200.00);
  assert.equal(exact.balanced, true);
  assert.equal(exact.difference, 0.00);

  // Underpayment
  const under = isPaymentSplitBalanced(454.25, 200.00, 200.00);
  assert.equal(under.balanced, false);
  assert.equal(under.difference, 54.25);

  // Overpayment
  const over = isPaymentSplitBalanced(454.25, 300.00, 200.00);
  assert.equal(over.balanced, false);
  assert.equal(over.difference, -45.75);
});

test('Finance Engine: convertFromSAR converts correctly using exchange rates', () => {
  assert.equal(convertFromSAR(100, 1.0), 100);
  assert.equal(convertFromSAR(100, 0.27), 27.0);
  assert.equal(convertFromSAR(375, 1 / 3.75), 100.0);
});
