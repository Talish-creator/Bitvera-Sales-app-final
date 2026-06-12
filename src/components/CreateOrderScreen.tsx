import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { Search, Scan, Minus, Plus, AlertCircle, ShoppingCart } from 'lucide-react';
import { Product, ViewState } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface CreateOrderScreenProps {
  products: Product[];
  customerName: string;
  customerId: string;
  onNavigate: (view: ViewState) => void;
  onSetOrderAmount: (amount: number, tax: number, subtotal: number, items: { name: string; qty: number; price: number }[]) => void;
}

export default function CreateOrderScreen({
  products,
  customerName,
  customerId,
  onNavigate,
  onSetOrderAmount
}: CreateOrderScreenProps) {
  const { t } = useLanguage();
  const { format } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [taxTemplate, setTaxTemplate] = useState('Sales VAT 15%');
  const [warehouse, setWarehouse] = useState('Main WH-01');

  // Local cart state
  // key: product id, value: quantity
  const [cart, setCart] = useState<Record<string, number>>({
    'p5': 2, // Industrial Lubricant (from screen-cap default)
    'p6': 5  // Heavy Duty Filter (from screen-cap default)
  });

  const handleIncrement = (productId: string, stock: number) => {
    const current = cart[productId] || 0;
    if (current >= stock) return; // Prevent exceeding stock
    setCart({
      ...cart,
      [productId]: current + 1
    });
  };

  const handleDecrement = (productId: string) => {
    const current = cart[productId] || 0;
    if (current <= 0) return;
    const nextCart = { ...cart };
    if (current === 1) {
      delete nextCart[productId];
    } else {
      nextCart[productId] = current - 1;
    }
    setCart(nextCart);
  };

  // Calculations
  const selectedItems = Object.entries(cart)
    .map(([pId, qty]) => {
      const p = products.find((prod) => prod.id === pId);
      return { product: p, qty };
    })
    .filter((item) => item.product !== undefined) as { product: Product; qty: number }[];

  const subtotal = selectedItems.reduce((acc, current) => {
    return acc + current.product.price * current.qty;
  }, 0);

  const isVat15 = taxTemplate === 'Sales VAT 15%';
  const tax = isVat15 ? subtotal * 0.15 : 0;
  const total = subtotal + tax;

  const totalItemCount = selectedItems.reduce((acc, cur) => acc + cur.qty, 0);

  const handleProceedToPayment = () => {
    if (total <= 0) {
      alert('Your cart is empty. Please add items before proceeding to payment.');
      return;
    }
    // Prepare items list for invoice rendering
    const orderItemsList = selectedItems.map((item) => ({
      name: item.product.name,
      qty: item.qty,
      price: item.product.price
    }));

    onSetOrderAmount(total, tax, subtotal, orderItemsList);
    onNavigate('sales_invoice'); // Navigates to split payment screen
  };

  // Filter products by query
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-64 font-sans relative z-10 transition-all duration-300">
      
      {/* Top customer card */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/25 rounded-full flex items-center justify-center font-bold text-indigo-400 text-sm font-mono">
            {customerName.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-white text-sm">{customerName}</h4>
            <span className="inline-flex items-center text-[9px] uppercase font-mono font-bold text-emerald-400 tracking-widest mt-0.5">
              ● ACTIVE ACCOUNT NODE
            </span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('today_route')}
          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
        >
          Change
        </button>
      </div>

      {/* Header action panel */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">{t("Transaction Matrix")}</span>
          <h1 className="text-xl font-bold text-white">{t("Create Order")}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('today_route')}
            className="px-3 py-1.5 border border-white/10 text-slate-300 bg-slate-900/40 rounded-xl text-xs font-mono font-bold hover:bg-slate-800 cursor-pointer"
          >
            Drafts
          </button>
          <button
            onClick={handleProceedToPayment}
            className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-555 hover:to-indigo-555 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.25)] border border-white/10"
          >
            ✓ Confirm
          </button>
        </div>
      </div>

      {/* Order Configuration Card */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-3.5 text-left shadow-lg">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-400">// Order Configuration</h3>

        <div>
          <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">{t("Tax Engine Template")}</label>
          <select
            value={taxTemplate}
            onChange={(e) => setTaxTemplate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-900/60 border border-white/10 rounded-lg text-white cursor-pointer"
          >
            <option value="Sales VAT 15%">{t("Sales VAT 15%")}</option>
            <option value="No Tax 0%">{t("Exempt VAT 0%")}</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-1">{t("Fulfillment Depot")}</label>
          <div className="w-full px-3 py-2 text-xs bg-slate-900/20 border border-white/10 rounded-lg text-slate-300 flex items-center justify-between font-mono">
            <span>{warehouse}</span>
            <span className="text-[9px] uppercase bg-slate-800/80 border border-white/10 text-slate-400 px-1.5 py-0.5 rounded">{t("Fixed")}</span>
          </div>
        </div>
      </div>

      {/* Search and barcode scan block */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-indigo-400" />
          </div>
          <input
            type="text"
            placeholder={t("Search catalog by SKU or Name...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950/66 border border-white/10 rounded-xl text-white font-mono placeholder:text-slate-500"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            alert('Barcode hardware simulator connected. Standard scanning activated.');
            handleIncrement('p5', 42); 
          }}
          className="px-3.5 bg-slate-900 border border-white/10 rounded-xl text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-all flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer shadow-md"
        >
          <Scan className="w-4 h-4 text-indigo-400" />{t("Scan")}</button>
      </div>

      {/* Items list */}
      <div className="space-y-3 text-left">
        {filteredProducts.map((p) => {
          const qtyInCart = cart[p.id] || 0;
          const isSelected = qtyInCart > 0;
          const isOutOfStock = p.stock === 0;

          return (
            <div
              key={p.id}
              className={`bg-slate-950/30 border rounded-2xl p-4 transition-all flex items-center justify-between ${
                isOutOfStock
                  ? 'border-white/5 opacity-40'
                  : isSelected
                  ? 'border-indigo-500 bg-slate-900/40 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-1.5 pr-4">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white tracking-tight">{p.name}</h4>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                      isOutOfStock
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        : p.status === 'CRITICAL'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        : p.status === 'LOW STOCK'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-350 border border-emerald-500/20'
                    }`}
                  >
                    ● {isOutOfStock ? 'Depleted' : `${p.stock} Units`}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 font-mono">SKU: {p.sku}</p>
                <p className="text-sm font-extrabold text-emerald-400 font-mono">{format(p.price)}</p>
              </div>

              {/* Quantity selectors */}
              <div>
                {isOutOfStock ? (
                  <span className="text-[10px] uppercase tracking-widest font-mono text-rose-500 italic">{t("No Stock")}</span>
                ) : (
                  <div className="flex items-center gap-1.5 border border-white/10 bg-slate-900/80 rounded-xl p-1 shadow-inner">
                    <button
                      onClick={() => handleDecrement(p.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors ${
                        qtyInCart === 0 ? 'opacity-20 cursor-default hover:bg-transparent' : ''
                      }`}
                      disabled={qtyInCart === 0}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-bold text-white">{qtyInCart}</span>
                    <button
                      onClick={() => handleIncrement(p.id, p.stock)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Summary Drawer overlay */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#070712]/95 backdrop-blur-md text-white p-5 rounded-t-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.6)] z-40 max-w-lg mx-auto border-t border-white/10">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest">
            <span>Order Matrix Core Summary ({totalItemCount} Units)</span>
            {totalItemCount > 0 && <ShoppingCart className="w-4 h-4 text-emerald-400 animate-pulse" />}
          </div>

          <div className="grid grid-cols-2 gap-y-2 text-xs border-b border-white/10 pb-3 font-mono font-medium text-slate-300">
            <span className="text-slate-400">{t("Total Subtotal:")}</span>
            <span className="text-right">{format(subtotal)}</span>
            <span className="text-slate-400">Estimated VAT (15%):</span>
            <span className="text-right">{format(tax)}</span>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">{t("AGGREGATE PAYLOAD DUE")}</span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]">{format(total)}</span>
          </div>

          <button
            onClick={handleProceedToPayment}
            className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 active:scale-98 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer border border-white/15"
          >{t("Confirm & Proceed to Payment")}</button>
        </div>
      </div>
    </div>
  );
}
