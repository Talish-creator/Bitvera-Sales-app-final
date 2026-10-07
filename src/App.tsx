import { useState, useEffect } from 'react';
import { ViewState, Product, Customer, Visit, Order, LoadingRequest, InventoryClosingItem } from './types';
import {
  getProducts,
  getCustomers,
  getVisits,
  getOrders,
  getLoadingRequests,
  getClosingInventory,
  addOrderPersistent,
  addCustomerPersistent,
  addVisitPersistent,
  updateVisitPersistent,
  addLoadingRequestPersistent,
  updateProductStockPersistent,
  getCurrentUser,
  clearCurrentUser
} from './services/storage';
import { validateSession } from './services/auth';

// Standard Screen imports
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import RouteScreen from './components/RouteScreen';
import CustomerFormScreen from './components/CustomerFormScreen';
import CreateOrderScreen from './components/CreateOrderScreen';
import PaymentScreen from './components/PaymentScreen';
import InvoiceViewer from './components/InvoiceViewer';
import Sidebar from './components/Sidebar';
import InventoryScreen from './components/InventoryScreen';
import LoadingRequestsScreen from './components/LoadingRequestsScreen';
import ClosingReportsScreen from './components/ClosingReportsScreen';
import SettingsScreen from './components/SettingsScreen';
import ReportsScreen from './components/ReportsScreen';
import BiometricLockScreen from './components/BiometricLockScreen';

// Enterprise Screen additions
import Customer360Screen from './components/Customer360Screen';
import CrmPipelineScreen from './components/CrmPipelineScreen';
import TasksScreen from './components/TasksScreen';
import RouteOptimizationScreen from './components/RouteOptimizationScreen';
import ReceivablesScreen from './components/ReceivablesScreen';
import ExpensesScreen from './components/ExpensesScreen';
import DocumentCenterScreen from './components/DocumentCenterScreen';
import SyncCenterScreen from './components/SyncCenterScreen';
import AdminUsersScreen from './components/AdminUsersScreen';
import AuditCenterScreen from './components/AuditCenterScreen';
import ErpSettingsScreen from './components/ErpSettingsScreen';

// Enterprise Modals & Quick Action Overlays
import CommandPaletteModal from './components/CommandPaletteModal';
import AiAssistantModal from './components/AiAssistantModal';
import MobileQuickActions from './components/MobileQuickActions';
import ErpStatusModal from './components/ErpStatusModal';
import SyncModal from './components/SyncModal';
import { fetchErpConfig } from './services/erpnextIntegration';

