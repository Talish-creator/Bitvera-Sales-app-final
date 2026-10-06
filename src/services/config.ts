/**
 * Bitvera Sales — Enterprise Business Configuration, Feature Flags & Observability
 * 
 * Provides centralized business policy parameters and controlled feature flags.
 * Includes structured audit logging for security and observability.
 */

export interface BusinessConfig {
  vatRatePercent: number;
  maxAutonomousDiscountPercent: number; // Discounts above this require approval
  defaultGeofenceRadiusMeters: number;
  defaultCreditLimitSAR: number;
  workingCurrency: string;
  autoLockMinutes: number;
  sessionTimeoutHours: number;
  targetMonthlySAR: number;
}

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  vatRatePercent: 15,
  maxAutonomousDiscountPercent: 15,
  defaultGeofenceRadiusMeters: 200,
  defaultCreditLimitSAR: 50000,
  workingCurrency: 'SAR',
  autoLockMinutes: 15,
  sessionTimeoutHours: 8,
  targetMonthlySAR: 350000
};

export const FEATURE_FLAGS = {
  AI_ASSISTANT: true,
  ROUTE_OPTIMIZATION: true,
  COMMISSION_ENGINE: true,
  EXPENSES: true,
  ADVANCED_ANALYTICS: true,
  DIGITAL_SIGNATURES: true,
  APPROVAL_WORKFLOWS: true,
  CUSTOMER_HEALTH_SCORE: true
};

export const ENTERPRISE_TERRITORIES = [
  { id: 'T-RUH-N', name: 'Riyadh North', city: 'Riyadh', targetMonthlySAR: 180000 },
  { id: 'T-RUH-S', name: 'Riyadh South', city: 'Riyadh', targetMonthlySAR: 140000 },
  { id: 'T-JED-W', name: 'Jeddah Coastal', city: 'Jeddah', targetMonthlySAR: 160000 },
  { id: 'T-DMM-E', name: 'Dammam Eastern', city: 'Dammam', targetMonthlySAR: 120000 }
];

const CONFIG_STORAGE_KEY = 'bitvera_business_config_v1';

export function getBusinessConfig(): BusinessConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) return { ...DEFAULT_BUSINESS_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_BUSINESS_CONFIG;
}

export function updateBusinessConfig(patch: Partial<BusinessConfig>): BusinessConfig {
  const current = getBusinessConfig();
  const updated = { ...current, ...patch };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// ---------------------------------------------------------------------------
// Structured Observability Logging
// ---------------------------------------------------------------------------
export interface StructuredLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';
  category: 'AUTH' | 'ORDER' | 'PAYMENT' | 'SYNC' | 'INVENTORY' | 'SYSTEM' | 'SECURITY';
  message: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

const LOG_STORAGE_KEY = 'bitvera_observability_logs_v1';
const MAX_LOG_ENTRIES = 250;

export function logEnterpriseEvent(
  level: 'INFO' | 'WARN' | 'ERROR' | 'AUDIT',
  category: 'AUTH' | 'ORDER' | 'PAYMENT' | 'SYNC' | 'INVENTORY' | 'SYSTEM' | 'SECURITY',
  message: string,
  metadata?: Record<string, any>
): void {
  try {
    const userJson = localStorage.getItem('bitvera_current_user_v2');
    let user = { username: 'anonymous', role: 'unknown' };
    if (userJson) {
      try { user = JSON.parse(userJson); } catch {}
    }

    const entry: StructuredLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      userName: user.username,
      metadata
    };

    const existing: StructuredLogEntry[] = JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
    existing.unshift(entry);
    if (existing.length > MAX_LOG_ENTRIES) existing.pop();
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to write structured log:', err);
  }
}

export function getStructuredLogs(): StructuredLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}
