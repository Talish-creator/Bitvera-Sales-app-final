import test from 'node:test';
import assert from 'node:assert/strict';

// In-memory localStorage polyfill for Node.js test environment
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
  fetchErpConfig,
  saveErpConfig,
  disconnectErp,
  previewSync,
  executeUserSync,
  syncSingleRecord,
  getSyncQueue,
  enqueueSyncItem,
  retryQueueItem,
  cancelQueueItem,
  getSyncConflicts,
  saveSyncConflicts,
  resolveConflict,
  getEntitySourceOfTruth,
  DEFAULT_CLIENT_ERP_CONFIG
} from '../src/services/erpnextIntegration';

import {
  getCustomers,
  getOrders,
  getProducts,
  addCustomerPersistent,
  addOrderPersistent
} from '../src/services/storage';

import { testErpConnection } from '../src/server/erpBackend';

// ---------------------------------------------------------------------------
// 1. ERPNext Disconnected — Standalone Field Capabilities
// ---------------------------------------------------------------------------
test('ERPNext Integration: operates in standalone mode when disconnected', async () => {
  localStorage.clear();
  const cfg = await fetchErpConfig();
  assert.equal(cfg.connectionStatus, 'DISCONNECTED');

  // Local customers and orders must remain completely accessible
  const customers = getCustomers();
  const orders = getOrders();
  assert.ok(customers.length > 0, 'Customers available offline');
  assert.ok(orders.length > 0, 'Orders available offline');
});

// ---------------------------------------------------------------------------
// 2. Real Connection Testing (Never assumes connected without response)
// ---------------------------------------------------------------------------
test('ERPNext Gateway: testErpConnection rejects empty URL or missing credentials', async () => {
  const resEmptyUrl = await testErpConnection('', 'key123', 'sec123');
  assert.equal(resEmptyUrl.connected, false);
  assert.match(resEmptyUrl.error || '', /URL is required/i);

  const resMissingSecret = await testErpConnection('http://localhost:8000', 'key123', '');
  assert.equal(resMissingSecret.connected, false);
  assert.match(resMissingSecret.error || '', /required/i);
});

// ---------------------------------------------------------------------------
// 3. Sync Disabled Modules
// ---------------------------------------------------------------------------
test('ERPNext Integration: disabled modules are excluded from sync preview and execution', async () => {
  localStorage.clear();
  // Request preview with empty array (or disabled module)
  const preview = await previewSync([]);
  assert.equal(preview.customers.toCreate, 0);
  assert.equal(preview.customers.toUpdate, 0);
  assert.equal(preview.orders.toSubmit, 0);

  const report = await executeUserSync([]);
  assert.equal(report.created, 0);
  assert.equal(report.updated, 0);
  assert.equal(report.recordsProcessed, 0);
});

// ---------------------------------------------------------------------------
// 4. Manually Selected Modules Only
// ---------------------------------------------------------------------------
test('ERPNext Integration: user manual selection controls exactly what gets synced', async () => {
  localStorage.clear();
  // Only select customers
  const previewCustOnly = await previewSync(['customers']);
  assert.ok(previewCustOnly.customers.toCreate > 0 || previewCustOnly.customers.toUpdate > 0);
  assert.equal(previewCustOnly.orders.toSubmit, 0, 'Orders must not be included');

  // Only select orders
  const previewOrdersOnly = await previewSync(['orders']);
  assert.equal(previewOrdersOnly.customers.toCreate, 0, 'Customers must not be included');
  assert.ok(previewOrdersOnly.orders.toSubmit > 0 || previewOrdersOnly.orders.alreadySynced > 0);
});

// ---------------------------------------------------------------------------
// 5. Offline Queueing when ERP is Unreachable
// ---------------------------------------------------------------------------
test('ERPNext Integration: offline transactions are safely enqueued without data loss', async () => {
  localStorage.clear();
  // ERP is disconnected
  const item = enqueueSyncItem('Order', 'ORD-TEST-99', 'Order #99 - Al Madina Hypermarket');
  assert.equal(item.status, 'PENDING');
  assert.equal(item.entityType, 'Order');

  const queue = getSyncQueue();
  assert.ok(queue.some(q => q.id === item.id && q.entityId === 'ORD-TEST-99'));
});

// ---------------------------------------------------------------------------
// 6. Queue Deduplication
// ---------------------------------------------------------------------------
test('ERPNext Integration: enqueuing the same pending entity deduplicates cleanly', () => {
  localStorage.clear();
  const it1 = enqueueSyncItem('Customer', 'CUST-DUP-1', 'Duplicate Customer Test');
  const it2 = enqueueSyncItem('Customer', 'CUST-DUP-1', 'Duplicate Customer Test');

  assert.equal(it1.id, it2.id, 'Must reuse existing pending queue item');
  const queue = getSyncQueue();
  const matches = queue.filter(q => q.entityId === 'CUST-DUP-1' && q.status === 'PENDING');
  assert.equal(matches.length, 1);
});

// ---------------------------------------------------------------------------
// 7. Queue Item Cancellation
// ---------------------------------------------------------------------------
test('ERPNext Integration: cancelQueueItem updates item status to CANCELLED', () => {
  localStorage.clear();
  const it = enqueueSyncItem('Visit', 'VISIT-CANCEL-1', 'Visit Cancel Test');
  cancelQueueItem(it.id);

  const queue = getSyncQueue();
  const target = queue.find(q => q.id === it.id);
  assert.equal(target?.status, 'CANCELLED');
});

