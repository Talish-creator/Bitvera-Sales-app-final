/**
 * Bitvera Sales — Enterprise Approval Workflows Service
 * 
 * Manages governance approvals for commercial exceptions:
 * - High discount overrides (> 15%)
 * - Credit limit breaches
 * - Daily closing reconciliation variances
 */

import { ApprovalRequest, ApprovalType } from '../types';
import { getBusinessConfig, logEnterpriseEvent } from './config';

const APPROVALS_STORAGE_KEY = 'bitvera_commercial_approvals_v1';

const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'APP-2026-001',
    type: 'DISCOUNT_OVERRIDE',
    title: 'Promotional Discount 20% on Bulk Cartons',
    description: 'Requested 20% discount for Al-Madina Hypermarket on 200 cartons of ALMAS 1.5L (Standard max autonomous discount is 15%).',
    requestedBy: 'representative',
    requestedAt: '2026-05-01T11:20:00Z',
    status: 'APPROVED',
    reviewedBy: 'manager',
    reviewedAt: '2026-05-01T11:45:00Z',
    orderId: 'ORD-98421',
    customerId: 'CUST-002',
    discountPercent: 20,
    notes: 'Approved for quarterly volume commitment.'
  },
  {
    id: 'APP-2026-002',
    type: 'CREDIT_LIMIT_OVERRIDE',
    title: 'Temporary Credit Ceiling Extension (65,000 SAR)',
    description: 'Order exceeds current credit limit of 50,000 SAR by 8,500 SAR. Previous payment record is excellent.',
    requestedBy: 'representative',
    requestedAt: '2026-05-02T09:10:00Z',
    status: 'PENDING',
    customerId: 'TC-1100',
    notes: 'Awaiting commercial director sign-off.'
  }
];

export function getApprovalRequests(): ApprovalRequest[] {
  try {
    const raw = localStorage.getItem(APPROVALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(INITIAL_APPROVALS));
      return INITIAL_APPROVALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPROVALS;
  }
}

export function saveApprovalRequests(requests: ApprovalRequest[]): void {
  try {
    localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.error('Failed to save approval requests:', err);
  }
}

export function submitApprovalRequest(
  type: ApprovalType,
  title: string,
  description: string,
  details: {
    orderId?: string;
    customerId?: string;
    discountPercent?: number;
    varianceAmount?: number;
    notes?: string;
  }
): ApprovalRequest {
  const requests = getApprovalRequests();
  const userJson = localStorage.getItem('bitvera_current_user_v2');
  let username = 'representative';
  if (userJson) {
    try { username = JSON.parse(userJson).username || username; } catch {}
  }

  const newRequest: ApprovalRequest = {
    id: `APP-${new Date().getFullYear()}-${String(requests.length + 1).padStart(3, '0')}`,
    type,
    title,
    description,
    requestedBy: username,
    requestedAt: new Date().toISOString(),
    status: 'PENDING',
    ...details
  };

  requests.unshift(newRequest);
  saveApprovalRequests(requests);
  logEnterpriseEvent('AUDIT', 'ORDER', `Approval requested: ${title} (${newRequest.id})`);
  return newRequest;
}

export function resolveApprovalRequest(
  requestId: string,
  decision: 'APPROVED' | 'REJECTED',
  reviewerNotes?: string
): ApprovalRequest | null {
  const requests = getApprovalRequests();
  const req = requests.find(r => r.id === requestId);
  if (!req) return null;

  const userJson = localStorage.getItem('bitvera_current_user_v2');
  let username = 'manager';
  if (userJson) {
    try { username = JSON.parse(userJson).username || username; } catch {}
  }

  req.status = decision;
  req.reviewedBy = username;
  req.reviewedAt = new Date().toISOString();
  if (reviewerNotes) req.notes = `${req.notes ? req.notes + ' | ' : ''}Reviewer: ${reviewerNotes}`;

  saveApprovalRequests(requests);
  logEnterpriseEvent('AUDIT', 'ORDER', `Approval request ${requestId} ${decision} by ${username}`);
  return req;
}

/**
 * Checks whether an order discount requires managerial approval under business rules.
 */
export function checkDiscountApprovalRequirement(discountPercent: number): {
  requiresApproval: boolean;
  threshold: number;
  reason?: string;
} {
  const config = getBusinessConfig();
  const threshold = config.maxAutonomousDiscountPercent;

  if (discountPercent > threshold) {
    return {
      requiresApproval: true,
      threshold,
      reason: `Requested discount of ${discountPercent}% exceeds the autonomous threshold of ${threshold}%. Managerial approval required.`
    };
  }

  return { requiresApproval: false, threshold };
}
