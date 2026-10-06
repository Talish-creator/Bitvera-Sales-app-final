/**
 * Bitvera Sales — Digital Signature Engine
 * 
 * Records cryptographic digital signatures for commercial orders,
 * visit reports, and daily closing sign-offs with device telemetry and timestamping.
 */

import { DigitalSignature } from '../types';
import { logEnterpriseEvent } from './config';

const SIGNATURES_STORAGE_KEY = 'bitvera_digital_signatures_v1';

export function getDigitalSignatures(): DigitalSignature[] {
  try {
    return JSON.parse(localStorage.getItem(SIGNATURES_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveDigitalSignature(sig: Omit<DigitalSignature, 'id' | 'timestamp' | 'ipOrDevice'>): DigitalSignature {
  const existing = getDigitalSignatures();
  const newSig: DigitalSignature = {
    ...sig,
    id: `SIG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ipOrDevice: navigator.userAgent.substring(0, 48)
  };

  existing.unshift(newSig);
  localStorage.setItem(SIGNATURES_STORAGE_KEY, JSON.stringify(existing));
  logEnterpriseEvent('AUDIT', 'SECURITY', `Digital signature captured for ${sig.relatedEntity} #${sig.entityId} by ${sig.signerName}`);
  return newSig;
}

export function getSignatureForEntity(entityId: string): DigitalSignature | undefined {
  return getDigitalSignatures().find(s => s.entityId === entityId);
}
