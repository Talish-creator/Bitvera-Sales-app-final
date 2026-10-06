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
  hashPasswordWithSalt,
  authenticate,
  changePassword,
  getCurrentSession,
  logout
} from '../src/services/auth';

test('Auth Service: hashPasswordWithSalt produces consistent SHA-256 hex digest', async () => {
  const salt = 'testsalt12345678';
  const hash1 = await hashPasswordWithSalt('SecretPassword1!', salt);
  const hash2 = await hashPasswordWithSalt('SecretPassword1!', salt);
  const hashDifferent = await hashPasswordWithSalt('DifferentPassword1!', salt);

  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64); // SHA-256 hex length
  assert.notEqual(hash1, hashDifferent);
});

test('Auth Service: authenticate rejects incorrect credentials', async () => {
  const result = await authenticate('ramy', 'WrongPassword!');
  assert.equal(result.success, false);
  assert.match(result.error || '', /Incorrect password|Invalid/i);
});

test('Auth Service: authenticate succeeds with seeded credentials', async () => {
  const result = await authenticate('ramy', 'SalesRamy@2026');
  assert.equal(result.success, true);
  assert.ok(result.session);
  assert.equal(result.session?.username, 'ramy');
  assert.equal(result.session?.role, 'Salesman');

  // Verify session is active
  assert.ok(getCurrentSession());

  // Clear session
  logout();
  assert.equal(getCurrentSession(), null);
});

test('Auth Service: rate limiting locks account after 5 consecutive failures', async () => {
  localStorage.clear();

  // 5 failed attempts
  for (let i = 0; i < 5; i++) {
    await authenticate('ramy', `BadAttempt${i}`);
  }

  // 6th attempt should be locked out
  const lockedResult = await authenticate('ramy', 'SalesRamy@2026');
  assert.equal(lockedResult.success, false);
  assert.match(lockedResult.error || '', /Account locked/i);
});

test('Auth Service: changePassword validates old password and enforces policy', async () => {
  localStorage.clear();
  // Log in first
  await authenticate('ramy', 'SalesRamy@2026');

  // Wrong current password
  const failCurrent = await changePassword('IncorrectOldPassword', 'NewSecurePass@2026', 'NewSecurePass@2026');
  assert.equal(failCurrent.success, false);
  assert.match(failCurrent.error || '', /Current password is incorrect/i);

  // Short new password (< 8 chars)
  const failShort = await changePassword('SalesRamy@2026', 'Short1!', 'Short1!');
  assert.equal(failShort.success, false);
  assert.match(failShort.error || '', /at least 8 characters/i);

  // Successful change
  const success = await changePassword('SalesRamy@2026', 'BrandNewValidPass@2026', 'BrandNewValidPass@2026');
  assert.equal(success.success, true);

  // Verify old password no longer works
  const oldLogin = await authenticate('ramy', 'SalesRamy@2026');
  assert.equal(oldLogin.success, false);

  // Verify new password works
  const newLogin = await authenticate('ramy', 'BrandNewValidPass@2026');
  assert.equal(newLogin.success, true);
});
