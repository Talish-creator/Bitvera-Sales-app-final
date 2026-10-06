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
  checkDiscountApprovalRequirement,
  submitApprovalRequest,
  resolveApprovalRequest,
  getApprovalRequests
} from '../src/services/approvals';

test('Approvals Engine: checks discount threshold governance (15% limit)', () => {
  const regular = checkDiscountApprovalRequirement(10);
  assert.equal(regular.requiresApproval, false);

  const threshold = checkDiscountApprovalRequirement(15);
  assert.equal(threshold.requiresApproval, false);

  const excessive = checkDiscountApprovalRequirement(20);
  assert.equal(excessive.requiresApproval, true);
  assert.match(excessive.reason!, /exceeds the autonomous threshold/);
});

test('Approvals Engine: submitting and resolving approval requests updates status', () => {
  const req = submitApprovalRequest(
    'DISCOUNT_OVERRIDE',
    'Special wholesale contract discount',
    'Requested 22% discount on bulk shipment',
    { discountPercent: 22 }
  );

  assert.ok(req.id.startsWith('APP-'));
  assert.equal(req.status, 'PENDING');

  const resolved = resolveApprovalRequest(req.id, 'APPROVED', 'Approved by Regional Sales Manager');
  assert.ok(resolved);
  assert.equal(resolved.status, 'APPROVED');

  const allReqs = getApprovalRequests();
  const found = allReqs.find(r => r.id === req.id);
  assert.equal(found?.status, 'APPROVED');
});