// ---------------------------------------------------------------------------
// 8. Queue Retry for Failed Items
// ---------------------------------------------------------------------------
test('ERPNext Integration: retryQueueItem attempts synchronization and records attempt', async () => {
  localStorage.clear();
  const it = enqueueSyncItem('Customer', 'TC-1100', 'Test Customer Retry');
  // Mock it as failed
  const queue = getSyncQueue();
  queue[0].status = 'FAILED';
  queue[0].retryCount = 1;
  localStorage.setItem('bitvera_erp_sync_queue_v1', JSON.stringify(queue));

  // Retrying while disconnected should safely record failure without crash
  const success = await retryQueueItem(it.id);
  assert.equal(success, false, 'Retry fails gracefully when disconnected');

  const reloaded = getSyncQueue();
  const updated = reloaded.find(q => q.id === it.id);
  assert.equal(updated?.status, 'FAILED');
  assert.equal(updated?.retryCount, 2);
  assert.ok(updated?.lastError?.includes('disconnected'));
});

// ---------------------------------------------------------------------------
// 9. Conflict Detection & Manual Resolution
// ---------------------------------------------------------------------------
test('ERPNext Integration: conflicts can be manually resolved with Bitvera or ERP value', async () => {
  localStorage.clear();
  const initialCustomers = getCustomers();
  const cust = initialCustomers[0];

  saveSyncConflicts([{
    id: 'conf-1',
    entityType: 'Customer',
    entityId: cust.id,
    entityName: cust.name,
    field: 'phone',
    bitveraValue: '+966501112233',
    erpValue: '+966509998877',
    status: 'pending',
    detectedAt: new Date().toISOString()
  }]);

  const conflicts = getSyncConflicts();
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].status, 'pending');

  // Resolve using ERPNext value
  await resolveConflict('conf-1', 'use_erp');

  const afterResolution = getSyncConflicts();
  assert.equal(afterResolution[0].status, 'resolved_erp');

  // Local customer phone must now match the ERP value
  const updatedCustomers = getCustomers();
  const updatedCust = updatedCustomers.find(c => c.id === cust.id);
  assert.equal(updatedCust?.phone, '+966509998877');
});

// ---------------------------------------------------------------------------
// 10. Source of Truth Definitions
// ---------------------------------------------------------------------------
test('ERPNext Integration: getEntitySourceOfTruth assigns correct authoritative systems', () => {
  const stockTruth = getEntitySourceOfTruth('inventory');
  assert.equal(stockTruth.source, 'ERPNext');
  assert.equal(stockTruth.recommendedDirection, 'erp_to_bitvera');

  const visitTruth = getEntitySourceOfTruth('visits');
  assert.equal(visitTruth.source, 'Bitvera');
  assert.equal(visitTruth.recommendedDirection, 'bitvera_to_erp');

  const custTruth = getEntitySourceOfTruth('customers');
  assert.equal(custTruth.source, 'Shared');
  assert.equal(custTruth.recommendedDirection, 'two_way');
});

// ---------------------------------------------------------------------------
// 11. Idempotency: Multiple Sync Attempts Skip Already Synced Orders
// ---------------------------------------------------------------------------
test('ERPNext Integration: orders with existing erpnext_id are skipped (idempotent)', async () => {
  localStorage.clear();
  const orders = getOrders();
  // Mark first order as already synced with ERPNext
  (orders[0] as any).erpnext_id = 'SO-ALREADY-SYNCED-001';
  localStorage.setItem('bitvera_db_orders_v1', JSON.stringify(orders));

  const preview = await previewSync(['orders']);
  assert.ok(preview.orders.alreadySynced >= 1, 'Recognizes existing ERP document ID');
});

// ---------------------------------------------------------------------------
// 12. Selective Single Record Sync Rejects When Disconnected Without Crash
// ---------------------------------------------------------------------------
test('ERPNext Integration: syncSingleRecord returns graceful error when disconnected', async () => {
  localStorage.clear();
  const res = await syncSingleRecord('Customer', 'TC-1100');
  assert.equal(res.success, false);
  assert.equal(res.status, 'FAILED');
  assert.match(res.error || '', /disconnected/i);
});

// ---------------------------------------------------------------------------
// 13. Disconnecting ERPNext Preserves All Local Bitvera Records
// ---------------------------------------------------------------------------
test('ERPNext Integration: disconnectErp clears gateway without deleting local data', async () => {
  localStorage.clear();
  const custBefore = getCustomers().length;
  const ordersBefore = getOrders().length;
  const prodBefore = getProducts().length;

  const { config } = await disconnectErp(false);
  assert.equal(config.connectionStatus, 'DISCONNECTED');

  const custAfter = getCustomers().length;
  const ordersAfter = getOrders().length;
  const prodAfter = getProducts().length;

  assert.equal(custAfter, custBefore, 'Customers preserved');
  assert.equal(ordersAfter, ordersBefore, 'Orders preserved');
  assert.equal(prodAfter, prodBefore, 'Products preserved');
});
