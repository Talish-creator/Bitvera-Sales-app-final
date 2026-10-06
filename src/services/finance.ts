/**
 * Bitvera Sales — Authoritative Financial & Tax Calculation Engine
 * 
 * Strict decimal-safe arithmetic avoiding floating-point precision errors.
 * Single source of truth across Cart, Orders, Invoices, Payments, Reports, and Closing.
 */

export interface LineItemInput {
  name: string;
  qty: number;
  price: number;
  sku?: string;
  discountPct?: number; // 0 - 100
}

export interface CalculatedLineItem {
  name: string;
  qty: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number; // before tax
  taxAmount: number;
  total: number;    // after tax
}

export interface CartCalculationResult {
  items: CalculatedLineItem[];
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  taxRatePct: number;
  taxAmount: number;
  total: number;
  itemCount: number;
}

/**
 * Decimal-safe round to fixed decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Format currency amount with proper decimals and symbol
 */
export function formatCurrencyValue(
  amount: number,
  symbol: string = '﷼',
  decimals: number = 2
): string {
  const rounded = roundTo(amount, decimals);
  const formatted = rounded.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  return `${symbol} ${formatted}`;
}

/**
 * Calculate totals for a line item
 */
export function calculateLineItem(
  item: LineItemInput,
  taxRatePct: number = 15
): CalculatedLineItem {
  const qty = Math.max(0, item.qty);
  const unitPrice = Math.max(0, item.price);
  const grossSubtotal = roundTo(qty * unitPrice, 2);
  
  const discountPct = Math.min(100, Math.max(0, item.discountPct || 0));
  const discountAmount = roundTo((grossSubtotal * discountPct) / 100, 2);
  const netSubtotal = roundTo(grossSubtotal - discountAmount, 2);
  
  const taxAmount = roundTo((netSubtotal * taxRatePct) / 100, 2);
  const total = roundTo(netSubtotal + taxAmount, 2);

  return {
    name: item.name,
    qty,
    unitPrice,
    discountAmount,
    subtotal: netSubtotal,
    taxAmount,
    total
  };
}

/**
 * Authoritative cart and order totals calculation
 */
export function calculateCart(
  items: LineItemInput[],
  taxTemplate: string = 'Sales VAT 15%',
  overallDiscountPct: number = 0
): CartCalculationResult {
  // Determine tax rate
  let taxRatePct = 0;
  if (taxTemplate.includes('15')) {
    taxRatePct = 15;
  } else if (taxTemplate.toLowerCase().includes('zero') || taxTemplate.toLowerCase().includes('0')) {
    taxRatePct = 0;
  } else if (taxTemplate.toLowerCase().includes('exempt')) {
    taxRatePct = 0;
  }

  const calculatedItems = items.map(item => calculateLineItem(item, taxRatePct));

  const subtotalGross = calculatedItems.reduce((acc, it) => acc + (it.qty * it.unitPrice), 0);
  const itemDiscounts = calculatedItems.reduce((acc, it) => acc + it.discountAmount, 0);
  
  const subtotalAfterItemDiscounts = roundTo(subtotalGross - itemDiscounts, 2);
  
  // Overall order discount
  const clampedOverallDiscount = Math.min(100, Math.max(0, overallDiscountPct));
  const overallDiscountAmount = roundTo((subtotalAfterItemDiscounts * clampedOverallDiscount) / 100, 2);
  const totalDiscount = roundTo(itemDiscounts + overallDiscountAmount, 2);
  
  const taxableAmount = roundTo(subtotalGross - totalDiscount, 2);
  const taxAmount = roundTo((taxableAmount * taxRatePct) / 100, 2);
  const grandTotal = roundTo(taxableAmount + taxAmount, 2);
  
  const itemCount = calculatedItems.reduce((acc, it) => acc + it.qty, 0);

  return {
    items: calculatedItems,
    subtotal: roundTo(subtotalGross, 2),
    discountTotal: totalDiscount,
    taxableAmount,
    taxRatePct,
    taxAmount,
    total: grandTotal,
    itemCount
  };
}

/**
 * Convert an amount from base SAR to foreign target currency
 */
export function convertFromSAR(
  amountSAR: number,
  rate: number,
  decimals: number = 2
): number {
  return roundTo(amountSAR * rate, decimals);
}

/**
 * Convert an amount from foreign currency back to base SAR
 */
export function convertToSAR(
  foreignAmount: number,
  rate: number,
  decimals: number = 2
): number {
  if (rate <= 0) return 0;
  return roundTo(foreignAmount / rate, 2);
}

/**
 * Check if split payments balance against total order amount within currency precision
 */
export function isPaymentSplitBalanced(
  totalDue: number,
  cash: number,
  bank: number,
  credit: number = 0,
  decimals: number = 2
): { balanced: boolean; difference: number } {
  const sum = roundTo(cash + bank + credit, decimals);
  const target = roundTo(totalDue, decimals);
  const difference = roundTo(target - sum, decimals);
  const tolerance = decimals === 3 ? 0.001 : 0.01;
  const balanced = Math.abs(difference) <= tolerance;

  return { balanced, difference };
}
