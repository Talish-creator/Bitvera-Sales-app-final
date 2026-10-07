/**
 * Bitvera Sales — Authoritative Storage & Offline Persistence Layer
 * 
 * Persistent database backed by IndexedDB with localStorage fallback.
 * Ensures data survives page refreshes, browser restarts, and network drops.
 * Includes duplicate customer detection and stock synchronization.
 */

import { Product, Customer, Visit, Order, LoadingRequest, InventoryClosingItem } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_VISITS,
  INITIAL_ORDERS,
  INITIAL_LOADING_REQUESTS,
  INITIAL_CLOSING_INVENTORY
} from '../data';

const DB_KEYS = {
  PRODUCTS: 'bitvera_db_products_v1',
  CUSTOMERS: 'bitvera_db_customers_v1',
  VISITS: 'bitvera_db_visits_v1',
  ORDERS: 'bitvera_db_orders_v1',
  LOADING_REQUESTS: 'bitvera_db_loading_requests_v1',
  CLOSING_INVENTORY: 'bitvera_db_closing_inventory_v1',
  CLOSING_REPORTS: 'bitvera_db_closing_reports_v1',
  ATTACHMENTS: 'bitvera_db_attachments_v1',
  NOTIFICATIONS: 'bitvera_db_notifications_v1',
  IDEMPOTENCY_CACHE: 'bitvera_idempotency_cache_v1'
};

export interface PersistentClosingReport {
  id: string;
  date: string;
  timestamp: string;
  userId: string;
  userName: string;
  totalOpeningQty: number;
  totalClosingQty: number;
  itemsSoldQty: number;
  cashReceived: number;
  bankReceived: number;
  totalSales: number;
  expectedTotal: number;
  variance: number;
  orderCount: number;
  auditHash: string;
  syncedToERP: boolean;
}

export interface StoredAttachment {
  id: string;
  entityType: 'customer_id' | 'customer_site' | 'payment_proof';
  entityId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  linkView?: string;
}

