import test from 'node:test';
import assert from 'node:assert/strict';

import {
  optimizeCustomerRoute,
  recalculateCustomRoute
} from '../src/services/routeOptimizer';
import { Customer } from '../src/types';

test('Route Optimizer: calculates geodesic shortest path across multiple stops', () => {
  const stops: { customer: Customer; status: any }[] = [
    {
      customer: {
        id: 'C-FAR',
        name: 'Far North Stop',
        phone: '111',
        lat: 24.8500, // ~15km north
        lng: 46.6753,
        buildingNumber: '1',
        type: 'Commercial',
        group: 'C',
        subGroup: 'S',
        idType: 'CR',
        idNumber: '111',
        status: 'ACTIVE ACCOUNT'
      },
      status: 'PENDING'
    },
    {
      customer: {
        id: 'C-NEAR',
        name: 'Near Central Stop',
        phone: '222',
        lat: 24.7200, // ~1km from start (24.7136, 46.6753)
        lng: 46.6753,
        buildingNumber: '2',
        type: 'Commercial',
        group: 'C',
        subGroup: 'S',
        idType: 'CR',
        idNumber: '222',
        status: 'ACTIVE ACCOUNT'
      },
      status: 'PENDING'
    },
    {
      customer: {
        id: 'C-MID',
        name: 'Mid-Way Stop',
        phone: '333',
        lat: 24.7700, // ~6km north
        lng: 46.6753,
        buildingNumber: '3',
        type: 'Commercial',
        group: 'C',
        subGroup: 'S',
        idType: 'CR',
        idNumber: '333',
        status: 'PENDING'
      },
      status: 'PENDING'
    }
  ];

  // Starting at Riyadh Central (24.7136, 46.6753)
  const plan = optimizeCustomerRoute(stops, { lat: 24.7136, lng: 46.6753 });

  // Nearest-Neighbor algorithm must select C-NEAR first, then C-MID, then C-FAR
  assert.equal(plan.stops.length, 3);
  assert.equal(plan.stops[0].customer.id, 'C-NEAR');
  assert.equal(plan.stops[1].customer.id, 'C-MID');
  assert.equal(plan.stops[2].customer.id, 'C-FAR');

  assert.ok(plan.totalDistanceKm > 0);
  assert.ok(plan.totalEstimatedDriveMinutes > 0);
  assert.ok(plan.totalEstimatedServiceMinutes > 0);
});

test('Route Optimizer: recalculateCustomRoute adjusts distance on manual stop reordering', () => {
  const customSequence = [
    {
      customer: {
        id: 'A',
        name: 'A',
        phone: '1',
        lat: 24.7200,
        lng: 46.6753,
        buildingNumber: '1',
        type: 'C',
        group: 'G',
        subGroup: 'S',
        idType: 'CR',
        idNumber: '1',
        status: 'ACTIVE ACCOUNT' as const
      },
      status: 'PENDING' as const
    },
    {
      customer: {
        id: 'B',
        name: 'B',
        phone: '2',
        lat: 24.8500,
        lng: 46.6753,
        buildingNumber: '2',
        type: 'C',
        group: 'G',
        subGroup: 'S',
        idType: 'CR',
        idNumber: '2',
        status: 'ACTIVE ACCOUNT' as const
      },
      status: 'PENDING' as const
    }
  ];

  const plan = recalculateCustomRoute(customSequence, { lat: 24.7136, lng: 46.6753 });
  assert.equal(plan.stops.length, 2);
  assert.equal(plan.stops[0].customer.id, 'A');
  assert.equal(plan.stops[1].customer.id, 'B');
  assert.ok(plan.totalDistanceKm > 10);
});
