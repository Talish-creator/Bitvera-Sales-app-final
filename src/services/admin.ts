/**
 * Bitvera Sales — Enterprise Admin User Management & Session Security
 * 
 * Manages operator user credentials, role-based access control (RBAC),
 * territory assignments, and active session revocations.
 */

import { UserAccount, UserRole } from '../types';
import { logEnterpriseEvent, getStructuredLogs, StructuredLogEntry } from './config';

const USERS_STORAGE_KEY = 'bitvera_admin_users_v1';

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-001',
    username: 'representative',
    fullName: 'Ahmed Al-Harbi',
    role: 'salesperson',
    territory: 'Riyadh North',
    status: 'ACTIVE',
    lastLogin: '2026-05-02T08:15:00Z'
  },
  {
    id: 'USR-002',
    username: 'manager',
    fullName: 'Sultan Al-Otaibi',
    role: 'manager',
    territory: 'Riyadh Central',
    status: 'ACTIVE',
    lastLogin: '2026-05-02T09:00:00Z'
  },
  {
    id: 'USR-003',
    username: 'finance_officer',
    fullName: 'Noura Al-Shammari',
    role: 'finance',
    territory: 'Headquarters',
    status: 'ACTIVE',
    lastLogin: '2026-05-01T14:20:00Z'
  },
  {
    id: 'USR-004',
    username: 'warehouse_lead',
    fullName: 'Bandar Al-Qahtani',
    role: 'warehouse',
    territory: 'Riyadh Main Depot',
    status: 'ACTIVE',
    lastLogin: '2026-05-02T06:45:00Z'
  },
  {
    id: 'USR-005',
    username: 'admin',
    fullName: 'System Administrator',
    role: 'admin',
    territory: 'Global',
    status: 'ACTIVE',
    lastLogin: '2026-05-02T07:30:00Z'
  }
];

export function getUserAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUserAccounts(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save user accounts:', err);
  }
}

export function addUserAccount(account: Omit<UserAccount, 'id'>): UserAccount {
  const users = getUserAccounts();
  const newUser: UserAccount = {
    ...account,
    id: `USR-${String(users.length + 1).padStart(3, '0')}`
  };
  users.push(newUser);
  saveUserAccounts(users);
  logEnterpriseEvent('AUDIT', 'SECURITY', `User account created: ${newUser.username} (${newUser.role})`);
  return newUser;
}

export function updateUserRole(userId: string, role: UserRole, territory?: string): UserAccount | null {
  const users = getUserAccounts();
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  user.role = role;
  if (territory) user.territory = territory;

  saveUserAccounts(users);
  logEnterpriseEvent('AUDIT', 'SECURITY', `User ${user.username} role updated to ${role}`);
  return user;
}

export function toggleUserStatus(userId: string): UserAccount | null {
  const users = getUserAccounts();
  const user = users.find(u => u.id === userId);
  if (!user) return null;

  user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  saveUserAccounts(users);
  logEnterpriseEvent('AUDIT', 'SECURITY', `User ${user.username} status toggled to ${user.status}`);
  return user;
}

// ---------------------------------------------------------------------------
// Audit Log Queries & Exports
// ---------------------------------------------------------------------------
export function queryAuditLogs(filter?: {
  level?: string;
  category?: string;
  search?: string;
}): StructuredLogEntry[] {
  let logs = getStructuredLogs();
  if (filter?.level) logs = logs.filter(l => l.level === filter.level);
  if (filter?.category) logs = logs.filter(l => l.category === filter.category);
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    logs = logs.filter(l => l.message.toLowerCase().includes(q) || (l.userName && l.userName.toLowerCase().includes(q)));
  }
  return logs;
}

export function exportAuditLogsJson(): void {
  const logs = getStructuredLogs();
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bitvera_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
