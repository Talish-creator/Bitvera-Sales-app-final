import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { MapPin, CheckCircle, Navigation, Play, AlertCircle, RefreshCw, Crosshair } from 'lucide-react';
import { Visit, ViewState } from '../types';
import { getCurrentDeviceLocation, verifyCustomerGeofence, GpsCoordinates } from '../services/location';
import { logAuditEvent } from '../services/audit';

interface RouteScreenProps {
  visits: Visit[];
  onNavigate: (view: ViewState) => void;
  onSelectCustomerForOrder: (customerId: string, customerName: string) => void;
  onUpdateVisitStatus: (visitId: string, status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS') => void;
}

export default function RouteScreen({
  visits,
  onNavigate,
  onSelectCustomerForOrder,
  onUpdateVisitStatus
}: RouteScreenProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [locatingVisitId, setLocatingVisitId] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [visitDistances, setVisitDistances] = useState<Record<string, { distanceKm: number; isWithin: boolean; accuracy: number }>>({});

  // Filter logic
  const filteredVisits = visits.filter((v) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return v.status === 'PENDING' || v.status === 'IN_PROGRESS';
    if (activeTab === 'completed') return v.status === 'COMPLETED';
    return true;
  });

  const completedCount = visits.filter((v) => v.status === 'COMPLETED').length;

  // Real GPS check-in & geofence resolution
  const handleAcquireLocationAndCheckIn = async (visit: Visit) => {
    setLocatingVisitId(visit.id);
    setGpsError(null);

    const locationResult = await getCurrentDeviceLocation(12000);
    setLocatingVisitId(null);

    if (!locationResult.success || !locationResult.coords) {
      setGpsError(locationResult.error || 'Failed to acquire device location.');
      return;
    }

    const coords: GpsCoordinates = locationResult.coords;
    const geoResult = verifyCustomerGeofence(
      coords,
      visit.customer.lat,
      visit.customer.lng,
      visit.geofenceM || 200
    );

    setVisitDistances(prev => ({
      ...prev,
      [visit.id]: {
        distanceKm: geoResult.distanceKm,
        isWithin: geoResult.isWithinGeofence,
        accuracy: coords.accuracy
      }
    }));

    if (!geoResult.accuracyAcceptable) {
      setGpsError(`GPS accuracy is insufficient (±${coords.accuracy}m). Please move outdoors for stronger satellite lock.`);
      return;
    }

    if (!geoResult.isWithinGeofence) {
      setGpsError(`Outside designated geofence! Detected ${geoResult.distanceKm.toFixed(2)} km away. Maximum allowed check-in radius is ${visit.geofenceM || 200} meters.`);
      return;
    }

    // Inside geofence: unlock check-in
    await logAuditEvent('VISIT_CHECKIN', {
      visitId: visit.id,
      customerId: visit.customer.id,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      distanceKm: geoResult.distanceKm
    });

    onUpdateVisitStatus(visit.id, 'IN_PROGRESS');
  };

  const handleStartVisitDirect = (visit: Visit) => {
    onUpdateVisitStatus(visit.id, 'IN_PROGRESS');
  };

  const handleCompleteVisitNoOrder = async (visit: Visit) => {
    await logAuditEvent('VISIT_CHECKOUT', { visitId: visit.id, customerId: visit.customer.id, orderCreated: false });
    onUpdateVisitStatus(visit.id, 'COMPLETED');
  };

  const handleCreateOrder = (visit: Visit) => {
    onSelectCustomerForOrder(visit.customer.id, visit.customer.name);
    onNavigate('create_order');
  };

