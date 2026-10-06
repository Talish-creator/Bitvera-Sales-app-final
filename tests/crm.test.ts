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
  getLeads,
  addLead,
  updateLeadStage,
  convertLeadToCustomer,
  getPipelineMetrics
} from '../src/services/crm';
import { getCustomers } from '../src/services/storage';

test('CRM Engine: initial seeds load leads with proper stages', () => {
  const leads = getLeads();
  assert.ok(leads.length >= 3);
  assert.ok(leads.some(l => l.stage === 'NEGOTIATION'));
  assert.ok(leads.some(l => l.stage === 'PROPOSAL'));
});

test('CRM Engine: adding a lead assigns an identifier and persists', () => {
  const newLead = addLead({
    name: 'Yousef Al-Khatib',
    company: 'Al-Khatib Distribution Hub',
    phone: '+966 50 999 8888',
    email: 'yousef@khatib-hub.sa',
    source: 'Website',
    territory: 'Riyadh North',
    assignedRep: 'representative',
    potentialValue: 60000,
    probability: 40,
    stage: 'QUALIFIED',
    status: 'OPEN',
    notes: 'Bulk bottled water supplier inquiry',
    nextAction: 'Send price sheet'
  });

  assert.ok(newLead.id.startsWith('LEAD-'));
  const leads = getLeads();
  assert.ok(leads.some(l => l.id === newLead.id));
});

test('CRM Engine: updating lead stage adjusts probability', () => {
  const leads = getLeads();
  const targetLead = leads[0];
  const updated = updateLeadStage(targetLead.id, 'WON');
  assert.ok(updated);
  assert.equal(updated.stage, 'WON');
  assert.equal(updated.probability, 100);
});

test('CRM Engine: converting lead creates verified customer without duplicate', () => {
  // Add unique lead to convert
  const leadToConvert = addLead({
    name: 'Hassan Al-Harbi',
    company: 'Harbi Commercial Markets',
    phone: '+966 59 777 6655',
    email: 'hassan@harbimarkets.com',
    source: 'Referral',
    territory: 'Riyadh South',
    assignedRep: 'representative',
    potentialValue: 35000,
    probability: 80,
    stage: 'ORDER',
    status: 'OPEN',
    notes: 'Ready for conversion',
    nextAction: 'Create customer account'
  });

  const res = convertLeadToCustomer(leadToConvert.id);
  assert.equal(res.success, true);
  assert.ok(res.customer);
  assert.equal(res.customer.phone, '+966 59 777 6655');

  // Verify customer now exists in main customer database
  const customers = getCustomers();
  assert.ok(customers.some(c => c.id === res.customer!.id));

  // Verify duplicate prevention on second attempt
  const dupAttempt = convertLeadToCustomer(leadToConvert.id);
  assert.equal(dupAttempt.success, false);
  assert.match(dupAttempt.error!, /already exists/);
});

test('CRM Engine: pipeline metrics correctly computes totals and win rate', () => {
  const metrics = getPipelineMetrics();
  assert.ok(metrics.totalPipelineValue > 0);
  assert.ok(metrics.weightedPipelineValue > 0);
  assert.ok(metrics.winRatePercent >= 0 && metrics.winRatePercent <= 100);
  assert.ok(metrics.stageDistribution.WON !== undefined);
});
