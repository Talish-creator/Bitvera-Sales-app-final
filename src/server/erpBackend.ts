/**
 * Bitvera Sales — Authoritative Server-Side ERPNext Integration Gateway
 * 
 * Runs EXCLUSIVELY on the server (Node.js / Express / Vite dev server middleware).
 * Never leaks API secrets to the client browser.
 * Performs genuine authenticated HTTP requests to ERPNext REST API.
 */

import fs from 'fs';
import path from 'path';

export interface ServerErpConfig {
  url: string;
  apiKey: string;
  apiSecret: string; // Server-only secret
  company: string;
  defaultWarehouse: string;
  defaultCustomerGroup: string;
  defaultTerritory: string;
  defaultPriceList: string;
  defaultCurrency: string;
  syncSettings: {
    autoSyncMode: 'manual' | 'auto_15m' | 'auto_30m' | 'auto_1h';
    modules: Record<string, {
      enabled: boolean;
      direction: 'erp_to_bitvera' | 'bitvera_to_erp' | 'two_way' | 'disabled';
    }>;
  };
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastTestedAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
  serverVersion?: string;
}

const CONFIG_FILE = path.resolve(process.cwd(), '.erp_config.json');

const DEFAULT_SERVER_CONFIG: ServerErpConfig = {
  url: process.env.ERPNEXT_URL || '',
  apiKey: process.env.ERPNEXT_API_KEY || '',
  apiSecret: process.env.ERPNEXT_API_SECRET || '',
  company: 'Bitvera Distribution Co.',
  defaultWarehouse: 'Sadus Stock Riyadh - BDC',
  defaultCustomerGroup: 'Commercial Wholesale',
  defaultTerritory: 'Saudi Arabia',
  defaultPriceList: 'Standard Selling',
  defaultCurrency: 'SAR',
  syncSettings: {
    autoSyncMode: 'manual',
    modules: {
      customers: { enabled: true, direction: 'two_way' },
      products: { enabled: true, direction: 'erp_to_bitvera' },
      inventory: { enabled: true, direction: 'erp_to_bitvera' },
      orders: { enabled: true, direction: 'bitvera_to_erp' },
      invoices: { enabled: true, direction: 'erp_to_bitvera' },
      payments: { enabled: true, direction: 'bitvera_to_erp' },
      visits: { enabled: false, direction: 'disabled' },
      loading: { enabled: false, direction: 'disabled' }
    }
  },
  connectionStatus: 'DISCONNECTED'
};

/**
 * Loads server config from disk or defaults
 */
export function loadServerConfig(): ServerErpConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_SERVER_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('[ERP Backend] Error reading config file:', err);
  }
  return { ...DEFAULT_SERVER_CONFIG };
}

/**
 * Saves server config to disk securely
 */
export function saveServerConfig(cfg: ServerErpConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('[ERP Backend] Error saving config file:', err);
  }
}

/**
 * Sanitizes config before sending to browser.
 * NEVER returns apiSecret in plain text.
 */
export function sanitizeClientConfig(cfg: ServerErpConfig) {
  return {
    url: cfg.url,
    apiKey: cfg.apiKey,
    hasSecret: Boolean(cfg.apiSecret && cfg.apiSecret.trim().length > 0),
    maskedSecret: cfg.apiSecret ? '••••••••••••••••' : '',
    company: cfg.company,
    defaultWarehouse: cfg.defaultWarehouse,
    defaultCustomerGroup: cfg.defaultCustomerGroup,
    defaultTerritory: cfg.defaultTerritory,
    defaultPriceList: cfg.defaultPriceList,
    defaultCurrency: cfg.defaultCurrency,
    syncSettings: cfg.syncSettings,
    connectionStatus: cfg.connectionStatus,
    lastTestedAt: cfg.lastTestedAt,
    lastSuccessAt: cfg.lastSuccessAt,
    lastError: cfg.lastError,
    serverVersion: cfg.serverVersion
  };
}

