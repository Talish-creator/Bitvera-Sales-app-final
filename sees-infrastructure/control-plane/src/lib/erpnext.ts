/**
 * ERPNext API Client
 * 
 * This module handles authentication and communication with the ERPNext API.
 * It uses the Token authentication method (API Key : API Secret).
 */

const ERPNEXT_URL = process.env.ERPNEXT_URL || "http://localhost:8000";
const API_KEY = process.env.ERPNEXT_API_KEY;
const API_SECRET = process.env.ERPNEXT_API_SECRET;

/**
 * Helper to build the Authorization header
 */
function getAuthHeaders(): HeadersInit {
  if (!API_KEY || !API_SECRET) {
    console.warn("ERPNext API credentials are not set in environment variables.");
    return {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };
  }

  return {
    "Authorization": `token ${API_KEY}:${API_SECRET}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  };
}

/**
 * Fetch a Document from ERPNext
 * 
 * @param doctype The Frappe DocType (e.g. "User", "Customer")
 * @param name The ID/Name of the document
 */
export async function getDocument(doctype: string, name: string) {
  const response = await fetch(
    `${ERPNEXT_URL}/api/resource/${doctype}/${encodeURIComponent(name)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${doctype} ${name}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data; // Frappe wraps responses in a `data` object
}

/**
 * Create a new Document in ERPNext
 * 
 * @param doctype The Frappe DocType
 * @param payload The document data
 */
export async function createDocument(doctype: string, payload: Record<string, any>) {
  const response = await fetch(
    `${ERPNEXT_URL}/api/resource/${doctype}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create ${doctype}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * Trigger a Frappe Whitelisted Python Method (RPC)
 * Useful for triggering the tenant onboarding scripts in the `sees_core` app.
 * 
 * @param method The dotted path to the python method (e.g., "sees_core.api.provision_tenant")
 * @param args Arguments to pass to the method
 */
export async function callMethod(method: string, args: Record<string, any> = {}) {
  const response = await fetch(
    `${ERPNEXT_URL}/api/method/${method}`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(args),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to call method ${method}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.message; // RPC calls wrap responses in a `message` object
}
