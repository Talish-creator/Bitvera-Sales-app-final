/**
 * Bitvera Sales — Field Expense Tracking Engine
 * 
 * Manages operator van and field expenses (Fuel, Travel, Meals, Vehicle Maintenance)
 * with digital receipt attachment associations and audit logs.
 */

import { Expense } from '../types';
import { logEnterpriseEvent } from './config';

const EXPENSES_STORAGE_KEY = 'bitvera_field_expenses_v1';

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-2026-001',
    salesperson: 'representative',
    amount: 145.00,
    currency: 'SAR',
    date: new Date().toISOString().split('T')[0],
    category: 'Fuel',
    notes: 'Van refuel at Sasco Station Riyadh-North Highway.',
    status: 'SUBMITTED'
  },
  {
    id: 'EXP-2026-002',
    salesperson: 'representative',
    amount: 35.00,
    currency: 'SAR',
    date: new Date().toISOString().split('T')[0],
    category: 'Meals',
    notes: 'Operator meal during field route shift.',
    status: 'APPROVED'
  }
];

export function getExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save expenses:', err);
  }
}

export function addExpense(expense: Omit<Expense, 'id' | 'status'>): Expense {
  const expenses = getExpenses();
  const newExp: Expense = {
    ...expense,
    id: `EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, '0')}`,
    status: 'SUBMITTED'
  };
  expenses.unshift(newExp);
  saveExpenses(expenses);
  logEnterpriseEvent('INFO', 'SYSTEM', `Expense submitted: ${newExp.amount} ${newExp.currency} for ${newExp.category}`);
  return newExp;
}

export function updateExpenseStatus(expenseId: string, status: Expense['status']): Expense | null {
  const expenses = getExpenses();
  const exp = expenses.find(e => e.id === expenseId);
  if (!exp) return null;
  exp.status = status;
  saveExpenses(expenses);
  logEnterpriseEvent('AUDIT', 'SYSTEM', `Expense ${expenseId} status changed to ${status}`);
  return exp;
}
