/**
 * Bitvera Sales — Enterprise Tasks & Smart Reminders Service
 * 
 * Manages operator follow-up tasks and derives real-time Smart Reminders
 * from actual business telemetry (low stock, customer dormancy, unpaid balances).
 */

import { Task, SmartReminder } from '../types';
import { getCustomers, getOrders, getProducts, getVisits } from './storage';
import { getQueueStatus } from './offlineQueue';

const TASKS_STORAGE_KEY = 'bitvera_operator_tasks_v1';

const INITIAL_TASKS: Task[] = [
  {
    id: 'TASK-101',
    title: 'Collect outstanding balance for Invoice #SINV-2026-04122',
    customerId: 'TC-1100',
    customerName: 'test Customers',
    owner: 'representative',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'URGENT',
    status: 'PENDING',
    notes: 'Credit limit reached 90%. Follow up on pending bank transfer verification.',
    createdAt: '2026-05-01T08:00:00Z'
  },
  {
    id: 'TASK-102',
    title: 'On-site stock audit & display replenishment',
    customerId: 'CUST-002',
    customerName: 'Al-Madina Hypermarket',
    owner: 'representative',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: 'HIGH',
    status: 'PENDING',
    notes: 'Check shelf space and verify competitor promotional pricing.',
    createdAt: '2026-05-02T10:15:00Z'
  },
  {
    id: 'TASK-103',
    title: 'Present Summer Promotion catalog & bulk pricing',
    customerId: 'CUST-003',
    customerName: 'Sultan Center Retail',
    owner: 'representative',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    notes: 'Client requested 15% promotional discount on 500ml ALMAS cartons.',
    createdAt: '2026-05-02T14:30:00Z'
  }
];

export function getTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks:', err);
  }
}

export function addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
  const tasks = getTasks();
  const newTask: Task = {
    ...task,
    id: `TASK-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTaskStatus(taskId: string, status: Task['status']): Task | null {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) return null;
  task.status = status;
  saveTasks(tasks);
  return task;
}

export function deleteTask(taskId: string): void {
  const tasks = getTasks().filter(t => t.id !== taskId);
  saveTasks(tasks);
}

/**
 * Generates Smart Reminders dynamically from genuine business data conditions.
 */
export function generateSmartReminders(): SmartReminder[] {
  const reminders: SmartReminder[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Low stock telemetry
  const lowStockProducts = getProducts().filter(p => p.stock < 15);
  if (lowStockProducts.length > 0) {
    reminders.push({
      id: 'rem-stock-low',
      type: 'LOW_STOCK',
      title: `${lowStockProducts.length} Product(s) Below Safety Threshold`,
      description: `SKUs including ${lowStockProducts[0].name} have under 15 units remaining in current van inventory. Request warehouse replenishment.`,
      severity: 'WARNING',
      timestamp: new Date().toISOString(),
      actionView: 'van_stock'
    });
  }

  // 2. Pending Visits for Today
  const pendingVisits = getVisits().filter(v => v.status === 'PENDING');
  if (pendingVisits.length > 0) {
    reminders.push({
      id: 'rem-visits-due',
      type: 'VISIT_UPCOMING',
      title: `${pendingVisits.length} Route Visit(s) Scheduled Today`,
      description: `You have ${pendingVisits.length} pending client check-ins on your assigned itinerary. Earliest stop: ${pendingVisits[0].customer.name}.`,
      severity: 'INFO',
      timestamp: new Date().toISOString(),
      actionView: 'today_route'
    });
  }

  // 3. Customer Dormancy (> 30 days without orders)
  const customers = getCustomers();
  const orders = getOrders();
  const nowMs = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  customers.forEach(cust => {
    const custOrders = orders.filter(o => o.customerId === cust.id);
    if (custOrders.length > 0) {
      const lastOrderTime = new Date(custOrders[0].date).getTime();
      if (!isNaN(lastOrderTime) && (nowMs - lastOrderTime) > thirtyDaysMs) {
        reminders.push({
          id: `rem-dormant-${cust.id}`,
          type: 'CUSTOMER_INACTIVE',
          title: `Account Dormancy Alert: ${cust.name}`,
          description: `No purchase recorded in over 30 days. High risk of churn. Schedule a relationship call or visit.`,
          severity: 'WARNING',
          timestamp: new Date().toISOString(),
          targetId: cust.id,
          actionView: 'customer_360'
        });
      }
    }
  });

  // 4. Offline Queue Pending Sync
  const queueStatus = getQueueStatus();
  if (queueStatus.pendingCount > 0) {
    reminders.push({
      id: 'rem-sync-queue',
      type: 'SYNC_PENDING',
      title: `${queueStatus.pendingCount} Transactions Pending ERP Sync`,
      description: `Terminal has offline buffered transactions. Push to ERPNext when network connectivity is stable.`,
      severity: 'INFO',
      timestamp: new Date().toISOString(),
      actionView: 'sync_center'
    });
  }

  return reminders;
}
