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

import {
  calculateCustomerHealthScore,
  getCustomer360Data
} from '../src/services/customer360';
import { Order } from '../src/types';

test('Customer 360: calculateCustomerHealthScore computes explainable composite score', () => {
  const mockOrders: Order[] = [
    {
      id: 'ORD-1',
      customerName: 'Test Corp',
      customerId: 'C-1',
      date: new Date().toISOString(),
      total: 5000,
      status: 'Completed'
    },
    {
      id: 'ORD-2',
      customerName: 'Test Corp',
      customerId: 'C-1',
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      total: 4500,
      status: 'Completed'
    },
    {
      id: 'ORD-3',
      customerName: 'Test Corp',
      customerId: 'C-1',
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      total: 3000,
      status: 'Completed'
    }
  ];

  // Healthy account: Recent orders, good frequency, low credit utilization
  const health = calculateCustomerHealthScore(mockOrders, 2000, 50000);
  assert.ok(health.score >= 75);
  assert.equal(health.tier, 'Healthy');
  assert.equal(health.factors.length, 4);
  assert.ok(health.factors.some(f => f.label === 'Purchase Recency'));
  assert.ok(health.factors.some(f => f.label === 'Payment Compliance'));
});

test('Customer 360: dormant account is classified as At Risk or Inactive', () => {
  const oldOrders: Order[] = [
    {
      id: 'ORD-OLD',
      customerName: 'Dormant LLC',
      customerId: 'C-2',
      date: new Date(Date.now() - 90 * 86400000).toISOString(),
      total: 800,
      status: 'Completed'
    }
  ];

  const health = calculateCustomerHealthScore(oldOrders, 25000, 30000); // 83% credit utilized, 90 days inactive
  assert.ok(health.score < 60);
  assert.ok(health.tier === 'At Risk' || health.tier === 'Inactive');
});

test('Customer 360: getCustomer360Data aggregates LTV, AOV, and interaction timeline', () => {
  const summary = getCustomer360Data('TC-1100');
  assert.ok(summary);
  assert.equal(summary.customer.id, 'TC-1100');
  assert.ok(summary.lifetimeValue >= 0);
  assert.ok(summary.creditLimit > 0);
  assert.ok(summary.timeline.length > 0);
  assert.ok(summary.timeline.some(t => t.type === 'CUSTOMER_CREATED'));
});
