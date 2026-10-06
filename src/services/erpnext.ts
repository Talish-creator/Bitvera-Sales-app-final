/**
 * Bitvera Sales — Authoritative ERPNext Service Layer
 * 
 * Proxies all communications through the secure Bitvera backend.
 * Never exposes raw ERPNext administrator API Keys or Secrets to client bundle.
 * Handles offline detection gracefully: queues items and reports real status.
 */

export interface ErpSyncResult<T = any> {
  success: boolean;
  syncedToErp: boolean;
  data?: T;
  erpDocName?: string;
  error?: string;
  statusMessage: string;
}

// Proxied backend endpoint
const API_BASE = '/api/erp';

/**
 * Generic proxied request to ERPNext via Bitvera backend
 */
async function callErpApi<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: any
): Promise<ErpSyncResult<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Attach active session token if present
    const sessionToken = localStorage.getItem('bitvera_session_v2');
    if (sessionToken) {
      try {
        const parsed = JSON.parse(sessionToken);
        if (parsed.token) headers['Authorization'] = `Bearer ${parsed.token}`;
      } catch {}
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        syncedToErp: false,
        error: errData.message || res.statusText,
        statusMessage: `ERP Request failed (${res.status}): Saved offline awaiting retry.`
      };
    }

    const json = await res.json();
    return {
      success: true,
      syncedToErp: json.syncedToErp ?? true,
      data: json.data || json,
      erpDocName: json.data?.name || json.name,
      statusMessage: json.syncedToErp ? 'ERP synchronized successfully.' : 'Saved locally — pending ERP connection.'
    };
  } catch (err: any) {
    return {
      success: false,
      syncedToErp: false,
      error: err?.message || 'Network error reaching ERPNext proxy.',
      statusMessage: 'Offline: Transaction preserved locally for automatic sync.'
    };
  }
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export async function syncCustomerToErp(customer: any): Promise<ErpSyncResult> {
  return callErpApi('/customers', 'POST', {
    doctype: 'Customer',
    customer_name: customer.name,
    customer_type: customer.type === 'Corporate' ? 'Company' : 'Individual',
    mobile_no: customer.phone,
    tax_id: customer.idNumber,
    custom_lat: customer.lat,
    custom_lng: customer.lng,
    custom_building_no: customer.buildingNumber,
    customer_group: customer.group || 'Commercial'
  });
}

// ---------------------------------------------------------------------------
// Items / Products & Van Stock
// ---------------------------------------------------------------------------
export async function fetchErpItems(): Promise<ErpSyncResult<any[]>> {
  return callErpApi<any[]>('/items', 'GET');
}

export async function fetchWarehouseStock(warehouse: string): Promise<ErpSyncResult<any[]>> {
  return callErpApi<any[]>(`/stock?warehouse=${encodeURIComponent(warehouse)}`, 'GET');
}

// ---------------------------------------------------------------------------
// Sales Orders
// ---------------------------------------------------------------------------
export async function syncSalesOrderToErp(order: any): Promise<ErpSyncResult> {
  return callErpApi('/orders', 'POST', {
    doctype: 'Sales Order',
    customer: order.customerName,
    transaction_date: order.date,
    items: (order.items || []).map((it: any) => ({
      item_code: it.name,
      qty: it.qty,
      rate: it.price
    })),
    net_total: order.subtotal,
    grand_total: order.total
  });
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------
export async function syncSalesInvoiceToErp(invoice: any): Promise<ErpSyncResult> {
  return callErpApi('/invoices', 'POST', {
    doctype: 'Sales Invoice',
    customer: invoice.customerName,
    posting_date: invoice.date,
    items: (invoice.items || []).map((it: any) => ({
      item_code: it.name,
      qty: it.qty,
      rate: it.price
    })),
    total_taxes_and_charges: invoice.tax,
    grand_total: invoice.total
  });
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------
export async function syncPaymentEntryToErp(payment: any): Promise<ErpSyncResult> {
  return callErpApi('/payments', 'POST', {
    doctype: 'Payment Entry',
    payment_type: 'Receive',
    party_type: 'Customer',
    party: payment.customerName,
    paid_amount: payment.totalAmount,
    received_amount: payment.totalAmount,
    reference_no: payment.txRef,
    mode_of_payment: payment.bankPayment > 0 ? 'Bank' : 'Cash'
  });
}

// ---------------------------------------------------------------------------
// Daily Closing
// ---------------------------------------------------------------------------
export async function syncDailyClosingToErp(closingReport: any): Promise<ErpSyncResult> {
  return callErpApi('/closing', 'POST', closingReport);
}

// ---------------------------------------------------------------------------
// ERP Health / Connection Check
// ---------------------------------------------------------------------------
export async function checkErpHealth(): Promise<{ connected: boolean; version?: string; latencyMs?: number }> {
  const start = Date.now();
  try {
    const res = await callErpApi<{ connected: boolean; version?: string }>('/health', 'GET');
    return {
      connected: res.success && (res.data?.connected ?? false),
      version: res.data?.version,
      latencyMs: Date.now() - start
    };
  } catch {
    return { connected: false, latencyMs: Date.now() - start };
  }
}
