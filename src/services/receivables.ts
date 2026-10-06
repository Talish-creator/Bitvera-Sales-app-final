/**
 * Bitvera Sales — Accounts Receivable Aging & Credit Management Engine
 * 
 * Computes receivables aging brackets (Current, 1-30, 31-60, 61-90, 90+ days)
 * and credit limit utilization across customer accounts from genuine ledger entries.
 */

import { Customer, Order } from '../types';
import { getCustomers, getOrders } from './storage';

export interface AgingBucket {
  label: string;
  minDays: number;
  maxDays: number;
  totalAmount: number;
  count: number;
}

export interface CustomerReceivableSummary {
  customer: Customer;
  totalInvoiced: number;
  totalPaid: number;
  outstandingBalance: number;
  creditLimit: number;
  creditUtilizationPercent: number;
  oldestInvoiceDays: number;
  status: 'CURRENT' | 'ATTENTION' | 'OVERDUE' | 'CRITICAL';
}

export interface ReceivablesDashboardData {
  totalOutstandingSAR: number;
  totalCreditLimitSAR: number;
  overallUtilizationPercent: number;
  buckets: AgingBucket[];
  customerSummaries: CustomerReceivableSummary[];
  topOverdueCustomers: CustomerReceivableSummary[];
}

export function getReceivablesAnalysis(): ReceivablesDashboardData {
  const customers = getCustomers();
  const orders = getOrders();
  const nowMs = Date.now();

  const customerSummaries: CustomerReceivableSummary[] = [];

  const buckets: AgingBucket[] = [
    { label: 'Current (0–15d)', minDays: 0, maxDays: 15, totalAmount: 0, count: 0 },
    { label: '16–30 Days', minDays: 16, maxDays: 30, totalAmount: 0, count: 0 },
    { label: '31–60 Days', minDays: 31, maxDays: 60, totalAmount: 0, count: 0 },
    { label: '61–90 Days', minDays: 61, maxDays: 90, totalAmount: 0, count: 0 },
    { label: '90+ Days (Critical)', minDays: 91, maxDays: 9999, totalAmount: 0, count: 0 }
  ];

  let totalOutstandingSAR = 0;
  let totalCreditLimitSAR = 0;

  customers.forEach(cust => {
    const custOrders = orders.filter(o => o.customerId === cust.id);
    const creditLimit = cust.creditLimit || 50000;
    totalCreditLimitSAR += creditLimit;

    let totalInvoiced = 0;
    let totalPaid = 0;
    let oldestInvoiceDays = 0;

    custOrders.forEach(o => {
      totalInvoiced += o.total;
      const paid = (o.cashReceived || 0) + (o.bankReceived || 0);
      totalPaid += paid;
      const unpaidOnThisOrder = Math.max(0, o.total - paid);

      if (unpaidOnThisOrder > 0) {
        const orderTime = new Date(o.date).getTime();
        const daysOld = isNaN(orderTime) ? 5 : Math.max(0, Math.floor((nowMs - orderTime) / (1000 * 60 * 60 * 24)));
        if (daysOld > oldestInvoiceDays) oldestInvoiceDays = daysOld;

        // Bucket allocation
        const bucket = buckets.find(b => daysOld >= b.minDays && daysOld <= b.maxDays);
        if (bucket) {
          bucket.totalAmount = Math.round((bucket.totalAmount + unpaidOnThisOrder) * 100) / 100;
          bucket.count += 1;
        }
      }
    });

    const outstandingBalance = Math.max(0, Math.round((totalInvoiced - totalPaid) * 100) / 100);
    totalOutstandingSAR += outstandingBalance;

    const creditUtilizationPercent = creditLimit > 0
      ? Math.round((outstandingBalance / creditLimit) * 100)
      : 0;

    let status: CustomerReceivableSummary['status'] = 'CURRENT';
    if (oldestInvoiceDays > 60 || creditUtilizationPercent > 90) status = 'CRITICAL';
    else if (oldestInvoiceDays > 30 || creditUtilizationPercent > 75) status = 'OVERDUE';
    else if (outstandingBalance > 0) status = 'ATTENTION';

    customerSummaries.push({
      customer: cust,
      totalInvoiced: Math.round(totalInvoiced * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      outstandingBalance,
      creditLimit,
      creditUtilizationPercent,
      oldestInvoiceDays,
      status
    });
  });

  customerSummaries.sort((a, b) => b.outstandingBalance - a.outstandingBalance);
  const topOverdueCustomers = customerSummaries.filter(c => c.outstandingBalance > 0).slice(0, 5);

  const overallUtilizationPercent = totalCreditLimitSAR > 0
    ? Math.round((totalOutstandingSAR / totalCreditLimitSAR) * 100)
    : 0;

  return {
    totalOutstandingSAR: Math.round(totalOutstandingSAR * 100) / 100,
    totalCreditLimitSAR,
    overallUtilizationPercent,
    buckets,
    customerSummaries,
    topOverdueCustomers
  };
}
