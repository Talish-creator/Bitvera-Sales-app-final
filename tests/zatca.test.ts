import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeTlvTag,
  generateZatcaTlvBase64,
  generateZatcaQrDataUrl
} from '../src/services/zatca';

test('ZATCA Engine: encodeTlvTag produces valid Tag-Length-Value bytes', () => {
  const seller = 'Bitvera';
  const tlv = encodeTlvTag(1, seller);

  // Tag should be 1
  assert.equal(tlv[0], 1);
  // Length should be 7
  assert.equal(tlv[1], 7);
  // Value should match UTF-8 bytes of 'Bitvera'
  const text = new TextDecoder().decode(tlv.slice(2));
  assert.equal(text, 'Bitvera');
});

test('ZATCA Engine: generateZatcaTlvBase64 encodes all 5 required invoice tags', () => {
  const base64 = generateZatcaTlvBase64({
    sellerName: 'Bitvera ERP IT Solution',
    vatRegistrationNumber: '310123456700003',
    timestamp: '2026-06-10T12:00:00Z',
    invoiceTotal: 454.25,
    vatTotal: 59.25
  });

  assert.ok(base64);
  assert.equal(typeof base64, 'string');
  assert.ok(base64.length > 20);

  // Decode Base64 and verify TLV tags 1 to 5 are present
  const binary = Buffer.from(base64, 'base64');
  let offset = 0;
  const tagsFound: number[] = [];

  while (offset < binary.length) {
    const tag = binary[offset++];
    const length = binary[offset++];
    const val = binary.subarray(offset, offset + length).toString('utf-8');
    offset += length;
    tagsFound.push(tag);
  }

  assert.deepEqual(tagsFound, [1, 2, 3, 4, 5]);
});

test('ZATCA Engine: generateZatcaQrDataUrl produces a valid QR data URL', async () => {
  const dataUrl = await generateZatcaQrDataUrl({
    sellerName: 'Bitvera ERP IT Solution',
    vatRegistrationNumber: '310123456700003',
    timestamp: '2026-06-10T12:00:00Z',
    invoiceTotal: 454.25,
    vatTotal: 59.25
  });

  assert.ok(dataUrl.startsWith('data:image/png;base64,'));
  assert.ok(dataUrl.length > 100);
});