// Persistent icons
import { 
  LayoutDashboard, ShoppingCart, TableProperties, Users, 
  AreaChart, Menu, Bell, Sun, Moon, Lock, Search, Bot 
} from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isErpStatusModalOpen, setIsErpStatusModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isErpConnected, setIsErpConnected] = useState(false);

  // Authoritative persistent state loaded from storage
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [customers, setCustomers] = useState<Customer[]>(() => getCustomers());
  const [visits, setVisits] = useState<Visit[]>(() => getVisits());
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [loadingRequests, setLoadingRequests] = useState<LoadingRequest[]>(() => getLoadingRequests());
  const [closingInventory, setClosingInventory] = useState<InventoryClosingItem[]>(() => getClosingInventory());

  // Check existing session on load
  useEffect(() => {
    const existingUser = getCurrentUser();
    if (existingUser) {
      if (validateSession()) {
        setUser({ username: existingUser.username, role: existingUser.role });
        setCurrentView('dashboard');
      } else {
        clearCurrentUser();
        setUser(null);
        setCurrentView('login');
      }
    }
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check ERPNext connection status
  useEffect(() => {
    const checkErp = () => {
      fetchErpConfig().then(cfg => {
        setIsErpConnected(cfg.connectionStatus === 'CONNECTED');
      }).catch(() => setIsErpConnected(false));
    };
    checkErp();
    const iv = setInterval(checkErp, 25000);
    return () => clearInterval(iv);
  }, [currentView, isErpStatusModalOpen, isSyncModalOpen]);

  // Selected payment checkout details
  const [activeCustomerForOrder, setActiveCustomerForOrder] = useState({ id: 'TC-1100', name: 'test Customers' });
  const [orderAmount, setOrderAmount] = useState({ total: 454.25, tax: 59.25, subtotal: 395.00 });
  const [orderItemsList, setOrderItemsList] = useState<{ name: string; qty: number; price: number }[]>([
    { name: 'ALMAS 1.5 L*6', qty: 50, price: 6.50 },
    { name: 'ALMAS 500 ML*12', qty: 10, price: 7.00 }
  ]);
  const [latestInvoice, setLatestInvoice] = useState<any>(null);

  // Auth logins
  const handleLogin = (username: string, role: string) => {
    setUser({ username, role });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    clearCurrentUser();
    setUser(null);
    setCurrentView('login');
  };

  // State update actions
  const handleAddRequest = (req: LoadingRequest) => {
    addLoadingRequestPersistent(req);
    setLoadingRequests(getLoadingRequests());
  };

  const handleAddCustomer = (cust: Customer) => {
    addCustomerPersistent(cust);
    const newVisit: Visit = {
      id: `v-${Date.now()}`,
      customer: cust,
      time: '12:00 PM',
      status: 'PENDING',
      distanceKm: 0.04,
      geofenceM: 200
    };
    addVisitPersistent(newVisit);
    setCustomers(getCustomers());
    setVisits(getVisits());
  };

  const handleUpdateVisitStatus = (visitId: string, status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS') => {
    updateVisitPersistent(visitId, {
      status,
      completedTime: status === 'COMPLETED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      distanceKm: status === 'COMPLETED' ? 0.04 : undefined
    });
    setVisits(getVisits());
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

    const newOrder: Order = {
      id: invoiceDetails.id,
      customerName: activeCustomerForOrder.name,
      customerId: activeCustomerForOrder.id,
      date: invoiceDetails.date,
      total: invoiceDetails.total,
      status: 'Completed',
      paymentMethod: (invoiceDetails.cashReceived ?? 0) > 0 && (invoiceDetails.bankReceived ?? 0) > 0
        ? 'Split'
        : (invoiceDetails.cashReceived ?? 0) > 0 ? 'Cash' : 'Bank Transfer',
      items: orderItemsList,
      cashReceived: invoiceDetails.cashReceived,
      bankReceived: invoiceDetails.bankReceived
    };

    addOrderPersistent(newOrder);

    setOrders(getOrders());
    setProducts(getProducts());
    setClosingInventory(getClosingInventory());

    const targetVisit = visits.find((v) => v.customer.id === activeCustomerForOrder.id);
    if (targetVisit) {
      updateVisitPersistent(targetVisit.id, {
        status: 'COMPLETED',
        completedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setVisits(getVisits());
    }
  };

  const handleSelectCustomerForOrder = (customerId: string, customerName: string) => {
    setActiveCustomerForOrder({ id: customerId, name: customerName });
  };

  // Switch tabs helper mapping
  const resolveActiveNavTab = (): 'dashboard' | 'sales' | 'inventory' | 'crm' | 'reports' | '' => {
    if (currentView === 'login') return '';
    if (currentView === 'dashboard') return 'dashboard';
    if (['today_route', 'add_customer', 'create_order', 'sales_invoice', 'route_optimization'].includes(currentView)) return 'sales';
    if (['van_stock', 'loading_requests', 'daily_closing'].includes(currentView)) return 'inventory';
    if (['customer_360', 'crm_pipeline', 'tasks', 'receivables', 'settings', 'admin_users'].includes(currentView)) return 'crm';
    if (['reports', 'invoice_viewer', 'expenses', 'document_center', 'sync_center', 'audit_center'].includes(currentView)) return 'reports';
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

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
        onSelectCustomer={(c) => setActiveCustomerForOrder({ id: c.id, name: c.name })}
      />

      {/* Grounded AI Sales Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onNavigate={setCurrentView}
      />

      {/* Mobile Floating Quick Action Speed Dial */}
      {user && currentView !== 'login' && (
        <MobileQuickActions
          onNavigate={setCurrentView}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
      )}

      {/* Slide-out Mobile Navigation Sidebar */}
      {user && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onNavigate={setCurrentView} 
          onLogout={handleLogout} 
          isDark={isDark} 
        />
      )}
      
      {/* App Header Row */}
      {user && (
        <header className={`sticky top-0 left-0 right-0 ${isDark ? 'bg-slate-950/70 border-b border-white/10' : 'bg-white/80 border-b border-slate-200 shadow-xs'} backdrop-blur-md py-3 px-4 z-40 max-w-lg mx-auto flex items-center justify-between transition-colors`}>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-black/5 text-slate-700'}`}
              title="Open Navigation"
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

          <div className="flex items-center gap-1.5 select-none">
            {/* Global Search Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-indigo-400 hover:text-indigo-300' : 'hover:bg-black/5 text-indigo-600'}`}
              title="Search & Commands (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* ERPNext Gateway Badge */}
            <button
              onClick={() => setIsErpStatusModalOpen(true)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isErpConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20' 
                  : 'bg-slate-800/80 text-slate-400 border-white/10 hover:bg-slate-700'
              }`}
              title={isErpConnected ? t("ERPNext: Connected") : t("ERPNext: Disconnected")}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isErpConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="hidden sm:inline">ERP</span>
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-emerald-400 hover:text-emerald-300' : 'hover:bg-black/5 text-emerald-600'}`}
              title={t("AI Sales Assistant")}
            >
              <Bot className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-slate-300 hover:text-white' : 'hover:bg-black/5 text-slate-700'}`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            {/* Padlock button */}
            <button
              onClick={() => setIsBiometricLocked(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? 'hover:bg-white/10 text-[#10b981] hover:text-emerald-400' : 'hover:bg-black/5 text-emerald-600'}`}
              title={t("Lock Safe Terminal")}
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Language Pill */}
            <div className={`flex items-center rounded-lg p-0.5 border ${isDark ? 'border-white/10 bg-slate-900/50' : 'border-slate-200 bg-slate-100'} text-xs overflow-hidden`}>
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${language === 'ar' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
              >
                عربي
              </button>
            </div>

            {/* Profile Avatar */}
            <div
              onClick={() => setCurrentView('settings')}
              className={`w-7.5 h-7.5 rounded-full overflow-hidden border ${isDark ? 'border-white/25 hover:border-indigo-400' : 'border-slate-300 hover:border-indigo-600'} shadow-xs cursor-pointer select-none transition-all active:scale-95 ml-0.5`}
              title="Settings"
            >
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100&h=100"
                alt="Profile"
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
            userName={user?.username || 'Representative'}
            userRole={user?.role}
            onNavigate={setCurrentView}
            orders={orders}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
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

        {currentView === 'route_optimization' && (
          <RouteOptimizationScreen
            onNavigate={setCurrentView}
            onSelectCustomerForOrder={handleSelectCustomerForOrder}
          />
        )}

        {currentView === 'add_customer' && (
          <CustomerFormScreen
            onAddCustomer={handleAddCustomer}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'customer_360' && (
          <Customer360Screen
            onNavigate={setCurrentView}
            onSelectCustomerForOrder={handleSelectCustomerForOrder}
            initialCustomerId={activeCustomerForOrder.id}
          />
        )}

        {currentView === 'crm_pipeline' && (
          <CrmPipelineScreen
            onNavigate={setCurrentView}
            onSelectCustomer={(c) => {
              setActiveCustomerForOrder({ id: c.id, name: c.name });
            }}
          />
        )}

        {currentView === 'tasks' && (
          <TasksScreen
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'receivables' && (
          <ReceivablesScreen
            onNavigate={setCurrentView}
            onSelectCustomerForOrder={handleSelectCustomerForOrder}
          />
        )}

        {currentView === 'expenses' && (
          <ExpensesScreen
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'document_center' && (
          <DocumentCenterScreen
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'sync_center' && (
          <SyncCenterScreen
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'erp_settings' && (
          <ErpSettingsScreen
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'admin_users' && (
          <AdminUsersScreen
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'audit_center' && (
          <AuditCenterScreen
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
              updateProductStockPersistent(id, stock);
              setProducts(getProducts());
              setClosingInventory(getClosingInventory());
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

      {/* Persistent Bottom Tab Navigation Bar */}
      {user && (
        <nav className={`fixed bottom-4 left-4 right-4 ${isDark ? 'bg-slate-950/70 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]' : 'bg-white/90 border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.08)]'} backdrop-blur-lg border z-30 max-w-[calc(100%-2rem)] md:max-w-md mx-auto py-2 px-1.5 rounded-2xl transition-all`}>
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
              onClick={() => setCurrentView('today_route')}
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
              onClick={() => setCurrentView('crm_pipeline')}
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

      {/* ERP Status Quick Modal */}
      <ErpStatusModal
        isOpen={isErpStatusModalOpen}
        onClose={() => setIsErpStatusModalOpen(false)}
        onNavigate={setCurrentView}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Controlled Synchronization Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={() => {}}
      />
    </div>
  );
}
