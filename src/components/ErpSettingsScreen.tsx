import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Server, Key, Shield, CheckCircle2, 
  AlertTriangle, RefreshCw, Landmark, Database, 
  Settings, Wifi, WifiOff, Eye, EyeOff, Save, 
  LogOut, Sliders, HelpCircle, Layers, Compass
} from 'lucide-react';
import { ViewState } from '../types';
import { 
  fetchErpConfig, saveErpConfig, testErpConnection, 
  disconnectErp, fetchErpMetadata, ClientErpConfig, 
  DEFAULT_CLIENT_ERP_CONFIG, getEntitySourceOfTruth, SyncDirection, AutoSyncMode 
} from '../services/erpnextIntegration';
import { useLanguage } from '../context/LanguageContext';

interface ErpSettingsScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function ErpSettingsScreen({ onNavigate }: ErpSettingsScreenProps) {
  const { t } = useLanguage();
  const [config, setConfig] = useState<ClientErpConfig>(DEFAULT_CLIENT_ERP_CONFIG);
  const [loading, setLoading] = useState(true);

  // Form states
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [company, setCompany] = useState('');
  const [defaultWarehouse, setDefaultWarehouse] = useState('');
  const [defaultCustomerGroup, setDefaultCustomerGroup] = useState('');
  const [defaultTerritory, setDefaultTerritory] = useState('');
  const [defaultPriceList, setDefaultPriceList] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('');
  const [autoSyncMode, setAutoSyncMode] = useState<AutoSyncMode>('manual');
  const [modules, setModules] = useState(DEFAULT_CLIENT_ERP_CONFIG.syncSettings.modules);

