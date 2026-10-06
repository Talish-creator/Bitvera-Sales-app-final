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
  getProducts,
  getCustomers,
  getOrders,
  addOrderPersistent,
  checkCustomerDuplicate
} from '../src/services/storage';

import {
  calculateHaversineDistanceKm,
  verifyCustomerGeofence
} from '../src/services/location';

test('Storage Service: initial seeds load products and customers', () => {
  localStorage.clear();
  const products = getProducts();
  const customers = getCustomers();

  assert.ok(products.length >= 2);
  assert.ok(customers.length >= 2);
});

test('Storage Service: duplicate customer detection prevents duplicate phone, ID or name', () => {
  localStorage.clear();
  const customers = getCustomers();
  const existing = customers[0];

  // Duplicate by phone
  assert.equal(checkCustomerDuplicate({ phone: existing.phone }).isDuplicate, true);

  // Duplicate by ID/license
  if (existing.idNumber) {
    assert.equal(checkCustomerDuplicate({ idNumber: existing.idNumber }).isDuplicate, true);
  }

  // Duplicate by Name
  assert.equal(checkCustomerDuplicate({ name: existing.name }).isDuplicate, true);

  // New unique customer
  assert.equal(checkCustomerDuplicate({
    name: 'Brand New Unique Minimarket',
    phone: '+966 59 999 9999',
    idNumber: 'CR-9999999999'
  }).isDuplicate, false);
});

test('Storage Service: addOrderPersistent atomically decrements product inventory', () => {
  localStorage.clear();
  const initialProducts = getProducts();
  const p1 = initialProducts[0];
  const initialStock = p1.stock;

  const orderId = `ORD-TEST-${Date.now()}`;
  addOrderPersistent({
    id: orderId,
    customerName: 'Test Market',
    customerId: 'CUST-001',
    date: new Date().toISOString(),
    total: 65.00,
    status: 'Completed',
    paymentMethod: 'Cash',
    items: [
      { name: p1.name, qty: 10, price: p1.price }
    ]
  });

  // Verify order is persisted
  const orders = getOrders();
  const foundOrder = orders.find(o => o.id === orderId);
  assert.ok(foundOrder);

  // Verify product stock was decremented
  const updatedProducts = getProducts();
  const updatedP1 = updatedProducts.find(p => p.id === p1.id);
  assert.equal(updatedP1?.stock, initialStock - 10);
});

test('Location Service: calculateHaversineDistanceKm computes accurate distances', () => {
  // Riyadh King Fahd Road to Olaya (~1.5 km)
  const dist = calculateHaversineDistanceKm(24.7136, 46.6753, 24.7250, 46.6800);
  assert.ok(dist > 1.0 && dist < 2.0);

  // Identical coordinates should be 0
  assert.equal(calculateHaversineDistanceKm(24.7136, 46.6753, 24.7136, 46.6753), 0);
});

test('Location Service: verifyCustomerGeofence validates check-in range', () => {
  const current = { latitude: 24.7136, longitude: 46.6753, accuracy: 15, timestamp: Date.now() };
  
  // Target within 100 meters
  const closeTarget = { latitude: 24.7137, longitude: 46.6754 };
  assert.equal(verifyCustomerGeofence(current, closeTarget.latitude, closeTarget.longitude, 200).isWithinGeofence, true);

  // Target far away (10 km)
  const farTarget = { latitude: 24.8136, longitude: 46.6753 };
  assert.equal(verifyCustomerGeofence(current, farTarget.latitude, farTarget.longitude, 200).isWithinGeofence, false);
});
