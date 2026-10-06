import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, MapPin, Navigation, Clock, CheckCircle2, 
  ArrowUpDown, ChevronUp, ChevronDown, Compass, Play, Plus, RefreshCw 
} from 'lucide-react';
import { ViewState, Customer, Visit } from '../types';
import { getCustomers, getVisits } from '../services/storage';
import { optimizeCustomerRoute, recalculateCustomRoute, OptimizedRoutePlan } from '../services/routeOptimizer';
import { useLanguage } from '../context/LanguageContext';

interface RouteOptimizationScreenProps {
  onNavigate: (view: ViewState) => void;
  onSelectCustomerForOrder?: (id: string, name: string) => void;
}

export default function RouteOptimizationScreen({
  onNavigate,
  onSelectCustomerForOrder
}: RouteOptimizationScreenProps) {
  const { t } = useLanguage();
  const allCustomers = useMemo(() => getCustomers(), []);
  const visits = useMemo(() => getVisits(), []);

  // Selection set of customer IDs to include in route
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>(() => {
    return allCustomers.slice(0, 4).map(c => c.id);
  });

  const [routePlan, setRoutePlan] = useState<OptimizedRoutePlan | null>(() => {
    const initialStops = allCustomers.slice(0, 4).map(c => ({
      customer: c,
      status: (visits.find(v => v.customer.id === c.id)?.status || 'PENDING') as Visit['status']
    }));
    return optimizeCustomerRoute(initialStops);
  });

  const handleToggleCustomer = (id: string) => {
    setSelectedCustomerIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      return next;
    });
  };

  const handleRunOptimization = () => {
    const stopsToOptimize = allCustomers
      .filter(c => selectedCustomerIds.includes(c.id))
      .map(c => ({
        customer: c,
        status: (visits.find(v => v.customer.id === c.id)?.status || 'PENDING') as Visit['status']
      }));

    const result = optimizeCustomerRoute(stopsToOptimize);
    setRoutePlan(result);
  };

  const handleMoveStop = (index: number, direction: 'UP' | 'DOWN') => {
    if (!routePlan) return;
    const stops = [...routePlan.stops];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;

    const temp = stops[index];
    stops[index] = stops[targetIndex];
    stops[targetIndex] = temp;

    const stopsParam = stops.map(s => ({
      customer: s.customer,
      status: s.visitStatus
    }));

    const recalculated = recalculateCustomRoute(stopsParam);
    setRoutePlan(recalculated);
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              {t("Route Optimization Engine")}
            </h1>
            <p className="text-xs text-slate-400">{t("Geodesic TSP Shortest-Path Itinerary Planning")}</p>
          </div>
        </div>

        <button
          onClick={handleRunOptimization}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          {t("Compute Optimal Route")}
        </button>
      </div>

      {/* Itinerary Metrics HUD Bar */}
      {routePlan && (
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-5 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Total Distance")}</span>
            <span className="text-lg font-mono font-bold text-[#10b981] mt-0.5 block">
              {routePlan.totalDistanceKm} km
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Transit Drive Time")}</span>
            <span className="text-lg font-mono font-bold text-indigo-400 mt-0.5 block">
              ~{routePlan.totalEstimatedDriveMinutes} min
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("On-site Service Time")}</span>
            <span className="text-lg font-mono font-bold text-white mt-0.5 block">
              ~{routePlan.totalEstimatedServiceMinutes} min
            </span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">{t("Total Schedule")}</span>
            <span className="text-lg font-mono font-bold text-amber-400 mt-0.5 block">
              ~{Math.round(routePlan.totalDurationMinutes / 60 * 10) / 10} hrs
            </span>
          </div>
        </div>
      )}

      {/* Main Layout: Selected Stops Sequence vs Customer Selection Picker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Customer Stop Picker Sidebar */}
        <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-4 space-y-3 shadow-lg">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white border-b border-white/10 pb-2">
            {t("Select Stops to Include")} ({selectedCustomerIds.length})
          </h3>

          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
            {allCustomers.map((cust) => {
              const isSelected = selectedCustomerIds.includes(cust.id);
              return (
                <div
                  key={cust.id}
                  onClick={() => handleToggleCustomer(cust.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all text-xs ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div>
                    <strong className="block leading-snug">{cust.name}</strong>
                    <span className="text-[10px] font-mono text-slate-500">{cust.id} • {cust.territory || 'Riyadh'}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Ordered Route Stops Itinerary (2 cols wide) */}
        <div className="md:col-span-2 bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              {t("Optimized Stop-by-Stop Itinerary")}
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Origin: {routePlan?.startingLocation.label}
            </span>
          </div>

          <div className="space-y-3">
            {routePlan?.stops.map((stop, idx) => (
              <div
                key={stop.customer.id}
                className="bg-slate-900/80 border border-white/10 hover:border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-md group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-[#10b981] border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    #{stop.stopNumber}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">
                      {stop.customer.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      {stop.customer.id} • Building {stop.customer.buildingNumber}, Riyadh
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-slate-500">
                      <span>Leg: <strong className="text-emerald-400">{stop.distanceFromPreviousKm} km</strong></span>
                      <span>Transit: <strong className="text-indigo-300">~{stop.estimatedTravelMinutes} min</strong></span>
                    </div>
                  </div>
                </div>

                {/* Reorder and Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveStop(idx, 'UP')}
                    className="p-1.5 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-20 rounded-lg cursor-pointer"
                    title={t("Move Stop Earlier")}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={idx === (routePlan.stops.length - 1)}
                    onClick={() => handleMoveStop(idx, 'DOWN')}
                    className="p-1.5 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-20 rounded-lg cursor-pointer"
                    title={t("Move Stop Later")}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (onSelectCustomerForOrder) onSelectCustomerForOrder(stop.customer.id, stop.customer.name);
                      onNavigate('today_route');
                    }}
                    className="px-2.5 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-all"
                  >
                    Check In
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