  return (
    <div className="space-y-6 pb-24 font-sans relative z-10 text-left">
      
      {/* Route Telemetry Header */}
      <div className="flex justify-between items-start bg-slate-900/40 border border-white/10 rounded-2xl p-4 shadow-[0_4px_25px_rgba(0,0,0,0.3)]">
        <div>
          <span className="text-[9px] uppercase tracking-widest text-[#10b981] font-mono block mb-1">{t("Route Sync Active")}</span>
          <h1 className="text-xl font-bold text-white">{t("Today's Route Schedule")}</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">{t("Riyadh North Sector")} • {visits.length} {t("Visits Assigned")}</p>
        </div>
        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          {completedCount} / {visits.length} {t("COMPLETED")}
        </span>
      </div>

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-3 rounded-xl text-xs flex items-start gap-2.5 font-mono shadow-md">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Cyber Glass Tabs Navigation */}
      <div className="grid grid-cols-3 bg-slate-950/60 p-1 rounded-xl border border-white/10 shadow-inner">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 text-xs font-bold text-center rounded-lg cursor-pointer transition-all duration-200 uppercase tracking-widest font-mono ${
            activeTab === 'all'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t("All Units")}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-2 text-xs font-bold text-center rounded-lg cursor-pointer transition-all duration-200 uppercase tracking-widest font-mono ${
            activeTab === 'pending'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t("Pending")}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2 text-xs font-bold text-center rounded-lg cursor-pointer transition-all duration-200 uppercase tracking-widest font-mono ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md border border-indigo-400/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {t("Completed")}
        </button>
      </div>

      {/* Visits Interactive Ledger */}
      <div className="space-y-4">
        {filteredVisits.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/20 border border-white/5 rounded-xl">
            <CheckCircle className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-slate-400 font-mono">{t("No route stops found in this filter.")}</p>
          </div>
        ) : (
          filteredVisits.map((visit) => {
            const isCompleted = visit.status === 'COMPLETED';
            const isCheckingIn = visit.status === 'IN_PROGRESS';
            const distanceInfo = visitDistances[visit.id];
            const isLocatingThis = locatingVisitId === visit.id;

            return (
              <div
                key={visit.id}
                className={`bg-slate-950/40 border rounded-2xl overflow-hidden shadow-[0_12px_35px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                  isCheckingIn
                    ? 'border-indigo-500/60 ring-2 ring-indigo-500/20 bg-slate-900/40'
                    : isCompleted
                    ? 'border-emerald-500/20 bg-emerald-950/5'
                    : 'border-white/10'
                }`}
              >
                {/* Header Cyber Status Bar */}
                <div
                  className={`px-4 py-2.5 border-b flex justify-between items-center text-[10px] uppercase tracking-widest font-mono font-bold ${
                    isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : isCheckingIn
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'bg-slate-900/60 text-slate-400 border-white/5'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isCompleted ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        ✓ {t("Completed & Synced")}
                      </>
                    ) : isCheckingIn ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                        📡 {t("CHECKED IN // IN PROGRESS")}
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        🕰️ {t("Scheduled ETA")} • {visit.time}
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500">{visit.customer.id}</span>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{visit.customer.name}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      GPS: {visit.customer.lat.toFixed(5)}, {visit.customer.lng.toFixed(5)} • Bldg {visit.customer.buildingNumber}
                    </p>
                  </div>

                  {/* Geofence Info box for active/pending item */}
                  {!isCompleted && (
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 space-y-2 font-mono">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 uppercase tracking-widest text-[9px]">{t("Geodesic Boundary")}</span>
                        <span className="font-bold text-white">{visit.geofenceM || 200} {t("meters")}</span>
                      </div>
                      
                      {distanceInfo && (
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                          <span className="text-slate-500 uppercase tracking-widest text-[9px]">{t("Measured Distance")}</span>
                          <span className={`font-bold ${distanceInfo.isWithin ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {distanceInfo.distanceKm < 1 
                              ? `${Math.round(distanceInfo.distanceKm * 1000)} m (${distanceInfo.isWithin ? 'IN RANGE' : 'OUTSIDE'})` 
                              : `${distanceInfo.distanceKm.toFixed(2)} km (OUTSIDE)`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    {isCompleted ? (
                      <button
                        onClick={() => {
                          onSelectCustomerForOrder(visit.customer.id, visit.customer.name);
                          onNavigate('reports');
                        }}
                        className="w-full py-2.5 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />{t("Review Customer History")}
                      </button>
                    ) : isCheckingIn ? (
                      <div className="w-full flex gap-2">
                        <button
                          onClick={() => handleCreateOrder(visit)}
                          className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer border border-white/10"
                        >
                          <Play className="w-3.5 h-3.5" />{t("Create Order")}
                        </button>
                        <button
                          onClick={() => handleCompleteVisitNoOrder(visit)}
                          className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {t("Complete (No Sale)")}
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex gap-2">
                        <button
                          onClick={() => handleAcquireLocationAndCheckIn(visit)}
                          disabled={isLocatingThis}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md select-none border border-white/10 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isLocatingThis ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>{t("Verifying GPS Lock...")}</span>
                            </>
                          ) : (
                            <>
                              <Navigation className="w-3.5 h-3.5" />
                              <span>{t("Check In (GPS Verify)")}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleStartVisitDirect(visit)}
                          className="px-3.5 py-2.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer font-mono bg-slate-900 border-white/10 hover:bg-slate-800 text-slate-300"
                          title={t("Manual check-in override for authorized field reps")}
                        >
                          <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{t("Manual")}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
