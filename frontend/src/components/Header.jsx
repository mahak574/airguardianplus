import React from 'react';
import { MapPin, Navigation, RefreshCw, Wind } from 'lucide-react';

export default function Header({ locationName, coords, onOpenLocationModal, onRefresh, loading }) {
  return (
    <header className="sticky top-0 z-30 bg-canvas-card/90 backdrop-blur-md border-b border-canvas-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-700 text-canvas-card flex items-center justify-center shadow-soft-sm">
            <Wind className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-forest-900 tracking-tight">
                AirGuardian<span className="text-terracotta-500 font-sans">+</span>
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-forest-50 text-forest-700 border border-forest-200">
                Atmospheric Intelligence
              </span>
            </div>
            <p className="text-xs text-charcoal-400 font-medium">
              Real-Time Pollution Monitoring & ML Forecasting
            </p>
          </div>
        </div>

        {/* Location & Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Location button */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-canvas text-charcoal-800 border border-canvas-border hover:border-terracotta-200 hover:bg-terracotta-50/40 transition-all text-xs font-semibold shadow-soft-sm group"
            title="Click to change location or enter coordinates"
          >
            <MapPin className="w-3.5 h-3.5 text-terracotta-500 group-hover:scale-110 transition-transform" />
            <span className="max-w-[200px] truncate">{locationName || 'Detecting Location...'}</span>
            <span className="text-[10px] font-mono text-charcoal-400 font-normal">
              {coords.lat.toFixed(2)}, {coords.lon.toFixed(2)}
            </span>
          </button>

          {/* Quick Change Location Trigger */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-700 text-canvas-card hover:bg-forest-800 transition-colors text-xs font-medium shadow-soft-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-canvas border border-canvas-border hover:bg-canvas-subtle transition-colors text-charcoal-600 disabled:opacity-50"
            title="Refresh weather and AQI"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-terracotta-500' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
