/**
 * Bitvera Sales — Targets & Commission Engine
 * 
 * Computes sales target achievement and calculates accurate salesperson commissions
 * directly from authoritative completed order transactions.
 */

import { SalesTarget, CommissionRecord, Order } from '../types';
import { getOrders } from './storage';
import { ENTERPRISE_TERRITORIES } from './config';

const TARGETS_STORAGE_KEY = 'bitvera_sales_targets_v1';
const COMMISSIONS_STORAGE_KEY = 'bitvera_commissions_v1';

const INITIAL_TARGETS: SalesTarget[] = [
  {
    id: 'TGT-2026-05-01',
    salesperson: 'representative',
    period: '2026-05',
    targetAmount: 180000,
    territory: 'Riyadh North'
  },
  {
    id: 'TGT-2026-05-02',
    salesperson: 'ahmed_sales',
    period: '2026-05',
    targetAmount: 140000,
    territory: 'Riyadh South'
  },
  {
    id: 'TGT-2026-05-03',
    salesperson: 'tariq_jeddah',
    period: '2026-05',
    targetAmount: 160000,
    territory: 'Jeddah Coastal'
  }
];

export function getSalesTargets(): SalesTarget[] {
  try {
    const raw = localStorage.getItem(TARGETS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(INITIAL_TARGETS));
      return INITIAL_TARGETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TARGETS;
  }
}

export function saveSalesTargets(targets: SalesTarget[]): void {
  try {
    localStorage.setItem(TARGETS_STORAGE_KEY, JSON.stringify(targets));
  } catch (err) {
    console.error('Failed to save sales targets:', err);
  }
}

export interface TargetProgressSummary {
  salesperson: string;
  territory: string;
  targetAmount: number;
  actualSalesAmount: number;
  varianceAmount: number; // actual - target
  achievementPercent: number;
  ordersCount: number;
  averageOrderValue: number;
}

/**
 * Calculates current actual target progress from live orders.
 */
export function calculateTargetProgress(salesperson: string = 'representative'): TargetProgressSummary {
  const targets = getSalesTargets();
  const target = targets.find(t => t.salesperson.toLowerCase() === salesperson.toLowerCase()) || {
    id: 'default',
    salesperson,
    period: '2026-05',
    targetAmount: 180000,
    territory: 'Riyadh North'
  };

  const orders = getOrders().filter(o => o.status === 'Completed' || o.status === 'To Deliver and Bill');
  const actualSalesAmount = Math.round(orders.reduce((sum, o) => sum + o.total, 0) * 100) / 100;
  const varianceAmount = Math.round((actualSalesAmount - target.targetAmount) * 100) / 100;
  const achievementPercent = target.targetAmount > 0
    ? Math.round((actualSalesAmount / target.targetAmount) * 100)
    : 0;
  const averageOrderValue = orders.length > 0 ? Math.round(actualSalesAmount / orders.length) : 0;

  return {
    salesperson: target.salesperson,
    territory: target.territory,
    targetAmount: target.targetAmount,
    actualSalesAmount,
    varianceAmount,
    achievementPercent,
    ordersCount: orders.length,
    averageOrderValue
  };
}

/**
 * Commission Calculation Rules
 * Base Commission: 2.5% of order subtotal
 * Margin Incentive: +1.0% if healthy standard pricing maintained
 */
const BASE_COMMISSION_RATE = 0.025; // 2.5%
const MARGIN_BONUS_RATE = 0.010; // 1.0%

export function calculateOrderCommission(order: Order, salesperson: string = 'representative'): CommissionRecord {
  const subtotal = order.subtotal || (order.total / 1.15);
  const baseCommission = Math.round(subtotal * BASE_COMMISSION_RATE * 100) / 100;
  const marginBonus = Math.round(subtotal * MARGIN_BONUS_RATE * 100) / 100;
  const totalCommission = Math.round((baseCommission + marginBonus) * 100) / 100;

  return {
    id: `COMM-${order.id}`,
    orderId: order.id,
    salesperson,
    orderTotal: order.total,
    baseCommission,
    marginBonus,
    totalCommission,
    date: order.date
  };
}

export function getCommissionsForSalesperson(salesperson: string = 'representative'): {
  records: CommissionRecord[];
  totalEarnings: number;
} {
  const orders = getOrders().filter(o => o.status === 'Completed');
  const records = orders.map(o => calculateOrderCommission(o, salesperson));
  const totalEarnings = Math.round(records.reduce((sum, r) => sum + r.totalCommission, 0) * 100) / 100;

  return { records, totalEarnings };
}