/**
 * Helper to build Frappe Token Auth headers
 */
function getErpHeaders(apiKey: string, apiSecret: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  if (apiKey && apiSecret) {
    headers['Authorization'] = `token ${apiKey}:${apiSecret}`;
  }
  return headers;
}

/**
 * Real authenticated test connection request to ERPNext REST API
 */
export async function testErpConnection(url: string, apiKey: string, apiSecret: string): Promise<{
  connected: boolean;
  status: number;
  user?: string;
  version?: string;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  if (!url || !url.trim()) {
    return {
      connected: false,
      status: 400,
      latencyMs: 0,
      error: 'ERPNext Base URL is required.'
    };
  }

  if (!apiKey || !apiSecret) {
    return {
      connected: false,
      status: 401,
      latencyMs: 0,
      error: 'ERPNext API Key and API Secret are required.'
    };
  }

  const cleanUrl = url.replace(/\/+$/, '');
  const testEndpoint = `${cleanUrl}/api/method/frappe.auth.get_logged_user`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(testEndpoint, {
      method: 'GET',
      headers: getErpHeaders(apiKey, apiSecret),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (res.status === 200) {
      const data = await res.json().catch(() => ({}));
      const loggedUser = data.message || 'Authenticated User';

      // Optionally fetch version
      let version = 'ERPNext v15';
      try {
        const vRes = await fetch(`${cleanUrl}/api/method/frappe.utils.change_log.get_versions`, {
          method: 'GET',
          headers: getErpHeaders(apiKey, apiSecret)
        });
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.message?.erpnext) version = `ERPNext v${vData.message.erpnext}`;
        }
      } catch {}

      return {
        connected: true,
        status: 200,
        user: loggedUser,
        version,
        latencyMs
      };
    }

    if (res.status === 401) {
      return {
        connected: false,
        status: 401,
        latencyMs,
        error: 'ERPNext authentication failed: Invalid API Key or API Secret.'
      };
    }

    if (res.status === 403) {
      return {
        connected: false,
        status: 403,
        latencyMs,
        error: 'ERPNext permission denied: User lacks API access permissions.'
      };
    }

    if (res.status === 404) {
      return {
        connected: false,
        status: 404,
        latencyMs,
        error: 'ERPNext endpoint not found: Check Base URL hostname.'
      };
    }

    if (res.status === 429) {
      return {
        connected: false,
        status: 429,
        latencyMs,
        error: 'ERPNext rate limit exceeded: Please wait before retrying.'
      };
    }

    return {
      connected: false,
      status: res.status,
      latencyMs,
      error: `ERPNext returned HTTP ${res.status}: ${res.statusText}`
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    if (err.name === 'AbortError') {
      return {
        connected: false,
        status: 504,
        latencyMs,
        error: 'ERPNext connection timed out after 6000ms.'
      };
    }
    return {
      connected: false,
      status: 503,
      latencyMs,
      error: `ERPNext host is unreachable: ${err.message || 'Network error'}`
    };
  }
}

/**
 * Handle incoming requests to /api/erp/*
 */
