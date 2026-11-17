import React, { useState } from 'react';
import { X, MapPin, Compass, Navigation, AlertCircle, Check } from 'lucide-react';

const PRESET_LOCATIONS = [
  { name: 'New Delhi', state: 'Delhi, India', lat: 28.6139, lon: 77.2090 },
  { name: 'Sonipat (DCRUST)', state: 'Haryana, India', lat: 28.9845, lon: 77.0178 },
  { name: 'Amritsar', state: 'Punjab, India', lat: 31.6340, lon: 74.8723 },
  { name: 'Mumbai', state: 'Maharashtra, India', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', state: 'Karnataka, India', lat: 12.9716, lon: 77.5946 },
  { name: 'London', state: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', state: 'United States', lat: 40.7128, lon: -74.0060 },
  { name: 'Tokyo', state: 'Japan', lat: 35.6762, lon: 139.6503 },
];

export default function LocationModal({ isOpen, onClose, currentCoords, onSelectLocation }) {
  const [latInput, setLatInput] = useState(currentCoords.lat.toString());
  const [lonInput, setLonInput] = useState(currentCoords.lon.toString());
  const [geoError, setGeoError] = useState('');
  const [detecting, setDetecting] = useState(false);

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setGeoError('');
    const lat = parseFloat(latInput.trim());
    const lon = parseFloat(lonInput.trim());

    if (isNaN(lat) || isNaN(lon)) {
      setGeoError('Please enter valid numeric coordinates for latitude and longitude.');
      return;
    }
    if (lat < -90 || lat > 90) {
      setGeoError('Latitude must be between -90 and 90 degrees.');
      return;
    }
    if (lon < -180 || lon > 180) {
      setGeoError('Longitude must be between -180 and 180 degrees.');
      return;
    }
    if (lat === 0 && lon === 0) {
      setGeoError('0.0, 0.0 is not a valid inhabited coordinate. Please enter your real position.');
      return;
    }

    onSelectLocation(lat, lon);
    onClose();
  };

  const handleDetectGPS = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLatInput(lat.toFixed(4));
        setLonInput(lon.toFixed(4));
        onSelectLocation(lat, lon);
        onClose();
      },
      (err) => {
        setDetecting(false);
        let msg = 'Unable to retrieve location.';
        if (err.code === 1) msg = 'Location access was denied. Please enter coordinates manually below.';
        else if (err.code === 2) msg = 'Location position unavailable. Try manual entry.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again.';
        setGeoError(msg);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handlePresetClick = (preset) => {
    setLatInput(preset.lat.toString());
    setLonInput(preset.lon.toString());
    onSelectLocation(preset.lat, preset.lon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-800/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-canvas-card rounded-2xl border border-canvas-border shadow-soft-lg p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-canvas-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-terracotta-50 text-terracotta-600 flex items-center justify-center border border-terracotta-200">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-forest-900 font-serif">Set Your Location</h3>
              <p className="text-xs text-charcoal-400">Detect via GPS, choose presets, or enter coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-800 hover:bg-canvas transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notice */}
        {geoError && (
          <div className="mt-4 p-3 rounded-xl bg-terracotta-50 border border-terracotta-200 flex items-start gap-2.5 text-xs text-terracotta-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-terracotta-600" />
            <span>{geoError}</span>
          </div>
        )}

        {/* Auto Detect Button */}
        <div className="mt-5">
          <button
            onClick={handleDetectGPS}
            disabled={detecting}
            className="w-full py-2.5 px-4 rounded-xl bg-forest-700 hover:bg-forest-800 text-canvas-card font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-soft-sm disabled:opacity-60"
          >
            <Navigation className={`w-4 h-4 text-emerald-200 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? 'Requesting GPS coordinates...' : '📍 Detect My Location Automatically'}</span>
          </button>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-canvas-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-canvas-card text-charcoal-400 font-medium">Or enter manual coordinates</span>
          </div>
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-600 mb-1">
                Latitude (°N)
              </label>
              <input
                type="text"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                placeholder="e.g. 28.6139"
                className="w-full px-3 py-2 rounded-lg bg-canvas border border-canvas-border focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 text-xs font-mono text-charcoal-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-600 mb-1">
                Longitude (°E)
              </label>
              <input
                type="text"
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                placeholder="e.g. 77.2090"
                className="w-full px-3 py-2 rounded-lg bg-canvas border border-canvas-border focus:outline-none focus:ring-2 focus:ring-terracotta-500/20 focus:border-terracotta-500 text-xs font-mono text-charcoal-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-canvas-card font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-soft-sm"
          >
            <Check className="w-4 h-4" />
            <span>Apply Coordinates</span>
          </button>
        </form>

        {/* Preset Locations */}
        <div className="mt-5 pt-4 border-t border-canvas-border">
          <p className="text-xs font-semibold text-charcoal-600 mb-2.5">Popular Regions & Cities:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_LOCATIONS.map((preset) => {
              const isSelected =
                Math.abs(preset.lat - currentCoords.lat) < 0.05 &&
                Math.abs(preset.lon - currentCoords.lon) < 0.05;
              return (
                <button
                  key={preset.name}
                  onClick={() => handlePresetClick(preset)}
                  className={`p-2 rounded-lg text-left text-xs transition-all border ${
                    isSelected
                      ? 'bg-forest-50 border-forest-300 text-forest-800 font-semibold'
                      : 'bg-canvas border-canvas-border hover:bg-canvas-subtle text-charcoal-700'
                  }`}
                >
                  <p className="font-medium truncate">{preset.name}</p>
                  <p className="text-[10px] text-charcoal-400 truncate">{preset.state.split(',')[0]}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
