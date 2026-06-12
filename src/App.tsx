import { useState } from 'react';
import { ViewState, Product, Customer, Visit, Order, LoadingRequest, InventoryClosingItem } from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_VISITS,
  INITIAL_ORDERS,
  INITIAL_LOADING_REQUESTS,
  INITIAL_CLOSING_INVENTORY
} from './data';

// Component imports
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import RouteScreen from './components/RouteScreen';
import CustomerFormScreen from './components/CustomerFormScreen';
import CreateOrderScreen from './components/CreateOrderScreen';
import PaymentScreen from './components/PaymentScreen';
import InvoiceViewer from './components/InvoiceViewer';
import InventoryScreen from './components/InventoryScreen';
import LoadingRequestsScreen from './components/LoadingRequestsScreen';
import ClosingReportsScreen from './components/ClosingReportsScreen';
import SettingsScreen from './components/SettingsScreen';
import ReportsScreen from './components/ReportsScreen';
import BiometricLockScreen from './components/BiometricLockScreen';

// Persistent icons
import { LayoutDashboard, ShoppingCart, TableProperties, Users, AreaChart, LogOut, Menu, User, Bell, Sun, Moon, Languages, Lock } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);

  // Global transactional simulation states
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [visits, setVisits] = useState<Visit[]>(INITIAL_VISITS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [loadingRequests, setLoadingRequests] = useState<LoadingRequest[]>(INITIAL_LOADING_REQUESTS);
  const [closingInventory, setClosingInventory] = useState<InventoryClosingItem[]>(INITIAL_CLOSING_INVENTORY);

  // Selected payment checkout details
  const [activeCustomerForOrder, setActiveCustomerForOrder] = useState({ id: 'TC-1100', name: 'test Customers' });
  const [orderAmount, setOrderAmount] = useState({ total: 825.13, tax: 107.63, subtotal: 717.50 });
  const [orderItemsList, setOrderItemsList] = useState<{ name: string; qty: number; price: number }[]>([
    { name: 'Industrial Lubricant 5L', qty: 2, price: 145.00 },
    { name: 'Heavy Duty Filter', qty: 5, price: 85.50 }
  ]);
  const [latestInvoice, setLatestInvoice] = useState<any>(null);

  // Auth logins
  const handleLogin = (username: string, role: string) => {
    setUser({ username, role });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  // State update actions
  const handleAddRequest = (req: LoadingRequest) => {
    setLoadingRequests([req, ...loadingRequests]);
  };

  const handleAddCustomer = (cust: Customer) => {
    setCustomers([cust, ...customers]);
    // Create matching scheduled visit
    const newVisit: Visit = {
      id: `v-${Math.floor(100 + Math.random() * 900)}`,
      customer: cust,
      time: '12:00 PM',
      status: 'PENDING',
      distanceKm: 0.04,
      geofenceM: 200
    };
    setVisits([...visits, newVisit]);
  };

  const handleUpdateVisitStatus = (visitId: string, status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS') => {
    setVisits(
      visits.map((v) => {
        if (v.id === visitId) {
          return {
            ...v,
            status,
            completedTime: status === 'COMPLETED' ? '08:30 AM' : undefined,
            distanceKm: status === 'COMPLETED' ? 0.04 : v.distanceKm
          };
        }
        return v;
      })
    );
  };

  const handleSetOrderAmount = (
    total: number,
    tax: number,
    subtotal: number,
    items: { name: string; qty: number; price: number }[]
  ) => {
    setOrderAmount({ total, tax, subtotal });
    setOrderItemsList(items);
  };

  const handleSubmitInvoice = (invoiceDetails: any) => {
    setLatestInvoice(invoiceDetails);

    // Save newly created transaction into ERP orders array
    const newOrder: Order = {
      id: invoiceDetails.id,
      customerName: activeCustomerForOrder.name,
      customerId: activeCustomerForOrder.id,
      date: invoiceDetails.date,
      total: invoiceDetails.total,
      status: 'Completed',
      items: orderItemsList
    };

    setOrders([newOrder, ...orders]);

    // Also mark the visit corresponding to this customer as fully Completed
    setVisits(
      visits.map((v) => {
        if (v.customer.id === activeCustomerForOrder.id) {
          return { ...v, status: 'COMPLETED' };
        }
        return v;
      })
    );
  };

  const handleSelectCustomerForOrder = (customerId: string, customerName: string) => {
    setActiveCustomerForOrder({ id: customerId, name: customerName });
  };

  // Switch tabs helper mapping
  const resolveActiveNavTab = (): 'dashboard' | 'sales' | 'inventory' | 'crm' | 'reports' | '' => {
    if (currentView === 'login') return '';
    if (currentView === 'dashboard') return 'dashboard';
    if (['today_route', 'add_customer', 'create_order', 'sales_invoice'].includes(currentView)) return 'sales';
    if (['van_stock', 'loading_requests', 'daily_closing'].includes(currentView)) return 'inventory';
    if (currentView === 'settings') return 'crm';
    if (['reports', 'invoice_viewer'].includes(currentView)) return 'reports';
    return 'dashboard';
  };

  const activeTab = resolveActiveNavTab();

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'text-slate-100' : 'text-slate-900'} font-sans flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-400`}>
      
      {/* Biometric lock screen overlay */}
      {user && isBiometricLocked && (
        <BiometricLockScreen
          onUnlock={() => setIsBiometricLocked(false)}
          onLogout={handleLogout}
        />
      )}
      
      {/* Dynamic Persistent App Header Row (Show only if user is logged in) */}
      {user && (
        <header className={`sticky top-0 left-0 right-0 ${isDark ? 'bg-slate-950/70 border-b border-white/10' : 'bg-white/80 border-b border-slate-200 shadow-xs'} backdrop-blur-md py-3.5 px-4 z-40 max-w-lg mx-auto flex items-center justify-between transition-colors`}>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-black/5 text-slate-700'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span
              onClick={() => setCurrentView('dashboard')}
              className={`font-bold tracking-tight cursor-pointer hover:text-indigo-600 transition-colors ${isDark ? 'text-white hover:text-indigo-400' : 'text-slate-900'}`}
            >
              {t("Bitvera Sales")}
            </span>
          </div>

          <div className="flex items-center gap-2 select-none">
            {/* Quick Access Theme Toggle Switch */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-slate-300 hover:text-white' : 'hover:bg-black/5 text-slate-700 hover:text-slate-950'}`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>

            {/* Padlock button to lock the terminal instantly */}
            <button
              onClick={() => setIsBiometricLocked(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-[#10b981] hover:text-emerald-400' : 'hover:bg-black/5 text-emerald-600 hover:text-emerald-800'}`}
              title={t("Lock Safe Terminal")}
            >
              <Lock className="w-5 h-5" />
            </button>

            <button
              onClick={() => alert(`Active notifications for Ramy Ahmed:\n- 3 critical stock alerts pending.\n- PR-2026-00488 loading approval request sent.`)}
              className={`p-1.5 rounded-lg transition-colors relative cursor-pointer ${isDark ? 'hover:bg-white/10 text-indigo-400 hover:text-indigo-300' : 'hover:bg-black/5 text-indigo-600 hover:text-indigo-800'}`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            {/* Premium segmented choice Language Toggle Pill right beside the photo */}
            <div className={`flex items-center rounded-lg p-0.5 border ${isDark ? 'border-white/10 bg-slate-900/50' : 'border-slate-200 bg-slate-100'} text-xs overflow-hidden select-none`}>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer font-bold ${
                  language === 'en'
                    ? (isDark ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-indigo-700 shadow-xs')
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer font-bold ${
                  language === 'ar'
                    ? (isDark ? 'bg-indigo-650 text-white shadow-xs' : 'bg-white text-indigo-700 shadow-xs')
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                عربي
              </button>
            </div>

            {/* Click avatar to trigger quick settings navigate */}
            <div
              onClick={() => setCurrentView('settings')}
              className={`w-8.5 h-8.5 rounded-full overflow-hidden border ${isDark ? 'border-white/25 hover:border-indigo-400' : 'border-slate-300 hover:border-indigo-600'} shadow-xs cursor-pointer select-none transition-all active:scale-95 ml-1`}
              title="Click to manage settings"
            >
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100"
                alt="Ahmed Profile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>
      )}

      {/* Main Content Layout Block */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-5 font-sans">
        
        {currentView === 'login' && (
          <LoginScreen onLogin={handleLogin} />
        )}

        {currentView === 'dashboard' && (
          <DashboardScreen
            userName="Ahmed"
            onNavigate={setCurrentView}
            orders={orders}
          />
        )}

        {currentView === 'today_route' && (
          <RouteScreen
            visits={visits}
            onNavigate={setCurrentView}
            onSelectCustomerForOrder={handleSelectCustomerForOrder}
            onUpdateVisitStatus={handleUpdateVisitStatus}
          />
        )}

        {currentView === 'add_customer' && (
          <CustomerFormScreen
            onAddCustomer={handleAddCustomer}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'create_order' && (
          <CreateOrderScreen
            products={products}
            customerName={activeCustomerForOrder.name}
            customerId={activeCustomerForOrder.id}
            onNavigate={setCurrentView}
            onSetOrderAmount={handleSetOrderAmount}
          />
        )}

        {currentView === 'sales_invoice' && (
          <PaymentScreen
            totalAmount={orderAmount.total}
            taxAmount={orderAmount.tax}
            subtotalAmount={orderAmount.subtotal}
            onNavigate={setCurrentView}
            onSubmitInvoice={handleSubmitInvoice}
          />
        )}

        {currentView === 'invoice_viewer' && (
          <InvoiceViewer
            invoiceData={latestInvoice}
            customerName={activeCustomerForOrder.name}
            onNavigate={setCurrentView}
            orderItems={orderItemsList}
          />
        )}

        {currentView === 'van_stock' && (
          <InventoryScreen
            products={products}
            onUpdateStock={(id, stock) => {
              setProducts(
                products.map((p) => {
                  if (p.id === id) {
                    return { ...p, stock };
                  }
                  return p;
                })
              );
            }}
          />
        )}

        {currentView === 'loading_requests' && (
          <LoadingRequestsScreen
            requests={loadingRequests}
            onAddRequest={handleAddRequest}
          />
        )}

        {currentView === 'daily_closing' && (
          <ClosingReportsScreen
            items={closingInventory}
          />
        )}

        {currentView === 'settings' && (
          <SettingsScreen
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            onLock={() => setIsBiometricLocked(true)}
          />
        )}

        {currentView === 'reports' && (
          <ReportsScreen
            onNavigate={setCurrentView}
          />
        )}

      </main>

      {/* Persistent Bottom Tab Navigation Bar (Show only if logged in) */}
      {user && (
        <nav className={`fixed bottom-4 left-4 right-4 ${isDark ? 'bg-slate-950/70 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' : 'bg-white/90 border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)]'} backdrop-blur-lg border z-40 max-w-[calc(100%-2rem)] md:max-w-md mx-auto py-2 px-1.5 rounded-2xl transition-all`}>
          <div className="flex justify-between items-center text-center">
            
            {/* Tab 1: Dashboard */}
            <button
               onClick={() => setCurrentView('dashboard')}
              className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === 'dashboard' ? 'text-[#10b981]' : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <div
                className={`flex items-center justify-center py-1 px-3.5 rounded-full transition-all ${
                  activeTab === 'dashboard' ? 'bg-emerald-500/25 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]' : ''
                }`}
              >
                <LayoutDashboard className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">{t("Dashboard")}</span>
            </button>

            {/* Tab 2: Sales */}
            <button
              onClick={() => {
                // If checking in, return to checkout/create order! Else Route screen
                setCurrentView('today_route');
              }}
              className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === 'sales' ? 'text-[#10b981]' : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <div
                className={`flex items-center justify-center py-1 px-3.5 rounded-full transition-all ${
                  activeTab === 'sales' ? 'bg-emerald-500/25 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]' : ''
                }`}
              >
                <ShoppingCart className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">{t("Sales")}</span>
            </button>

            {/* Tab 3: Inventory */}
            <button
              onClick={() => setCurrentView('van_stock')}
              className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === 'inventory' ? 'text-[#10b981]' : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <div
                className={`flex items-center justify-center py-1 px-3.5 rounded-full transition-all ${
                  activeTab === 'inventory' ? 'bg-emerald-500/25 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]' : ''
                }`}
              >
                <TableProperties className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">{t("Inventory")}</span>
            </button>

            {/* Tab 4: CRM */}
            <button
              onClick={() => setCurrentView('settings')}
              className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === 'crm' ? 'text-[#10b981]' : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <div
                className={`flex items-center justify-center py-1 px-3.5 rounded-full transition-all ${
                  activeTab === 'crm' ? 'bg-emerald-500/25 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]' : ''
                }`}
              >
                <Users className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">{t("CRM")}</span>
            </button>

            {/* Tab 5: Reports */}
            <button
              onClick={() => setCurrentView('reports')}
              className={`flex-1 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                activeTab === 'reports' ? 'text-[#10b981]' : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900')
              }`}
            >
              <div
                className={`flex items-center justify-center py-1 px-3.5 rounded-full transition-all ${
                  activeTab === 'reports' ? 'bg-emerald-500/25 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]' : ''
                }`}
              >
                <AreaChart className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider">{t("Reports")}</span>
            </button>

          </div>
        </nav>
      )}
    </div>
  );
}