export async function handleErpApiRequest(req: any, res: any): Promise<void> {
  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method;

  // JSON helper
  const sendJson = (status: number, data: any) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // Helper to parse JSON body
  const parseBody = async (): Promise<any> => {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', (chunk: any) => { body += chunk; });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
    });
  };

  try {
    // 1. GET /api/erp/config
    if (pathname === '/api/erp/config' && method === 'GET') {
      const cfg = loadServerConfig();
      return sendJson(200, { success: true, data: sanitizeClientConfig(cfg) });
    }

    // 2. POST /api/erp/config
    if (pathname === '/api/erp/config' && method === 'POST') {
      const body = await parseBody();
      const current = loadServerConfig();

      // Only update secret if provided and not masked
      let newSecret = current.apiSecret;
      if (body.apiSecret && !body.apiSecret.includes('••••')) {
        newSecret = body.apiSecret.trim();
      }

      const updated: ServerErpConfig = {
        ...current,
        url: body.url !== undefined ? body.url.trim() : current.url,
        apiKey: body.apiKey !== undefined ? body.apiKey.trim() : current.apiKey,
        apiSecret: newSecret,
        company: body.company || current.company,
        defaultWarehouse: body.defaultWarehouse || current.defaultWarehouse,
        defaultCustomerGroup: body.defaultCustomerGroup || current.defaultCustomerGroup,
        defaultTerritory: body.defaultTerritory || current.defaultTerritory,
        defaultPriceList: body.defaultPriceList || current.defaultPriceList,
        defaultCurrency: body.defaultCurrency || current.defaultCurrency,
        syncSettings: body.syncSettings || current.syncSettings
      };

      saveServerConfig(updated);
      return sendJson(200, {
        success: true,
        message: 'ERPNext server configuration updated securely.',
        data: sanitizeClientConfig(updated)
      });
    }

    // 3. POST /api/erp/test-connection
    if (pathname === '/api/erp/test-connection' && method === 'POST') {
      const body = await parseBody();
      const current = loadServerConfig();

      const urlToTest = body.url || current.url;
      const keyToTest = body.apiKey || current.apiKey;
      let secretToTest = current.apiSecret;
      if (body.apiSecret && !body.apiSecret.includes('••••')) {
        secretToTest = body.apiSecret.trim();
      }

      const result = await testErpConnection(urlToTest, keyToTest, secretToTest);

      // Update state in server config
      current.connectionStatus = result.connected ? 'CONNECTED' : (urlToTest ? 'ERROR' : 'DISCONNECTED');
      current.lastTestedAt = new Date().toISOString();
      if (result.connected) {
        current.lastSuccessAt = new Date().toISOString();
        current.lastError = undefined;
        current.serverVersion = result.version;
      } else {
        current.lastError = result.error;
      }
      saveServerConfig(current);

      return sendJson(result.connected ? 200 : (result.status || 503), {
        success: result.connected,
        ...result,
        config: sanitizeClientConfig(current)
      });
    }

    // 4. POST /api/erp/disconnect
    if (pathname === '/api/erp/disconnect' && method === 'POST') {
      const current = loadServerConfig();
      current.connectionStatus = 'DISCONNECTED';
      current.lastTestedAt = new Date().toISOString();
      current.lastError = 'ERPNext connection cleared by administrator.';
      // Note: We keep company/warehouse preferences so reconnection is smooth, but credentials can be wiped if requested
      if (req.headers['x-wipe-credentials'] === 'true') {
        current.apiKey = '';
        current.apiSecret = '';
      }
      saveServerConfig(current);

      return sendJson(200, {
        success: true,
        message: 'ERPNext integration disconnected. Standalone operations active.',
        data: sanitizeClientConfig(current)
      });
    }

    // 5. GET /api/erp/meta
    if (pathname === '/api/erp/meta' && method === 'GET') {
      const current = loadServerConfig();
      if (current.connectionStatus !== 'CONNECTED' || !current.url) {
        // Return standard presets with unverified note
        return sendJson(200, {
          success: true,
          isLive: false,
          companies: ['Bitvera Distribution Co.', 'Al-Ajial Commercial Group'],
          warehouses: ['Sadus Stock Riyadh - BDC', 'Jeddah Coastal Hub - BDC', 'Dammam Van 01 Depot'],
          customerGroups: ['Commercial Wholesale', 'Key Account', 'Retail Grocery', 'HORECA'],
          territories: ['Saudi Arabia', 'Riyadh Central', 'Western Region', 'Eastern Province'],
          priceLists: ['Standard Selling', 'Wholesale Bulk Tier 1', 'Van Route Cash'],
          currencies: ['SAR', 'USD', 'EUR', 'AED']
        });
      }

      // Query real ERPNext metadata
      try {
        const cleanUrl = current.url.replace(/\/+$/, '');
        const headers = getErpHeaders(current.apiKey, current.apiSecret);

        const fetchDocNames = async (doctype: string): Promise<string[]> => {
          try {
            const res = await fetch(`${cleanUrl}/api/resource/${encodeURIComponent(doctype)}?limit_page_length=20`, { headers });
            if (res.ok) {
              const j = await res.json();
              return (j.data || []).map((d: any) => d.name);
            }
          } catch {}
          return [];
        };

        const [companies, warehouses, customerGroups, territories, priceLists] = await Promise.all([
          fetchDocNames('Company'),
          fetchDocNames('Warehouse'),
          fetchDocNames('Customer Group'),
          fetchDocNames('Territory'),
          fetchDocNames('Price List')
        ]);

        return sendJson(200, {
          success: true,
          isLive: true,
          companies: companies.length ? companies : ['Bitvera Distribution Co.'],
          warehouses: warehouses.length ? warehouses : ['Sadus Stock Riyadh - BDC'],
          customerGroups: customerGroups.length ? customerGroups : ['Commercial Wholesale'],
          territories: territories.length ? territories : ['Saudi Arabia'],
          priceLists: priceLists.length ? priceLists : ['Standard Selling'],
          currencies: ['SAR', 'USD', 'EUR', 'AED']
        });
      } catch (err: any) {
        return sendJson(200, {
          success: true,
          isLive: false,
          error: err.message,
          companies: ['Bitvera Distribution Co.'],
          warehouses: ['Sadus Stock Riyadh - BDC'],
          customerGroups: ['Commercial Wholesale'],
          territories: ['Saudi Arabia'],
          priceLists: ['Standard Selling'],
          currencies: ['SAR']
        });
      }
    }

    // 6. POST /api/erp/sync/preview (Dry run)
    if (pathname === '/api/erp/sync/preview' && method === 'POST') {
      const body = await parseBody();
      const current = loadServerConfig();

      const { customers = [], products = [], orders = [], payments = [] } = body;

      // Calculate preview numbers
      const custToCreate = customers.filter((c: any) => !c.erpnext_id).length;
      const custToUpdate = customers.filter((c: any) => Boolean(c.erpnext_id)).length;

      const prodToUpdate = products.length;

      const ordersToSubmit = orders.filter((o: any) => !o.erpnext_id).length;
      const paymentsToSubmit = payments.filter((p: any) => !p.erpnext_id).length;

      return sendJson(200, {
        success: true,
        dryRun: true,
        connectionStatus: current.connectionStatus,
        preview: {
          customers: { toCreate: custToCreate, toUpdate: custToUpdate, duplicates: 0, conflicts: 0 },
          products: { toCreate: 0, toUpdate: prodToUpdate, conflicts: 0 },
          orders: { toSubmit: ordersToSubmit, alreadySynced: orders.length - ordersToSubmit },
          payments: { toSubmit: paymentsToSubmit, alreadySynced: payments.length - paymentsToSubmit }
        },
        estimatedTimeSec: Math.max(1, Math.ceil((custToCreate + ordersToSubmit + paymentsToSubmit) * 0.4))
      });
    }

    // 7. POST /api/erp/sync/record (Selective single-record sync)
    if (pathname === '/api/erp/sync/record' && method === 'POST') {
      const body = await parseBody();
      const current = loadServerConfig();

      const { entityType, entity } = body;
      if (!entityType || !entity) {
        return sendJson(400, { success: false, error: 'entityType and entity are required.' });
      }

      // If ERPNext is not connected, safely reject without pretending
      if (current.connectionStatus !== 'CONNECTED' || !current.url) {
        return sendJson(503, {
          success: false,
          sync_status: 'FAILED',
          error: 'ERPNext is disconnected. Record preserved locally.'
        });
      }

      const cleanUrl = current.url.replace(/\/+$/, '');
      const headers = getErpHeaders(current.apiKey, current.apiSecret);

      try {
        let doctype = 'Customer';
        let payload: any = {};
        let docId = entity.erpnext_id;

        if (entityType === 'Customer') {
          doctype = 'Customer';
          payload = {
            doctype: 'Customer',
            customer_name: entity.name,
            customer_type: entity.type === 'Corporate' ? 'Company' : 'Individual',
            mobile_no: entity.phone,
            tax_id: entity.idNumber,
            customer_group: entity.group || current.defaultCustomerGroup || 'Commercial',
            territory: entity.territory || current.defaultTerritory || 'Saudi Arabia',
            custom_bitvera_id: entity.id
          };
        } else if (entityType === 'Order') {
          doctype = 'Sales Order';
          payload = {
            doctype: 'Sales Order',
            company: current.company,
            customer: entity.customerName,
            transaction_date: entity.date ? entity.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
            items: (entity.items || []).map((it: any) => ({
              item_code: it.name,
              qty: it.qty,
              rate: it.price
            })),
            custom_bitvera_order_id: entity.id
          };
        } else if (entityType === 'Payment') {
          doctype = 'Payment Entry';
          payload = {
            doctype: 'Payment Entry',
            payment_type: 'Receive',
            party_type: 'Customer',
            party: entity.customerName,
            paid_amount: entity.totalAmount || entity.amount,
            received_amount: entity.totalAmount || entity.amount,
            reference_no: entity.txRef || `BIT-REF-${Date.now()}`,
            mode_of_payment: entity.bankPayment > 0 ? 'Bank' : 'Cash',
            custom_bitvera_payment_id: entity.id
          };
        }

        // Call ERPNext REST endpoint
        const endpoint = docId 
          ? `${cleanUrl}/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(docId)}`
          : `${cleanUrl}/api/resource/${encodeURIComponent(doctype)}`;

        const methodToUse = docId ? 'PUT' : 'POST';

        const erpRes = await fetch(endpoint, {
          method: methodToUse,
          headers,
          body: JSON.stringify(payload)
        });

        if (!erpRes.ok) {
          const errText = await erpRes.text();
          let msg = `ERPNext returned HTTP ${erpRes.status}`;
          try {
            const j = JSON.parse(errText);
            if (j.message) msg = j.message;
            if (j._server_messages) msg = j._server_messages;
          } catch {}

          return sendJson(erpRes.status, {
            success: false,
            sync_status: 'FAILED',
            error: msg
          });
        }

        const resData = await erpRes.json();
        const erpDocName = resData.data?.name || `ERP-${Date.now()}`;

        return sendJson(200, {
          success: true,
          sync_status: 'SYNCED',
          erpnext_id: erpDocName,
          erpnext_name: erpDocName,
          last_synced_at: new Date().toISOString()
        });

      } catch (err: any) {
        return sendJson(500, {
          success: false,
          sync_status: 'FAILED',
          error: `Error communicating with ERPNext: ${err.message}`
        });
      }
    }

    // 8. GET /api/erp/diagnostics
    if (pathname === '/api/erp/diagnostics' && method === 'GET') {
      const current = loadServerConfig();
      const test = await testErpConnection(current.url, current.apiKey, current.apiSecret);

      return sendJson(200, {
        success: true,
        connection: test.connected ? 'ONLINE' : 'OFFLINE',
        latencyMs: test.latencyMs,
        authStatus: test.connected ? 'VERIFIED' : 'UNVERIFIED',
        user: test.user || 'None',
        version: test.version || 'Unknown',
        company: current.company,
        defaultWarehouse: current.defaultWarehouse,
        timestamp: new Date().toISOString(),
        error: test.error
      });
    }

    // Not found
    return sendJson(404, { success: false, error: `Endpoint ${pathname} not found.` });

  } catch (globalErr: any) {
    return sendJson(500, { success: false, error: globalErr.message || 'Server error.' });
  }
}
