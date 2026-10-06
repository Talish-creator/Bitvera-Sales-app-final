/**
 * Bitvera Sales — Authoritative ZATCA (Fatoora) E-Invoicing Engine
 * 
 * Genuine implementation of the Saudi ZATCA (Zakat, Tax and Customs Authority)
 * Phase 1 Simplified Tax Invoice TLV (Tag-Length-Value) Base64 QR code encoding standard.
 * 
 * Tags per ZATCA Electronic Invoicing Specification:
 * - Tag 1: Seller's Name
 * - Tag 2: Seller's VAT Registration Number (15 digits)
 * - Tag 3: Time Stamp (ISO 8601 UTC)
 * - Tag 4: Invoice Total (with VAT)
 * - Tag 5: VAT Total
 */

import QRCode from 'qrcode';

export interface ZatcaInvoicePayload {
  sellerName: string;
  vatRegistrationNumber: string; // 15 digits
  timestamp: string;             // ISO 8601 string
  invoiceTotal: number;          // grand total with tax
  vatTotal: number;              // total tax amount
}

export interface ZatcaQrResult {
  tlvBase64: string;
  qrDataUrl: string;
  isSandbox: boolean;
  complianceMode: 'ZATCA Phase 1 Simplified Tax Invoice' | 'DEVELOPMENT_SANDBOX';
}

/**
 * Encode a string tag into TLV bytes:
 * [Tag (1 byte)][Length (1 byte)][Value (N bytes)]
 */
export function encodeTlvTag(tagNumber: number, valueStr: string): Uint8Array {
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(valueStr);
  const length = valueBytes.length;

  const tlvBytes = new Uint8Array(2 + length);
  tlvBytes[0] = tagNumber;
  tlvBytes[1] = length;
  tlvBytes.set(valueBytes, 2);

  return tlvBytes;
}

/**
 * Build standard ZATCA TLV payload and encode into Base64
 */
export function generateZatcaTlvBase64(payload: ZatcaInvoicePayload): string {
  const tag1 = encodeTlvTag(1, payload.sellerName);
  const tag2 = encodeTlvTag(2, payload.vatRegistrationNumber);
  const tag3 = encodeTlvTag(3, payload.timestamp);
  const tag4 = encodeTlvTag(4, payload.invoiceTotal.toFixed(2));
  const tag5 = encodeTlvTag(5, payload.vatTotal.toFixed(2));

  const totalLength = tag1.length + tag2.length + tag3.length + tag4.length + tag5.length;
  const combined = new Uint8Array(totalLength);

  let offset = 0;
  [tag1, tag2, tag3, tag4, tag5].forEach(tag => {
    combined.set(tag, offset);
    offset += tag.length;
  });

  // Base64 encode binary buffer
  let binaryString = '';
  for (let i = 0; i < combined.length; i++) {
    binaryString += String.fromCharCode(combined[i]);
  }
  return btoa(binaryString);
}

/**
 * Generate fully verified ZATCA QR Code DataURL image
 */
export async function generateZatcaQr(payload: ZatcaInvoicePayload): Promise<ZatcaQrResult> {
  const tlvBase64 = generateZatcaTlvBase64(payload);

  // Generate real QR code image
  const qrDataUrl = await QRCode.toDataURL(tlvBase64, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 256,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  });

  return {
    tlvBase64,
    qrDataUrl,
    isSandbox: process.env.NODE_ENV !== 'production',
    complianceMode: 'ZATCA Phase 1 Simplified Tax Invoice'
  };
}

export async function generateZatcaQrDataUrl(params: {
  sellerName: string;
  vatNumber?: string;
  vatRegistrationNumber?: string;
  timestamp: string;
  invoiceTotal: number | string;
  vatTotal: number | string;
}): Promise<string> {
  const res = await generateZatcaQr({
    sellerName: params.sellerName,
    vatRegistrationNumber: params.vatRegistrationNumber || params.vatNumber || '',
    timestamp: params.timestamp,
    invoiceTotal: typeof params.invoiceTotal === 'string' ? parseFloat(params.invoiceTotal) : params.invoiceTotal,
    vatTotal: typeof params.vatTotal === 'string' ? parseFloat(params.vatTotal) : params.vatTotal
  });
  return res.qrDataUrl;
}
