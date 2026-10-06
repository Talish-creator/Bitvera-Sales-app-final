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

import { querySalesAssistant } from '../src/services/aiAssistant';

test('AI Sales Assistant: answers MTD sales query with verified factual ledger metrics', () => {
  const res = querySalesAssistant('How much did I sell this month?');
  assert.equal(res.category, 'SALES');
  assert.ok(res.factualData.metrics.length > 0);
  assert.ok(res.factualData.metrics.some(m => m.label.includes('Total Recorded Sales')));
  assert.ok(res.recommendations.length > 0);
  assert.equal(res.suggestedAction?.view, 'reports');
});

test('AI Sales Assistant: identifies low stock items grounded in current inventory', () => {
  const res = querySalesAssistant('Which products are low in stock?');
  assert.equal(res.category, 'INVENTORY');
  assert.ok(res.factualData.metrics.some(m => m.label.includes('SKUs Below Minimum Level')));
  assert.equal(res.suggestedAction?.view, 'loading_requests');
});

test('AI Sales Assistant: identifies top debtor accounts from receivables ledger', () => {
  const res = querySalesAssistant('Who owes the most?');
  assert.equal(res.category, 'RECEIVABLES');
  assert.ok(res.factualData.metrics.some(m => m.label.includes('Outstanding')));
  assert.equal(res.suggestedAction?.view, 'receivables');
});

test('AI Sales Assistant: provides schedule priorities from pending visits and urgent tasks', () => {
  const res = querySalesAssistant('What should I prioritize today?');
  assert.equal(res.category, 'VISITS');
  assert.ok(res.factualData.metrics.some(m => m.label.includes('Pending Visits')));
  assert.equal(res.suggestedAction?.view, 'route_optimization');
});