  // Connection test states
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    latencyMs?: number;
    version?: string;
  } | null>(null);

  // Metadata dropdowns
  const [meta, setMeta] = useState<{
    isLive: boolean;
    companies: string[];
    warehouses: string[];
    customerGroups: string[];
    territories: string[];
    priceLists: string[];
    currencies: string[];
  }>({
    isLive: false,
    companies: [],
    warehouses: [],
    customerGroups: [],
    territories: [],
    priceLists: [],
    currencies: []
  });

  // Wizard modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [wipeOnDisconnect, setWipeOnDisconnect] = useState(false);

  const [notification, setNotification] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const cfg = await fetchErpConfig();
      setConfig(cfg);
      setUrl(cfg.url || '');
      setApiKey(cfg.apiKey || '');
      setApiSecret(cfg.hasSecret ? '••••••••••••••••' : '');
      setCompany(cfg.company || '');
      setDefaultWarehouse(cfg.defaultWarehouse || '');
      setDefaultCustomerGroup(cfg.defaultCustomerGroup || '');
      setDefaultTerritory(cfg.defaultTerritory || '');
      setDefaultPriceList(cfg.defaultPriceList || '');
      setDefaultCurrency(cfg.defaultCurrency || '');
      setAutoSyncMode(cfg.syncSettings.autoSyncMode || 'manual');
      setModules(cfg.syncSettings.modules || DEFAULT_CLIENT_ERP_CONFIG.syncSettings.modules);

      // Load metadata
      const m = await fetchErpMetadata();
      setMeta(m);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await testErpConnection({
        url,
        apiKey,
        apiSecret: apiSecret.includes('••••') ? undefined : apiSecret
      });

      if (res.connected) {
        setTestResult({
          tested: true,
          connected: true,
          message: `Connection successful (${res.latencyMs}ms)`,
          latencyMs: res.latencyMs,
          version: res.version
        });
        setConfig(prev => ({ ...prev, connectionStatus: 'CONNECTED' }));
        // Refresh metadata now that we are connected
        const m = await fetchErpMetadata();
        setMeta(m);
      } else {
        setTestResult({
          tested: true,
          connected: false,
          message: res.error || t("ERPNext connection failed.")
        });
        setConfig(prev => ({ ...prev, connectionStatus: 'ERROR' }));
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        connected: false,
        message: err.message || t("Network error during connection test.")
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    const patch: Partial<ClientErpConfig> = {
      url,
      apiKey,
      company,
      defaultWarehouse,
      defaultCustomerGroup,
      defaultTerritory,
      defaultPriceList,
      defaultCurrency,
      syncSettings: {
        autoSyncMode,
        modules
      }
    };

    const res = await saveErpConfig(patch, apiSecret.includes('••••') ? undefined : apiSecret);
    if (res.success) {
      setNotification(t("ERPNext configuration saved successfully."));
      setTimeout(() => setNotification(''), 3000);
      loadSettings();
    } else {
      alert(res.error || t("Failed to save configuration."));
    }
  };

  const handleDisconnect = async () => {
    await disconnectErp(wipeOnDisconnect);
    setDisconnectModalOpen(false);
    setNotification(t("ERPNext disconnected. Bitvera continues in standalone mode."));
    setTimeout(() => setNotification(''), 4000);
    loadSettings();
  };

  const updateModuleField = (modKey: string, field: 'enabled' | 'direction', val: any) => {
    setModules(prev => ({
      ...prev,
      [modKey]: {
        ...(prev as any)[modKey],
        [field]: val
      }
    }));
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-400" />
              {t("ERPNext Integration & Gateway")}
            </h1>
            <p className="text-xs text-slate-400">
              {t("Optional Enterprise Synchronization • Standalone Field Capability")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWizardOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            {t("Setup Wizard")}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            {t("Save Settings")}
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {notification}
        </div>
      )}

      {/* Connection Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        config.connectionStatus === 'CONNECTED'
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
          : 'bg-slate-900/60 border-white/10 text-slate-300'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            config.connectionStatus === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}>
            {config.connectionStatus === 'CONNECTED' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold tracking-wider">
                {t("Gateway Status:")}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                config.connectionStatus === 'CONNECTED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}>
                {config.connectionStatus === 'CONNECTED' ? t("CONNECTED (AUTHENTICATED)") : t("DISCONNECTED (STANDALONE ACTIVE)")}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {config.connectionStatus === 'CONNECTED'
                ? `${t("ERPNext Host:")} ${config.url || 'Configured'} • ${config.serverVersion || 'ERPNext v15'}`
                : t("Bitvera operates completely independently. No ERP connection is required for field sales.")
              }
            </p>
          </div>
        </div>

        {config.connectionStatus === 'CONNECTED' && (
          <button
            onClick={() => setDisconnectModalOpen(true)}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          >
            {t("Disconnect ERPNext")}
          </button>
        )}
      </div>

      {/* Main Form Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Card 1: API Credentials */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
              <Key className="w-4 h-4" />
              {t("Server-Side API Credentials")}
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {t("Protected on Server")}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">
                {t("ERPNext Base URL")}
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://erp.yourcompany.com"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {t("Protocol + domain (e.g., https://erp.bitvera.com or http://localhost:8000)")}
              </span>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">
                {t("API Key")}
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="e.g. 74d82f9b28a49c"
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">
                {t("API Secret")}
              </label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={apiSecret}
                  onChange={e => setApiSecret(e.target.value)}
                  placeholder={config.hasSecret ? "••••••••••••••••" : t("Enter API Secret")}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 pr-10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {t("Stored securely server-side. Never returned in plain text to the browser.")}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || !url}
                className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                {testing ? t("Testing Authenticated Handshake...") : t("Test Connection (Live Request)")}
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2.5 ${
                testResult.connected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {testResult.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">{testResult.message}</span>
                  {testResult.version && (
                    <span className="text-[10px] text-emerald-400 block mt-0.5">{testResult.version}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Company & Default Mappings */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              {t("ERPNext Default DocType Mappings")}
            </h2>
            <span className="text-[10px] font-mono text-slate-400">
              {meta.isLive ? '● Live from ERP' : 'Default Presets'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">{t("Company")}</label>
              <select
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {meta.companies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">{t("Default Warehouse")}</label>
              <select
                value={defaultWarehouse}
                onChange={e => setDefaultWarehouse(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {meta.warehouses.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">{t("Customer Group")}</label>
              <select
                value={defaultCustomerGroup}
                onChange={e => setDefaultCustomerGroup(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {meta.customerGroups.map(cg => <option key={cg} value={cg}>{cg}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">{t("Default Territory")}</label>
              <select
                value={defaultTerritory}
                onChange={e => setDefaultTerritory(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {meta.territories.map(tr => <option key={tr} value={tr}>{tr}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">{t("Selling Price List")}</label>
              <select
                value={defaultPriceList}
                onChange={e => setDefaultPriceList(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {meta.priceLists.map(pl => <option key={pl} value={pl}>{pl}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] font-medium mb-1">{t("Default Currency")}</label>
              <select
                value={defaultCurrency}
                onChange={e => setDefaultCurrency(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                {meta.currencies.map(cur => <option key={cur} value={cur}>{cur}</option>)}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Card 3: Synchronization Modes & Module Matrix */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              {t("Granular Sync Matrix & Direction Control")}
            </h2>
            <p className="text-[11px] text-slate-400">
              {t("Choose which entities are authorized to sync, and who holds the source of truth.")}
            </p>
          </div>

          {/* Sync Mode Radio Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setAutoSyncMode('manual')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                autoSyncMode === 'manual' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t("Manual")}
            </button>
            <button
              onClick={() => setAutoSyncMode('auto_15m')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                autoSyncMode === 'auto_15m' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              15m
            </button>
            <button
              onClick={() => setAutoSyncMode('auto_30m')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                autoSyncMode === 'auto_30m' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              30m
            </button>
            <button
              onClick={() => setAutoSyncMode('auto_1h')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                autoSyncMode === 'auto_1h' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              1h
            </button>
          </div>
        </div>

        {/* Modules Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-mono text-[10px] uppercase">
                <th className="pb-2">{t("Entity")}</th>
                <th className="pb-2">{t("Enabled")}</th>
                <th className="pb-2">{t("Sync Direction")}</th>
                <th className="pb-2">{t("Source of Truth")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              
              <ModuleRow
                name={t("Customers")}
                enabled={modules.customers.enabled}
                direction={modules.customers.direction}
                source="Shared"
                onToggle={en => updateModuleField('customers', 'enabled', en)}
                onDirectionChange={dir => updateModuleField('customers', 'direction', dir)}
              />

              <ModuleRow
                name={t("Products & Rates")}
                enabled={modules.products.enabled}
                direction={modules.products.direction}
                source="ERPNext"
                onToggle={en => updateModuleField('products', 'enabled', en)}
                onDirectionChange={dir => updateModuleField('products', 'direction', dir)}
              />

              <ModuleRow
                name={t("Van Stock & Inventory")}
                enabled={modules.inventory.enabled}
                direction={modules.inventory.direction}
                source="ERPNext"
                onToggle={en => updateModuleField('inventory', 'enabled', en)}
                onDirectionChange={dir => updateModuleField('inventory', 'direction', dir)}
              />

              <ModuleRow
                name={t("Sales Orders")}
                enabled={modules.orders.enabled}
                direction={modules.orders.direction}
                source="Bitvera"
                onToggle={en => updateModuleField('orders', 'enabled', en)}
                onDirectionChange={dir => updateModuleField('orders', 'direction', dir)}
              />

              <ModuleRow
                name={t("Sales Invoices")}
                enabled={modules.invoices.enabled}
                direction={modules.invoices.direction}
                source="ERPNext"
                onToggle={en => updateModuleField('invoices', 'enabled', en)}
                onDirectionChange={dir => updateModuleField('invoices', 'direction', dir)}
              />

              <ModuleRow
                name={t("Payment Entries")}
                enabled={modules.payments.enabled}
                direction={modules.payments.direction}
                source="Shared"
                onToggle={en => updateModuleField('payments', 'enabled', en)}
                onDirectionChange={dir => updateModuleField('payments', 'direction', dir)}
              />

              <ModuleRow
                name={t("Field Visits & GPS")}
                enabled={modules.visits.enabled}
                direction={modules.visits.direction}
                source="Bitvera"
                onToggle={en => updateModuleField('visits', 'enabled', en)}
                onDirectionChange={dir => updateModuleField('visits', 'direction', dir)}
              />

            </tbody>
          </table>
        </div>
      </div>

      {/* Disconnect Modal */}
      {disconnectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              {t("Disconnect ERPNext Gateway?")}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t("Disconnecting will pause background synchronization. All your Bitvera customers, orders, visits, products, and offline records will remain 100% intact.")}
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <input
                type="checkbox"
                id="wipeCreds"
                checked={wipeOnDisconnect}
                onChange={e => setWipeOnDisconnect(e.target.checked)}
                className="rounded border-white/20 text-rose-600 focus:ring-0"
              />
              <label htmlFor="wipeCreds">{t("Also wipe API Key and Secret from server")}</label>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => setDisconnectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg"
              >
                {t("Confirm Disconnect")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Wizard Modal */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  {t("ERPNext Setup Wizard")} • Step {wizardStep} of 4
                </h3>
              </div>
              <button onClick={() => setWizardOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">{t("Step 1: Verify authenticated connection with ERPNext.")}</p>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Host:</span>
                    <span className="text-white font-mono">{url || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">API Key:</span>
                    <span className="text-white font-mono">{apiKey ? `${apiKey.substring(0, 6)}...` : 'Not set'}</span>
                  </div>
                </div>
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
                >
                  {testing ? t("Testing...") : t("Run Connection Test")}
                </button>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">{t("Step 2: Assign Company and Default Warehouses.")}</p>
                <div>
                  <label className="text-slate-400 block mb-1">Company</label>
                  <select
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white"
                  >
                    {meta.companies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Warehouse</label>
                  <select
                    value={defaultWarehouse}
                    onChange={e => setDefaultWarehouse(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-white"
                  >
                    {meta.warehouses.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">{t("Step 3: Choose Synchronization Mode.")}</p>
                <div className="space-y-2">
                  <label 
                    onClick={() => setAutoSyncMode('manual')}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                      autoSyncMode === 'manual' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'border-white/5 text-slate-400'
                    }`}
                  >
                    <input type="radio" checked={autoSyncMode === 'manual'} readOnly />
                    <div>
                      <span className="font-bold block">Manual Mode (Recommended)</span>
                      <span className="text-[10px] text-slate-400">Sync only when user or admin clicks "Sync Now"</span>
                    </div>
                  </label>

                  <label 
                    onClick={() => setAutoSyncMode('auto_15m')}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                      autoSyncMode === 'auto_15m' ? 'bg-indigo-600/10 border-indigo-500 text-white' : 'border-white/5 text-slate-400'
                    }`}
                  >
                    <input type="radio" checked={autoSyncMode === 'auto_15m'} readOnly />
                    <div>
                      <span className="font-bold block">Scheduled Background Sync (15 Minutes)</span>
                      <span className="text-[10px] text-slate-400">Periodically polls and pushes offline queue</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300">{t("Step 4: Configuration Summary & Review.")}</p>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1.5 font-mono text-[11px]">
                  <div>Host: <strong className="text-white">{url}</strong></div>
                  <div>Company: <strong className="text-white">{company}</strong></div>
                  <div>Warehouse: <strong className="text-white">{defaultWarehouse}</strong></div>
                  <div>Sync Mode: <strong className="text-indigo-400">{autoSyncMode.toUpperCase()}</strong></div>
                </div>
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300">
                  Ready to activate! Click Save to apply settings.
                </div>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-white/10">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep(prev => prev - 1)}
                className="px-3 py-1.5 bg-slate-800 disabled:opacity-30 text-white rounded-xl text-xs"
              >
                {t("Back")}
              </button>

              {wizardStep < 4 ? (
                <button
                  onClick={() => setWizardStep(prev => prev + 1)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
                >
                  {t("Next")}
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleSave();
                    setWizardOpen(false);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  {t("Finish & Save")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ModuleRow({
  name,
  enabled,
  direction,
  source,
  onToggle,
  onDirectionChange
}: {
  name: string;
  enabled: boolean;
  direction: SyncDirection;
  source: string;
  onToggle: (en: boolean) => void;
  onDirectionChange: (dir: SyncDirection) => void;
}) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="py-2.5 font-medium text-white">{name}</td>
      <td className="py-2.5">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e => onToggle(e.target.checked)}
          className="rounded border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
        />
      </td>
      <td className="py-2.5">
        <select
          value={direction}
          disabled={!enabled}
          onChange={e => onDirectionChange(e.target.value as SyncDirection)}
          className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white disabled:opacity-30 focus:outline-none"
        >
          <option value="two_way">Two-Way (ERP ↔ Bitvera)</option>
          <option value="erp_to_bitvera">ERPNext → Bitvera</option>
          <option value="bitvera_to_erp">Bitvera → ERPNext</option>
          <option value="disabled">Disabled</option>
        </select>
      </td>
      <td className="py-2.5">
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
          source === 'ERPNext' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
          source === 'Bitvera' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
          'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
        }`}>
          {source}
        </span>
      </td>
    </tr>
  );
}
