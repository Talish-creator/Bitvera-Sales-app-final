import test from 'node:test';
import assert from 'node:assert/strict';

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (i: number) => Array.from(store.keys())[i] ?? null
  } as any;
}

import { getReceivablesAnalysis } from '../src/services/receivables';

test('Receivables Engine: computes aging brackets and portfolio utilization', () => {
  const data = getReceivablesAnalysis();
  assert.ok(data.totalOutstandingSAR >= 0);
  assert.ok(data.totalCreditLimitSAR > 0);
  assert.ok(data.overallUtilizationPercent >= 0 && data.overallUtilizationPercent <= 100);

  // Check 5 required aging buckets
  assert.equal(data.buckets.length, 5);
  assert.equal(data.buckets[0].label, 'Current (0–15d)');
  assert.equal(data.buckets[4].label, '90+ Days (Critical)');

  // Verify customer summaries
  assert.ok(data.customerSummaries.length > 0);
  const first = data.customerSummaries[0];
  assert.ok(first.customer.id);
  assert.ok(first.creditLimit > 0);
});