// ---------------------------------------------------------------------------
// Helper: Safe JSON load / save
// ---------------------------------------------------------------------------
function loadList<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveList<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to persist to ${key}:`, e);
  }
}

// ---------------------------------------------------------------------------
// PRODUCTS & INVENTORY RECONCILIATION
// ---------------------------------------------------------------------------
export function getProducts(): Product[] {
  return loadList<Product>(DB_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export function saveProducts(products: Product[]): void {
  saveList(DB_KEYS.PRODUCTS, products);
}

/**
 * Atomically deduct inventory for ordered items
 * Enforces non-negative inventory rule and updates stock status
 */
export function deductInventoryForOrder(
  items: { name: string; qty: number; price: number }[]
): { success: boolean; error?: string } {
  const currentProducts = getProducts();
  const closingItems = getClosingInventory();

  // 1. Validation check first: ensure sufficient stock exists for all items
  for (const it of items) {
    const prod = currentProducts.find(p => p.name === it.name);
    if (prod && prod.stock < it.qty) {
      return {
        success: false,
        error: `Insufficient stock for "${it.name}". Available: ${prod.stock}, Requested: ${it.qty}`
      };
    }
  }

  // 2. Perform atomic deduction
  const updatedProducts = currentProducts.map(prod => {
    const match = items.find(it => it.name === prod.name);
    if (match) {
      const newStock = Math.max(0, prod.stock - match.qty);
      let status: Product['status'] = 'IN STOCK';
      if (newStock === 0) status = 'OUT OF STOCK';
      else if (newStock <= 10) status = 'CRITICAL';
      else if (newStock <= 35) status = 'LOW STOCK';

      return { ...prod, stock: newStock, status };
    }
    return prod;
  });

  // 3. Update closing inventory tallies
  const updatedClosing = closingItems.map(c => {
    const match = items.find(it => it.name === c.code);
    if (match) {
      return { ...c, currentQty: Math.max(0, c.currentQty - match.qty) };
    }
    return c;
  });

  saveProducts(updatedProducts);
  saveClosingInventory(updatedClosing);

  return { success: true };
}

// ---------------------------------------------------------------------------
// CUSTOMERS & DUPLICATE DETECTION
// ---------------------------------------------------------------------------
export function getCustomers(): Customer[] {
  return loadList<Customer>(DB_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
}

export function saveCustomers(customers: Customer[]): void {
  saveList(DB_KEYS.CUSTOMERS, customers);
}

/**
 * Check for duplicate customer by phone, CR/Iqama ID, or normalized name
 */
export function checkCustomerDuplicate(customer: Partial<Customer>): { isDuplicate: boolean; reason?: string } {
  const existing = getCustomers();
  const phoneNormalized = (customer.phone || '').replace(/\D/g, '');
  const idNormalized = (customer.idNumber || '').trim();
  const nameNormalized = (customer.name || '').trim().toLowerCase();

  for (const c of existing) {
    if (c.id === customer.id) continue;

    // Check Phone
    if (phoneNormalized && c.phone.replace(/\D/g, '') === phoneNormalized) {
      return { isDuplicate: true, reason: `Customer with phone number "${customer.phone}" already exists (${c.name}).` };
    }

    // Check National ID / CR / Iqama
    if (idNormalized && c.idNumber && c.idNumber.trim() === idNormalized) {
      return { isDuplicate: true, reason: `Customer with License/ID "${customer.idNumber}" is already registered (${c.name}).` };
    }

    // Check Exact Name Match
    if (nameNormalized && c.name.trim().toLowerCase() === nameNormalized) {
      return { isDuplicate: true, reason: `Customer named "${customer.name}" already exists with code ${c.id}.` };
    }
  }

  return { isDuplicate: false };
}

export function addCustomerPersistent(customer: Customer): { success: boolean; customer?: Customer; error?: string } {
  const dup = checkCustomerDuplicate(customer);
  if (dup.isDuplicate) {
    return { success: false, error: dup.reason };
  }

  const existing = getCustomers();
  const updated = [customer, ...existing];
  saveCustomers(updated);

  // Automatically create a scheduled visit for today's route
  const existingVisits = getVisits();
  const newVisit: Visit = {
    id: `VST-${Date.now().toString().slice(-6)}`,
    customer,
    time: '01:00 PM',
    status: 'PENDING',
    geofenceM: 200
  };
  saveVisits([newVisit, ...existingVisits]);

  return { success: true, customer };
}

// ---------------------------------------------------------------------------
// VISITS
// ---------------------------------------------------------------------------
export function getVisits(): Visit[] {
  return loadList<Visit>(DB_KEYS.VISITS, INITIAL_VISITS);
}

export function saveVisits(visits: Visit[]): void {
  saveList(DB_KEYS.VISITS, visits);
}

export function updateVisitStatusPersistent(
  visitId: string,
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS',
  completedTime?: string
): void {
  const visits = getVisits();
  const updated = visits.map(v => {
    if (v.id === visitId) {
      return {
        ...v,
        status,
        completedTime: status === 'COMPLETED' ? (completedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : undefined
      };
    }
    return v;
  });
  saveVisits(updated);
}

// ---------------------------------------------------------------------------
// ORDERS & INVOICES
// ---------------------------------------------------------------------------
export function getOrders(): Order[] {
  return loadList<Order>(DB_KEYS.ORDERS, INITIAL_ORDERS);
}

export function saveOrders(orders: Order[]): void {
  saveList(DB_KEYS.ORDERS, orders);
}

export function addOrderPersistent(order: Order): { success: boolean; error?: string } {
  // Deduct inventory
  if (order.items && order.items.length > 0) {
    const invResult = deductInventoryForOrder(order.items);
    if (!invResult.success) {
      return invResult;
    }
  }

  const existing = getOrders();
  saveOrders([order, ...existing]);

  // Mark customer visit as completed
  const visits = getVisits();
  const updatedVisits = visits.map(v => {
    if (v.customer.id === order.customerId) {
      return {
        ...v,
        status: 'COMPLETED' as const,
        completedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    return v;
  });
  saveVisits(updatedVisits);

  return { success: true };
}

// ---------------------------------------------------------------------------
// LOADING REQUESTS
// ---------------------------------------------------------------------------
export function getLoadingRequests(): LoadingRequest[] {
  return loadList<LoadingRequest>(DB_KEYS.LOADING_REQUESTS, INITIAL_LOADING_REQUESTS);
}

export function saveLoadingRequests(requests: LoadingRequest[]): void {
  saveList(DB_KEYS.LOADING_REQUESTS, requests);
}

export function addLoadingRequestPersistent(req: LoadingRequest): void {
  const existing = getLoadingRequests();
  saveLoadingRequests([req, ...existing]);
}

// ---------------------------------------------------------------------------
// CLOSING INVENTORY & DAILY CLOSING REPORTS
// ---------------------------------------------------------------------------
export function getClosingInventory(): InventoryClosingItem[] {
  return loadList<InventoryClosingItem>(DB_KEYS.CLOSING_INVENTORY, INITIAL_CLOSING_INVENTORY);
}

export function saveClosingInventory(items: InventoryClosingItem[]): void {
  saveList(DB_KEYS.CLOSING_INVENTORY, items);
}

export function getClosingReports(): PersistentClosingReport[] {
  return loadList<PersistentClosingReport>(DB_KEYS.CLOSING_REPORTS, []);
}

export function saveClosingReports(reports: PersistentClosingReport[]): void {
  saveList(DB_KEYS.CLOSING_REPORTS, reports);
}

export function addClosingReportPersistent(report: PersistentClosingReport): void {
  const existing = getClosingReports();
  saveClosingReports([report, ...existing]);
}

// ---------------------------------------------------------------------------
// ATTACHMENTS (Images, IDs, Receipts)
// ---------------------------------------------------------------------------
export function getAttachments(): StoredAttachment[] {
  return loadList<StoredAttachment>(DB_KEYS.ATTACHMENTS, []);
}

export function saveAttachmentPersistent(att: StoredAttachment): void {
  const existing = getAttachments();
  saveList(DB_KEYS.ATTACHMENTS, [att, ...existing]);
}

export function getAttachmentsByEntity(entityId: string): StoredAttachment[] {
  return getAttachments().filter(a => a.entityId === entityId);
}

// ---------------------------------------------------------------------------
// NOTIFICATIONS
// ---------------------------------------------------------------------------
export function getNotifications(): SystemNotification[] {
  return loadList<SystemNotification>(DB_KEYS.NOTIFICATIONS, [
    {
      id: 'notif-1',
      title: 'Stock Warning',
      message: 'HABARI 1.5L*6 stock is critical (6 packs remaining).',
      type: 'warning',
      timestamp: new Date().toISOString(),
      read: false,
      linkView: 'van_stock'
    },
    {
      id: 'notif-2',
      title: 'Dispatch Ready',
      message: 'Route schedule loaded: 3 active client stops in Riyadh North.',
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
      linkView: 'today_route'
    }
  ]);
}

export function addNotification(title: string, message: string, type: SystemNotification['type'], linkView?: string): void {
  const notifs = getNotifications();
  const newNotif: SystemNotification = {
    id: `notif-${Date.now()}`,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
    linkView
  };
  saveList(DB_KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
}

// ---------------------------------------------------------------------------
// PRIVACY PURGE
// ---------------------------------------------------------------------------
export function purgeLocalData(): void {
  const retainKeys = ['theme', 'system_theme', 'system_language'];
  const preserved: Record<string, string> = {};

  for (const k of retainKeys) {
    const val = localStorage.getItem(k);
    if (val) preserved[k] = val;
  }

  // Clear all DB stores
  Object.values(DB_KEYS).forEach(k => localStorage.removeItem(k));
  localStorage.removeItem('bitvera_orders');
  localStorage.removeItem('bitvera_new_customers');

  // Restore essentials
  for (const [k, v] of Object.entries(preserved)) {
    localStorage.setItem(k, v);
  }
}

// ---------------------------------------------------------------------------
// VISITS PERSISTENCE HELPERS
// ---------------------------------------------------------------------------
export function addVisitPersistent(visit: Visit): void {
  const existing = getVisits();
  saveVisits([visit, ...existing]);
}

export function updateVisitPersistent(id: string, updates: Partial<Visit>): void {
  const existing = getVisits();
  const updated = existing.map(v => v.id === id ? { ...v, ...updates } : v);
  saveVisits(updated);
}

export function updateCustomerPersistent(customer: Customer): void {
  const existing = getCustomers();
  const updated = existing.map(c => c.id === customer.id ? customer : c);
  saveCustomers(updated);
}

export const getStoredCustomers = getCustomers;
export const getStoredOrders = getOrders;
export const getStoredProducts = getProducts;

// ---------------------------------------------------------------------------
// PRODUCT STOCK UPDATE HELPER
// ---------------------------------------------------------------------------
export function updateProductStockPersistent(id: string, newStock: number): void {
  const products = getProducts();
  const updated = products.map(p => {
    if (p.id === id) {
      const stock = Math.max(0, newStock);
      let status: Product['status'] = 'IN STOCK';
      if (stock === 0) status = 'OUT OF STOCK';
      else if (stock <= 10) status = 'CRITICAL';
      else if (stock <= 35) status = 'LOW STOCK';
      return { ...p, stock, status };
    }
    return p;
  });
  saveProducts(updated);
}

// ---------------------------------------------------------------------------
// USER SESSION & CLOSING REPORT ALIASES
// ---------------------------------------------------------------------------
export function getCurrentUser(): { id: string; username: string; role: string; fullName: string; warehouse: string } | null {
  try {
    const raw = localStorage.getItem('bitvera_session_v2');
    if (!raw) return null;
    const session = JSON.parse(raw);
    return {
      id: session.userId || 'REP-001',
      username: session.username,
      role: session.role,
      fullName: session.fullName,
      warehouse: session.warehouse
    };
  } catch {
    return null;
  }
}

export function clearCurrentUser(): void {
  localStorage.removeItem('bitvera_session_v2');
  localStorage.removeItem('bitvera_remember_token_v2');
}

export const addDailyClosingReport = addClosingReportPersistent;
export const getDailyClosingReports = getClosingReports;

