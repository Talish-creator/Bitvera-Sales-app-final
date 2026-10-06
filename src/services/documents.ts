/**
 * Bitvera Sales — Document Center & Vault Service
 * 
 * Centralized repository for all attachments, ID cards, signed contracts,
 * invoices, and expense receipts across commercial entities.
 */

import { DocumentItem } from '../types';
import { logEnterpriseEvent } from './config';

const DOCUMENTS_STORAGE_KEY = 'bitvera_document_vault_v1';

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'DOC-2026-001',
    title: 'Commercial Registration (CR) Certificate',
    entityType: 'Customer',
    entityId: 'TC-1100',
    fileName: 'cr_test_customers_1010123456.pdf',
    fileSize: 245000,
    mimeType: 'application/pdf',
    dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
    uploadedBy: 'representative',
    uploadedAt: '2026-04-15T09:00:00Z'
  },
  {
    id: 'DOC-2026-002',
    title: 'ZATCA Tax Invoice #SINV-2026-04122',
    entityType: 'Invoice',
    entityId: 'SINV-2026-04122',
    fileName: 'invoice_SINV-2026-04122.pdf',
    fileSize: 182000,
    mimeType: 'application/pdf',
    dataUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
    uploadedBy: 'system',
    uploadedAt: '2026-05-01T10:15:00Z'
  },
  {
    id: 'DOC-2026-003',
    title: 'Fuel Station Payment Receipt',
    entityType: 'Expense',
    entityId: 'EXP-2026-001',
    fileName: 'sasco_receipt_145sar.jpg',
    fileSize: 84000,
    mimeType: 'image/jpeg',
    dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    uploadedBy: 'representative',
    uploadedAt: '2026-05-02T13:40:00Z'
  }
];

export function getDocuments(): DocumentItem[] {
  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      return INITIAL_DOCUMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DOCUMENTS;
  }
}

export function saveDocuments(docs: DocumentItem[]): void {
  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to save documents:', err);
  }
}

export function addDocument(doc: Omit<DocumentItem, 'id' | 'uploadedAt'>): DocumentItem {
  const docs = getDocuments();
  const newDoc: DocumentItem = {
    ...doc,
    id: `DOC-${new Date().getFullYear()}-${String(docs.length + 1).padStart(3, '0')}`,
    uploadedAt: new Date().toISOString()
  };
  docs.unshift(newDoc);
  saveDocuments(docs);
  logEnterpriseEvent('INFO', 'SYSTEM', `Document added: ${newDoc.title} for ${newDoc.entityType} #${newDoc.entityId}`);
  return newDoc;
}

export function getDocumentsForEntity(entityType: DocumentItem['entityType'], entityId: string): DocumentItem[] {
  return getDocuments().filter(d => d.entityType === entityType && d.entityId === entityId);
}

export function deleteDocument(docId: string): void {
  const docs = getDocuments().filter(d => d.id !== docId);
  saveDocuments(docs);
  logEnterpriseEvent('AUDIT', 'SYSTEM', `Document ${docId} deleted from vault`);
}
